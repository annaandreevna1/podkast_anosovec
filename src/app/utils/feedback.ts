import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  hasProblems: boolean;
  problems: string;
  recommendations: string;
  rating: number;
  timestamp: number;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-055f6039`;

// Получить все отзывы
export const getAllFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/all`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.feedback;
    }

    return [];
  } catch (error) {
    console.log(`Get all feedback API error: ${error}`);
    return [];
  }
};

// Добавить новый отзыв
export const addFeedback = async (
  userId: string,
  userName: string,
  userEmail: string,
  hasProblems: boolean,
  problems: string,
  recommendations: string,
  rating: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        userName,
        userEmail,
        hasProblems,
        problems,
        recommendations,
        rating,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Add feedback API error: ${error}`);
    return { success: false, message: `Ошибка добавления отзыва: ${error}` };
  }
};

// Проверить, оставлял ли пользователь отзыв
export const hasUserSubmittedFeedback = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/check/${userId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.hasSubmitted;
    }

    return false;
  } catch (error) {
    console.log(`Check feedback API error: ${error}`);
    return false;
  }
};

// Получить статистику отзывов
export const getFeedbackStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.stats;
    }

    return {
      total: 0,
      averageRating: 0,
      withProblems: 0,
      withoutProblems: 0,
    };
  } catch (error) {
    console.log(`Get feedback stats API error: ${error}`);
    return {
      total: 0,
      averageRating: 0,
      withProblems: 0,
      withoutProblems: 0,
    };
  }
};
