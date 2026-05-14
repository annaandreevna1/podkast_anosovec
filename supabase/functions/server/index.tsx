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

// ============================================================
// PODCAST REVIEWS ENDPOINTS
// ============================================================

// Add podcast review
app.post("/make-server-055f6039/podcast-reviews/add", async (c) => {
  try {
    const { userId, userName, podcastId, reviewText, rating } = await c.req.json();

    if (!userId || !userName || !podcastId || !reviewText || !rating) {
      return c.json({ success: false, message: "Все поля обязательны" }, 400);
    }

    if (rating < 1 || rating > 5) {
      return c.json({ success: false, message: "Рейтинг должен быть от 1 до 5" }, 400);
    }

    const reviewsData = await kv.get("podcast_reviews");
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    // Check if user already reviewed this podcast
    const existingReview = reviews.find(
      (r: any) => r.userId === userId && r.podcastId === podcastId
    );
    if (existingReview) {
      return c.json({ success: false, message: "Вы уже оставили отзыв к этому подкасту" }, 400);
    }

    const newReview = {
      id: Date.now().toString(),
      userId,
      userName,
      podcastId,
      reviewText,
      rating,
      timestamp: Date.now(),
    };

    reviews.push(newReview);
    await kv.set("podcast_reviews", JSON.stringify(reviews));

    return c.json({ success: true, message: "Отзыв успешно добавлен" });
  } catch (error) {
    console.log(`Add podcast review error: ${error}`);
    return c.json({ success: false, message: `Ошибка добавления отзыва: ${error}` }, 500);
  }
});

// Get reviews for a podcast
app.get("/make-server-055f6039/podcast-reviews/:podcastId", async (c) => {
  try {
    const podcastId = c.req.param("podcastId");

    const reviewsData = await kv.get("podcast_reviews");
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    const podcastReviews = reviews.filter((r: any) => r.podcastId === podcastId);
    // Sort by timestamp (newest first)
    podcastReviews.sort((a: any, b: any) => b.timestamp - a.timestamp);

    return c.json({ success: true, reviews: podcastReviews });
  } catch (error) {
    console.log(`Get podcast reviews error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения отзывов: ${error}` }, 500);
  }
});

// Check if user has reviewed a podcast
app.get("/make-server-055f6039/podcast-reviews/check/:userId/:podcastId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const podcastId = c.req.param("podcastId");

    const reviewsData = await kv.get("podcast_reviews");
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    const hasReviewed = reviews.some(
      (r: any) => r.userId === userId && r.podcastId === podcastId
    );

    return c.json({ success: true, hasReviewed });
  } catch (error) {
    console.log(`Check podcast review error: ${error}`);
    return c.json({ success: false, message: `Ошибка проверки отзыва: ${error}` }, 500);
  }
});

// ============================================================
// PODCASTS MANAGEMENT ENDPOINTS (ADMIN ONLY)
// ============================================================

// Get all podcasts
app.get("/make-server-055f6039/podcasts/all", async (c) => {
  try {
    const podcastsData = await kv.get("podcasts");
    const podcasts = podcastsData ? JSON.parse(podcastsData) : [];

    return c.json({ success: true, podcasts });
  } catch (error) {
    console.log(`Get all podcasts error: ${error}`);
    return c.json({ success: false, message: `Ошибка получения подкастов: ${error}` }, 500);
  }
});

// Add new podcast (admin only)
app.post("/make-server-055f6039/podcasts/add", async (c) => {
  try {
    const { title, host, description, fullDescription, duration, publishDate, image, videoUrl, videoType } = await c.req.json();

    if (!title || !host || !description) {
      return c.json({ success: false, message: "Название, ведущий и описание обязательны" }, 400);
    }

    const podcastsData = await kv.get("podcasts");
    const podcasts = podcastsData ? JSON.parse(podcastsData) : [];

    const newPodcast = {
      id: Date.now().toString(),
      title,
      host,
      description,
      fullDescription: fullDescription || description,
      duration: duration || "0 мин",
      publishDate: publishDate || new Date().toLocaleDateString("ru-RU"),
      image: image || "https://images.unsplash.com/photo-1533379007656-3a10925da2e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9hZGNhc3RpbmclMjBoZWFkcGhvbmVzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MTg0NTY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      videoUrl: videoUrl || "",
      videoType: videoType || "mp4",
    };

    podcasts.push(newPodcast);
    await kv.set("podcasts", JSON.stringify(podcasts));

    return c.json({ success: true, message: "Подкаст успешно добавлен", podcast: newPodcast });
  } catch (error) {
    console.log(`Add podcast error: ${error}`);
    return c.json({ success: false, message: `Ошибка добавления подкаста: ${error}` }, 500);
  }
});

// Update podcast (admin only)
app.put("/make-server-055f6039/podcasts/update/:id", async (c) => {
  try {
    const podcastId = c.req.param("id");
    const updates = await c.req.json();

    const podcastsData = await kv.get("podcasts");
    const podcasts = podcastsData ? JSON.parse(podcastsData) : [];

    const podcastIndex = podcasts.findIndex((p: any) => p.id === podcastId);

    if (podcastIndex === -1) {
      return c.json({ success: false, message: "Подкаст не найден" }, 404);
    }

    podcasts[podcastIndex] = { ...podcasts[podcastIndex], ...updates };
    await kv.set("podcasts", JSON.stringify(podcasts));

    return c.json({ success: true, message: "Подкаст успешно обновлён", podcast: podcasts[podcastIndex] });
  } catch (error) {
    console.log(`Update podcast error: ${error}`);
    return c.json({ success: false, message: `Ошибка обновления подкаста: ${error}` }, 500);
  }
});

// Delete podcast (admin only)
app.delete("/make-server-055f6039/podcasts/delete/:id", async (c) => {
  try {
    const podcastId = c.req.param("id");

    const podcastsData = await kv.get("podcasts");
    const podcasts = podcastsData ? JSON.parse(podcastsData) : [];

    const filteredPodcasts = podcasts.filter((p: any) => p.id !== podcastId);

    if (filteredPodcasts.length === podcasts.length) {
      return c.json({ success: false, message: "Подкаст не найден" }, 404);
    }

    await kv.set("podcasts", JSON.stringify(filteredPodcasts));

    return c.json({ success: true, message: "Подкаст успешно удалён" });
  } catch (error) {
    console.log(`Delete podcast error: ${error}`);
    return c.json({ success: false, message: `Ошибка удаления подкаста: ${error}` }, 500);
  }
});

// Delete podcast review (admin only)
app.delete("/make-server-055f6039/podcast-reviews/delete/:id", async (c) => {
  try {
    const reviewId = c.req.param("id");

    const reviewsData = await kv.get("podcast_reviews");
    const reviews = reviewsData ? JSON.parse(reviewsData) : [];

    const filteredReviews = reviews.filter((r: any) => r.id !== reviewId);

    if (filteredReviews.length === reviews.length) {
      return c.json({ success: false, message: "Отзыв не найден" }, 404);
    }

    await kv.set("podcast_reviews", JSON.stringify(filteredReviews));

    return c.json({ success: true, message: "Отзыв успешно удалён" });
  } catch (error) {
    console.log(`Delete review error: ${error}`);
    return c.json({ success: false, message: `Ошибка удаления отзыва: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);