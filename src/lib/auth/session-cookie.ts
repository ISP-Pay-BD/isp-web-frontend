import type { UserRole, UserStatus } from '@/types/auth';

export const AUTH_COOKIE_NAME = 'isp-auth-mock';

export interface AuthCookiePayload {
  userId: string;
  role: UserRole;
  status: UserStatus;
}

export function serializeAuthCookie(payload: AuthCookiePayload): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export function parseAuthCookie(raw: string | undefined): AuthCookiePayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AuthCookiePayload;
    if (!parsed.userId || !parsed.role || !parsed.status) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthCookie(payload: AuthCookiePayload): void {
  if (typeof document === 'undefined') return;
  const value = serializeAuthCookie(payload);
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
