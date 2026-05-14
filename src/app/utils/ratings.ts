import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Rating {
  userId: string;
  podcastId: string;
  rating: number;
  timestamp: number;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-055f6039`;

// Сохранить оценку пользователя для подкаста
export const saveRating = async (userId: string, podcastId: string, rating: number): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Saving rating: userId=${userId}, podcastId=${podcastId}, rating=${rating}`);
    const response = await fetch(`${API_BASE_URL}/ratings/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ userId, podcastId, rating }),
    });

    const data = await response.json();
    console.log('Save rating response:', data);

    if (!data.success) {
      console.log(`Save rating error: ${data.message}`);
    }

    return data;
  } catch (error) {
    console.log(`Save rating API error: ${error}`);
    return { success: false, message: `${error}` };
  }
};

// Получить оценку пользователя для конкретного подкаста
export const getUserRating = async (userId: string, podcastId: string): Promise<number | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ratings/${userId}/${podcastId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.rating;
    }

    return null;
  } catch (error) {
    console.log(`Get user rating API error: ${error}`);
    return null;
  }
};

// Получить средний рейтинг подкаста
export const getAverageRating = async (podcastId: string): Promise<{ average: number; count: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ratings/average/${podcastId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return { average: data.average, count: data.count };
    }

    return { average: 0, count: 0 };
  } catch (error) {
    console.log(`Get average rating API error: ${error}`);
    return { average: 0, count: 0 };
  }
};

// Получить все рейтинги (для аналитики)
export const getAllRatings = async (): Promise<Rating[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ratings/all`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.ratings;
    }

    return [];
  } catch (error) {
    console.log(`Get all ratings API error: ${error}`);
    return [];
  }
};
