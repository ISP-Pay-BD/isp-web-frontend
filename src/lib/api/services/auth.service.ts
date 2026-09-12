import { http } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { BackendAuthData, transformBackendAuthUser } from '../adapters/auth.adapter';
import type { User } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const rawData = await http.post<BackendAuthData>(API_ENDPOINTS.auth.login, credentials);

    if (rawData.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem('isp_refresh_token', rawData.refresh_token);
    }

    const user = transformBackendAuthUser(rawData);
    const token = rawData.access_token || '';

    return {
      user,
      token,
      refreshToken: rawData.refresh_token,
    };
  },

  refresh: async (refreshToken: string): Promise<{ token: string; refreshToken?: string }> => {
    const rawData = await http.post<BackendAuthData>(API_ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });

    if (rawData.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem('isp_refresh_token', rawData.refresh_token);
    }

    return {
      token: rawData.access_token || '',
      refreshToken: rawData.refresh_token,
    };
  },

  me: async (): Promise<User> => {
    const rawData = await http.get<BackendAuthData>(API_ENDPOINTS.auth.me);
    return transformBackendAuthUser(rawData);
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isp_refresh_token');
    }
  },
};
