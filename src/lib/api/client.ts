import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, PageMeta, PageResult } from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:8080/api';

const AUTH_STORAGE_KEY = 'isp-auth-storage';
const REFRESH_STORAGE_KEY = 'isp_refresh_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/** Bare client for the refresh call — no interceptors, so no 401 loop. */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/**
 * Normalised API failure. `message` is the backend's human message
 * (`error.message` / `message`), never axios' generic "Request failed…".
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[] | string>;

  constructor(message: string, status: number, code = 'REQUEST_FAILED', details?: Record<string, string[] | string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True for network failures, timeouts and 5xx — the only errors worth retrying. */
  get isTransient(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

type ErrorBody = {
  message?: unknown;
  error?: { code?: unknown; message?: unknown; details?: unknown } | string | null;
  messages?: unknown;
};

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? {}) as ErrorBody;
    const err = typeof body.error === 'object' && body.error !== null ? body.error : undefined;
    const fromBody =
      (typeof err?.message === 'string' && err.message) ||
      (typeof body.error === 'string' && body.error) ||
      (typeof body.message === 'string' && body.message) ||
      '';
    const fallback =
      status === 0
        ? 'Cannot reach the server. Check your connection and try again.'
        : status === 403
          ? 'You do not have permission to do this.'
          : status === 404
            ? 'The requested record was not found.'
            : status >= 500
              ? 'The server had a problem. Please try again.'
              : 'Request failed.';
    const details =
      err?.details && typeof err.details === 'object'
        ? (err.details as Record<string, string[] | string>)
        : body.messages && typeof body.messages === 'object'
          ? (body.messages as Record<string, string[] | string>)
          : undefined;
    return new ApiError(fromBody || fallback, status, typeof err?.code === 'string' ? err.code : 'REQUEST_FAILED', details);
  }
  if (error instanceof Error) return new ApiError(error.message, 0);
  return new ApiError('Unexpected error', 0);
}

function readStoredAuth(): { state?: { token?: string | null } } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Session-expiry hook, wired by the auth store (avoids an import cycle). */
let onSessionExpired: (() => void) | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;
export function registerAuthHandlers(handlers: { onSessionExpired: () => void; onTokenRefreshed: (token: string) => void }) {
  onSessionExpired = handlers.onSessionExpired;
  onTokenRefreshed = handlers.onTokenRefreshed;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_STORAGE_KEY) : null;
  if (!refreshToken) throw new ApiError('Session expired', 401, 'UNAUTHORIZED');

  // POST /api/v1/auth/refresh
  const res = await refreshClient.post<ApiResponse<{ access_token: string; refresh_token?: string }>>('/v1/auth/refresh', {
    refresh_token: refreshToken,
  });
  const accessToken = res.data?.data?.access_token;
  const nextRefresh = res.data?.data?.refresh_token;
  if (!accessToken) throw new ApiError('Session expired', 401, 'UNAUTHORIZED');
  if (nextRefresh) localStorage.setItem(REFRESH_STORAGE_KEY, nextRefresh);
  onTokenRefreshed?.(accessToken);
  return accessToken;
}

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = readStoredAuth()?.state?.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: transparent token refresh on 401, normalised errors otherwise
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const hadToken = Boolean(originalRequest?.headers?.Authorization);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      hadToken &&
      !originalRequest.url?.includes('/v1/auth/')
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch {
        onSessionExpired?.();
        return Promise.reject(new ApiError('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED'));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

function unwrap<T>(body: unknown): T {
  const b = body as ApiResponse<T> | undefined;
  return (b && typeof b === 'object' && 'data' in b && b.data !== undefined ? b.data : body) as T;
}

/**
 * Normalise every list envelope the backend uses into `{ items, meta }`:
 * - `data: [...]` + top-level `meta` / `pagination`
 * - `data: { items | rows | data | <key>: [...], total, page, per_page }`
 */
function toPage<T>(body: unknown, listKey?: string): PageResult<T> {
  const root = (body ?? {}) as Record<string, unknown>;
  const data = (root.data ?? root) as unknown;
  let items: unknown[] = [];
  let inner: Record<string, unknown> = {};

  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object') {
    inner = data as Record<string, unknown>;
    const candidate =
      (listKey ? inner[listKey] : undefined) ?? inner.items ?? inner.rows ?? inner.data ?? inner.list ?? inner.records;
    if (Array.isArray(candidate)) items = candidate;
  }

  const metaSrc = (root.meta ?? root.pagination ?? inner.meta ?? inner.pagination ?? inner) as Record<string, unknown>;
  const num = (v: unknown, d: number) => (v === undefined || v === null || v === '' || isNaN(Number(v)) ? d : Number(v));
  const perPage = num(metaSrc.per_page ?? metaSrc.perPage ?? metaSrc.limit, items.length || 20);
  const total = num(metaSrc.total ?? metaSrc.total_found ?? metaSrc.totalItems ?? metaSrc.count, items.length);
  const meta: PageMeta = {
    total,
    page: num(metaSrc.page ?? metaSrc.current_page ?? metaSrc.currentPage, 1),
    perPage,
    totalPages: num(metaSrc.total_pages ?? metaSrc.totalPages ?? metaSrc.last_page, Math.max(1, Math.ceil(total / Math.max(1, perPage)))),
  };
  return { items: items as T[], meta, raw: inner };
}

/**
 * Universal API Client wrappers. All failures reject with `ApiError`.
 */
export const http = {
  get: async <T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url, { params, signal });
    return unwrap<T>(res.data);
  },

  /**
   * Paginated GET. Keeps the backend `meta`/`pagination` that `get` drops.
   * `listKey` picks the array when the payload nests it (e.g. `{ pools: [...] }`).
   */
  getPage: async <T>(
    url: string,
    params?: Record<string, unknown>,
    options?: { listKey?: string; signal?: AbortSignal },
  ): Promise<PageResult<T>> => {
    const res = await apiClient.get(url, { params, signal: options?.signal });
    return toPage<T>(res.data, options?.listKey);
  },

  post: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.post<ApiResponse<T>>(url, body, { params });
    return unwrap<T>(res.data);
  },

  put: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.put<ApiResponse<T>>(url, body, { params });
    return unwrap<T>(res.data);
  },

  patch: async <T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.patch<ApiResponse<T>>(url, body, { params });
    return unwrap<T>(res.data);
  },

  delete: async <T>(url: string, params?: Record<string, unknown>, body?: unknown): Promise<T> => {
    const res = await apiClient.delete<ApiResponse<T>>(url, { params, data: body });
    return unwrap<T>(res.data);
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
    return unwrap<T>(res.data);
  },

  /** Binary download (excel/pdf exports). Returns the blob + server filename. */
  download: async (url: string, params?: Record<string, unknown>): Promise<{ blob: Blob; filename: string | null }> => {
    const res = await apiClient.get<Blob>(url, { params, responseType: 'blob' });
    const disposition = String(res.headers['content-disposition'] ?? '');
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    return { blob: res.data, filename: match ? decodeURIComponent(match[1]) : null };
  },
};

/** Trigger a browser save for a blob returned by `http.download`. */
export function saveBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
