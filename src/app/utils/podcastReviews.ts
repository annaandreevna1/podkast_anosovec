import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface PodcastReview {
  id: string;
  userId: string;
  userName: string;
  podcastId: string;
  reviewText: string;
  rating: number;
  timestamp: number;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-055f6039`;

// Добавить отзыв к подкасту
export const addPodcastReview = async (
  userId: string,
  userName: string,
  podcastId: string,
  reviewText: string,
  rating: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcast-reviews/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        userName,
        podcastId,
        reviewText,
        rating,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Add podcast review API error: ${error}`);
    return { success: false, message: `Ошибка добавления отзыва: ${error}` };
  }
};

// Получить все отзывы для подкаста
export const getPodcastReviews = async (podcastId: string): Promise<PodcastReview[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcast-reviews/${podcastId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.reviews;
    }

    return [];
  } catch (error) {
    console.log(`Get podcast reviews API error: ${error}`);
    return [];
  }
};

// Проверить, оставил ли пользователь отзыв к подкасту
export const hasUserReviewedPodcast = async (userId: string, podcastId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcast-reviews/check/${userId}/${podcastId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.hasReviewed;
    }

    return false;
  } catch (error) {
    console.log(`Check podcast review API error: ${error}`);
    return false;
  }
};
