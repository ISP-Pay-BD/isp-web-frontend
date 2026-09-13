import { http } from '../client';
import { BackendAuthData, transformBackendAuthUser } from '../adapters/auth.adapter';
import type { User } from '@/types/auth';

// Endpoint literals (mirrors API_ENDPOINTS in `../endpoints` — kept inline so
// the route cross-check script can see every call site as a static URL).
const AUTH_LOGIN = '/v1/auth/login';
const AUTH_REFRESH = '/v1/auth/refresh';
const AUTH_ME = '/v1/auth/me';

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
    const rawData = await http.post<BackendAuthData>(AUTH_LOGIN, credentials);

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
    const rawData = await http.post<BackendAuthData>(AUTH_REFRESH, {
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
    const rawData = await http.get<BackendAuthData>(AUTH_ME);
    return transformBackendAuthUser(rawData);
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isp_refresh_token');
    }
  },
};
