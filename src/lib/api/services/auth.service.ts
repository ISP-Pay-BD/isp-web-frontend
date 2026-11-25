import { getTenantSlugFromHost, http } from '../client';
import { BackendAuthData, transformBackendAuthUser } from '../adapters/auth.adapter';
import type { User } from '@/types/auth';

export type IdentifierType = 'email' | 'phone' | 'id' | 'username';

/**
 * Detects the login identifier type on the client so the backend can hit the
 * exact indexed column:
 * - Contains `@` -> `email`
 * - Starts with `0` (or `+880` / `880`) and 10..15 digits -> `phone`
 * - Numeric and does NOT start with `0` -> `id`
 * - Everything else -> `username`
 */
export function detectIdentifierType(raw: string): IdentifierType {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) return 'email';

  const digits = trimmed.replace(/\D/g, '');
  const isBdPhonePrefix =
    trimmed.startsWith('0') || trimmed.startsWith('+880') || trimmed.startsWith('880');
  if (isBdPhonePrefix && digits.length >= 10 && digits.length <= 15) {
    return 'phone';
  }

  if (trimmed.length > 0 && !trimmed.startsWith('0') && /^\d+$/.test(trimmed)) {
    return 'id';
  }

  return 'username';
}

// Endpoint literals (mirrors API_ENDPOINTS in `../endpoints` — kept inline so
// the route cross-check script can see every call site as a static URL).
const AUTH_LOGIN = '/v1/auth/login';
const AUTH_REFRESH = '/v1/auth/refresh';
const AUTH_ME = '/v1/auth/me';
const AUTH_RESET_PASSWORD = '/v1/auth/reset-password';
const AUTH_DEBUG_ACCOUNTS = '/v1/auth/debug-accounts';

export interface DebugAccountItem {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label: string;
  mobile?: string;
  tenant_slug: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  /** TOTP code for accounts with two-factor authentication enabled */
  otp?: string;
  /** Explicit tenant slug (e.g. from tenant picker or subdomain). */
  tenant_slug?: string;
  /** Hint for backend indexed lookup (`email`, `phone`, `id`, `username`). */
  identifier_type?: IdentifierType;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const identifier = credentials.email.trim();
    const tenantSlug = credentials.tenant_slug ?? getTenantSlugFromHost() ?? undefined;
    const rawData = await http.post<BackendAuthData>(AUTH_LOGIN, {
      ...credentials,
      email: identifier,
      identifier,
      identifier_type: credentials.identifier_type ?? detectIdentifierType(identifier),
      ...(tenantSlug ? { tenant_slug: tenantSlug } : {}),
    });

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

  /** POST /api/v1/auth/reset-password — consumes the emailed code. */
  resetPassword: async (payload: { email: string; code: string; newPassword: string }): Promise<void> => {
    await http.post(AUTH_RESET_PASSWORD, {
      email: payload.email,
      code: payload.code,
      new_password: payload.newPassword,
    });
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

  getDebugAccounts: async (): Promise<DebugAccountItem[]> => {
    try {
      const data = await http.get<DebugAccountItem[]>(AUTH_DEBUG_ACCOUNTS);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
