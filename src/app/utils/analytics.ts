import { getAllRatings, type Rating } from "./ratings";

export interface PodcastAnalytics {
  podcastId: string;
  podcastTitle: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  lastRatingDate: number | null;
}

export interface OverallAnalytics {
  totalRatings: number;
  totalPodcasts: number;
  averageRating: number;
  mostPopularPodcast: {
    id: string;
    title: string;
    ratingsCount: number;
  } | null;
  highestRatedPodcast: {
    id: string;
    title: string;
    rating: number;
  } | null;
}

const podcasts = [
  {
    id: "1",
    title: "Литературные предпочтения молодежи",
  },
  {
    id: "2",
    title: "Пока пусто",
  },
  {
    id: "3",
    title: "Пока пусто",
  },
];

// Получить аналитику для конкретного подкаста
export const getPodcastAnalytics = async (podcastId: string): Promise<PodcastAnalytics> => {
  const allRatings = await getAllRatings();
  const ratings = allRatings.filter((r) => r.podcastId === podcastId);
  const podcast = podcasts.find((p) => p.id === podcastId);

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratings.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    }
  });

  const totalRatings = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

  const lastRatingDate =
    ratings.length > 0 ? Math.max(...ratings.map((r) => r.timestamp)) : null;

  return {
    podcastId,
    podcastTitle: podcast?.title || `Подкаст ${podcastId}`,
    totalRatings,
    averageRating,
    ratingDistribution,
    lastRatingDate,
  };
};

// Получить общую аналитику по всем подкастам
export const getOverallAnalytics = async (): Promise<OverallAnalytics> => {
  const allRatings = await getAllRatings();
  const podcastAnalytics = await Promise.all(podcasts.map((p) => getPodcastAnalytics(p.id)));

  const totalRatings = allRatings.length;
  const totalSum = allRatings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalRatings > 0 ? Math.round((totalSum / totalRatings) * 10) / 10 : 0;

  const mostPopular = podcastAnalytics.reduce(
    (max, p) => (p.totalRatings > (max?.ratingsCount || 0) ? {
      id: p.podcastId,
      title: p.podcastTitle,
      ratingsCount: p.totalRatings,
    } : max),
    null as { id: string; title: string; ratingsCount: number } | null
  );

  const highestRated = podcastAnalytics
    .filter((p) => p.totalRatings > 0)
    .reduce(
      (max, p) => (p.averageRating > (max?.rating || 0) ? {
        id: p.podcastId,
        title: p.podcastTitle,
        rating: p.averageRating,
      } : max),
      null as { id: string; title: string; rating: number } | null
    );

  return {
    totalRatings,
    totalPodcasts: podcasts.length,
    averageRating,
    mostPopularPodcast: mostPopular && mostPopular.ratingsCount > 0 ? mostPopular : null,
    highestRatedPodcast: highestRated,
  };
};

// Получить данные для графика сравнения подкастов
export const getComparisonChartData = async () => {
  const podcastAnalytics = await Promise.all(podcasts.map((p) => getPodcastAnalytics(p.id)));

  return podcastAnalytics.map((analytics, index) => ({
    name: podcasts[index].title.length > 20 ? podcasts[index].title.substring(0, 17) + "..." : podcasts[index].title,
    fullName: podcasts[index].title,
    рейтинг: analytics.averageRating,
    "кол-во оценок": analytics.totalRatings,
  }));
};

// Получить данные для графика распределения оценок
export const getRatingDistributionData = async () => {
  const allRatings = await getAllRatings();
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  allRatings.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as keyof typeof distribution]++;
    }
  });

  return [
    { stars: "1 ★", count: distribution[1], fill: "#ef4444" },
    { stars: "2 ★★", count: distribution[2], fill: "#f97316" },
    { stars: "3 ★★★", count: distribution[3], fill: "#eab308" },
    { stars: "4 ★★★★", count: distribution[4], fill: "#84cc16" },
    { stars: "5 ★★★★★", count: distribution[5], fill: "#22c55e" },
  ];
};

// Получить тренд оценок за последние дни
export const getRatingsTrend = async (days: number = 7) => {
  const allRatings = await getAllRatings();
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const trendData = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i + 1) * dayInMs;
    const dayEnd = now - i * dayInMs;

    const dayRatings = allRatings.filter(
      (r) => r.timestamp >= dayStart && r.timestamp < dayEnd
    );

    const date = new Date(dayEnd);
    const dayName = date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });

    const sum = dayRatings.reduce((acc, r) => acc + r.rating, 0);
    const average = dayRatings.length > 0 ? Math.round((sum / dayRatings.length) * 10) / 10 : 0;

    trendData.push({
      date: dayName,
      "Средний рейтинг": average,
      "Количество": dayRatings.length,
    });
  }

  return trendData;
};
