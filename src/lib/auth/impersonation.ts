import type { User } from '@/types/auth';

/**
 * Super-admin "Login as": the original session is parked in this tab's
 * sessionStorage (never localStorage) so it can be restored on "Return".
 */
const KEY = 'isp-impersonator-session';

export interface ParkedSession {
  user: User;
  token: string;
  refreshToken: string | null;
  impersonatedName: string;
  /** Where "Return" lands (defaults to the super-admin admins list). */
  returnTo?: string;
}

export function parkImpersonatorSession(session: ParkedSession) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — the impersonation still works, just without "Return" */
  }
}

export function readParkedSession(): ParkedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ParkedSession) : null;
  } catch {
    return null;
  }
}

export function clearParkedSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
