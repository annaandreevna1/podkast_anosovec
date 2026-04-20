import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  isAdmin: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

const CURRENT_USER_KEY = 'podcast_current_user';
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-055f6039`;

// Зарегистрировать нового пользователя
export const registerUser = async (email: string, password: string, fullName: string): Promise<{ success: boolean; message: string; user?: CurrentUser }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await response.json();

    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.log(`Registration API error: ${error}`);
    return { success: false, message: `Ошибка регистрации: ${error}` };
  }
};

// Войти в систему
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: CurrentUser }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.log(`Login API error: ${error}`);
    return { success: false, message: `Ошибка входа: ${error}` };
  }
};

// Получить текущего пользователя
export const getCurrentUser = (): CurrentUser | null => {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  return currentUser ? JSON.parse(currentUser) : null;
};

// Выйти из системы
export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Проверить, залогинен ли пользователь
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
