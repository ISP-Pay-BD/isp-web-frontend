import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('isp-auth-storage');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Unwrap ApiResponse and Handle 401 Refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/v1/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshToken: string | null = null;
        if (typeof window !== 'undefined') {
          refreshToken = localStorage.getItem('isp_refresh_token');
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
          `${API_BASE_URL}/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const newAccessToken = refreshResponse.data?.data?.access_token;
        const newRefreshToken = refreshResponse.data?.data?.refresh_token;

        if (newAccessToken && typeof window !== 'undefined') {
          if (newRefreshToken) {
            localStorage.setItem('isp_refresh_token', newRefreshToken);
          }
          const storedAuth = localStorage.getItem('isp-auth-storage');
          if (storedAuth) {
            try {
              const parsed = JSON.parse(storedAuth);
              parsed.state.token = newAccessToken;
              localStorage.setItem('isp-auth-storage', JSON.stringify(parsed));
            } catch {
              // ignore
            }
          }
        }

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isp-auth-storage');
          localStorage.removeItem('isp_refresh_token');
          window.location.assign('/login?expired=1');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Universal API Client wrappers
 */
export const http = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url, { params });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },

  post: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.post<ApiResponse<T>>(url, body, { params });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },

  put: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.put<ApiResponse<T>>(url, body, { params });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },

  patch: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.patch<ApiResponse<T>>(url, body, { params });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },

  delete: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.delete<ApiResponse<T>>(url, { params });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },

  upload: async <T>(url: string, formData: FormData, onProgress?: (percent: number) => void): Promise<T> => {
    const res = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return (res.data?.data !== undefined ? res.data.data : res.data) as T;
  },
};
