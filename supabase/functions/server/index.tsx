import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-055f6039/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================================
// USER ENDPOINTS
// ============================================================

// Register new user
app.post("/make-server-055f6039/auth/register", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json({ success: false, message: "Все поля обязательны" }, 400);
    }

    // Get all users
    const usersData = await kv.get("users");
    const users = usersData ? JSON.parse(usersData) : [];

    // Check if user already exists
    const existingUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return c.json(
        { success: false, message: "Пользователь с таким email уже существует" },
        400
      );
    }

    // First user becomes admin
    const isFirstUser = users.length === 0;

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      fullName,
      isAdmin: isFirstUser,
    };

    users.push(newUser);
    await kv.set("users", JSON.stringify(users));

    return c.json({
      success: true,
      message: "Регистрация успешна",
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.log(`Registration error: ${error}`);
    return c.json({ success: false, message: `Ошибка регистрации: ${error}` }, 500);
  }
});

// Login user
app.post("/make-server-055f6039/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, message: "Email и пароль обязательны" }, 400);
    }

    const usersData = await kv.get("users");
    const users = usersData ? JSON.parse(usersData) : [];

    const user = users.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return c.json({ success: false, message: "Неверный email или пароль" }, 401);
    }

    return c.json({
      success: true,
      message: "Вход выполнен успешно",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log(`Login error: ${error}`);
    return c.json({ success: false, message: `Ошибка входа: ${error}` }, 500);
  }
});

// Get user by ID
app.get("/make-server-055f6039/auth/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const usersData = await kv.get("users");
    const users = usersData ? JSON.parse(usersData) : [];

    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return c.json({ success: false, message: "Пользователь не найден" }, 404);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения пользователя: ${error}` }, 500);
  }
});

// ============================================================
// RATINGS ENDPOINTS
// ============================================================

// Save or update rating
app.post("/make-server-055f6039/ratings/save", async (c) => {
  try {
    const { userId, podcastId, rating } = await c.req.json();

    if (!userId || !podcastId || !rating) {
      return c.json({ success: false, message: "Все поля обязательны" }, 400);
    }

    if (rating < 1 || rating > 5) {
      return c.json({ success: false, message: "Рейтинг должен быть от 1 до 5" }, 400);
    }

    const ratingsData = await kv.get("ratings");
    const ratings = ratingsData ? JSON.parse(ratingsData) : [];

    const existingRatingIndex = ratings.findIndex(
      (r: any) => r.userId === userId && r.podcastId === podcastId
    );

    const newRating = {
      userId,
      podcastId,
      rating,
      timestamp: Date.now(),
    };

    if (existingRatingIndex !== -1) {
      ratings[existingRatingIndex] = newRating;
    } else {
      ratings.push(newRating);
    }

    await kv.set("ratings", JSON.stringify(ratings));

    return c.json({ success: true, message: "Рейтинг сохранён" });
  } catch (error) {
    console.log(`Save rating error: ${error}`);
    return c.json({ success: false, message: `Ошибка сохранения рейтинга: ${error}` }, 500);
  }
});

// Get user rating for a podcast
app.get("/make-server-055f6039/ratings/:userId/:podcastId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const podcastId = c.req.param("podcastId");

    const ratingsData = await kv.get("ratings");
    const ratings = ratingsData ? JSON.parse(ratingsData) : [];

    const userRating = ratings.find(
      (r: any) => r.userId === userId && r.podcastId === podcastId
    );

    return c.json({
      success: true,
      rating: userRating ? userRating.rating : null,
    });
  } catch (error) {
    console.log(`Get user rating error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения рейтинга: ${error}` }, 500);
  }
});

// Get average rating for a podcast
app.get("/make-server-055f6039/ratings/average/:podcastId", async (c) => {
  try {
    const podcastId = c.req.param("podcastId");

    const ratingsData = await kv.get("ratings");
    const ratings = ratingsData ? JSON.parse(ratingsData) : [];

    const podcastRatings = ratings.filter((r: any) => r.podcastId === podcastId);

    if (podcastRatings.length === 0) {
      return c.json({ success: true, average: 0, count: 0 });
    }

    const sum = podcastRatings.reduce((acc: number, r: any) => acc + r.rating, 0);
    const average = sum / podcastRatings.length;

    return c.json({
      success: true,
      average: Math.round(average * 10) / 10,
      count: podcastRatings.length,
    });
  } catch (error) {
    console.log(`Get average rating error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения среднего рейтинга: ${error}` }, 500);
  }
});

// Get all ratings (for analytics)
app.get("/make-server-055f6039/ratings/all", async (c) => {
  try {
    const ratingsData = await kv.get("ratings");
    const ratings = ratingsData ? JSON.parse(ratingsData) : [];

    return c.json({ success: true, ratings });
  } catch (error) {
    console.log(`Get all ratings error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения всех рейтингов: ${error}` }, 500);
  }
});

// ============================================================
// FEEDBACK ENDPOINTS
// ============================================================

// Add new feedback
app.post("/make-server-055f6039/feedback/add", async (c) => {
  try {
    const { userId, userName, userEmail, hasProblems, problems, recommendations, rating } = await c.req.json();

    if (!userId || !userName || !userEmail || !recommendations || !rating) {
      return c.json({ success: false, message: "Обязательные поля не заполнены" }, 400);
    }

    if (hasProblems && !problems) {
      return c.json({ success: false, message: "Опишите проблемы" }, 400);
    }

    const feedbackData = await kv.get("feedback");
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];

    // Check if user already submitted feedback
    const existingFeedback = feedback.find((f: any) => f.userId === userId);
    if (existingFeedback) {
      return c.json({ success: false, message: "Вы уже оставили отзыв" }, 400);
    }

    const newFeedback = {
      id: Date.now().toString(),
      userId,
      userName,
      userEmail,
      hasProblems,
      problems,
      recommendations,
      rating,
      timestamp: Date.now(),
    };

    feedback.push(newFeedback);
    await kv.set("feedback", JSON.stringify(feedback));

    return c.json({ success: true, message: "Отзыв успешно добавлен" });
  } catch (error) {
    console.log(`Add feedback error: ${error}`);
    return c.json({ success: false, message: `Ошибка добавления отзыва: ${error}` }, 500);
  }
});

// Get all feedback
app.get("/make-server-055f6039/feedback/all", async (c) => {
  try {
    const feedbackData = await kv.get("feedback");
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];

    return c.json({ success: true, feedback });
  } catch (error) {
    console.log(`Get all feedback error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения отзывов: ${error}` }, 500);
  }
});

// Check if user has submitted feedback
app.get("/make-server-055f6039/feedback/check/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const feedbackData = await kv.get("feedback");
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];

    const userFeedback = feedback.find((f: any) => f.userId === userId);

    return c.json({
      success: true,
      hasSubmitted: !!userFeedback,
    });
  } catch (error) {
    console.log(`Check feedback error: ${error}`);
    return c.json({ success: false, message: `Ошибка проверки отзыва: ${error}` }, 500);
  }
});

// Get feedback stats
app.get("/make-server-055f6039/feedback/stats", async (c) => {
  try {
    const feedbackData = await kv.get("feedback");
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];

    if (feedback.length === 0) {
      return c.json({
        success: true,
        stats: {
          total: 0,
          averageRating: 0,
          withProblems: 0,
          withoutProblems: 0,
        },
      });
    }

    const totalRating = feedback.reduce((sum: number, f: any) => sum + f.rating, 0);
    const withProblems = feedback.filter((f: any) => f.hasProblems).length;

    return c.json({
      success: true,
      stats: {
        total: feedback.length,
        averageRating: Math.round((totalRating / feedback.length) * 10) / 10,
        withProblems,
        withoutProblems: feedback.length - withProblems,
      },
    });
  } catch (error) {
    console.log(`Get feedback stats error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения статистики: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);