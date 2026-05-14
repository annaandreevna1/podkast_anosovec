import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  fullDescription: string;
  duration: string;
  publishDate: string;
  image: string;
  videoUrl: string;
  videoType: string;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-055f6039`;

// Получить все подкасты
export const getAllPodcasts = async (): Promise<Podcast[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/all`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.podcasts;
    }

    return [];
  } catch (error) {
    console.log(`Get all podcasts API error: ${error}`);
    return [];
  }
};

// Добавить подкаст
export const addPodcast = async (podcast: Omit<Podcast, 'id'>): Promise<{ success: boolean; message: string; podcast?: Podcast }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(podcast),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Add podcast API error: ${error}`);
    return { success: false, message: `Ошибка добавления подкаста: ${error}` };
  }
};

// Обновить подкаст
export const updatePodcast = async (id: string, updates: Partial<Podcast>): Promise<{ success: boolean; message: string; podcast?: Podcast }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Update podcast API error: ${error}`);
    return { success: false, message: `Ошибка обновления подкаста: ${error}` };
  }
};

// Удалить подкаст
export const deletePodcast = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Delete podcast API error: ${error}`);
    return { success: false, message: `Ошибка удаления подкаста: ${error}` };
  }
};

// Удалить отзыв
export const deletePodcastReview = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcast-reviews/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Delete review API error: ${error}`);
    return { success: false, message: `Ошибка удаления отзыва: ${error}` };
  }
};
