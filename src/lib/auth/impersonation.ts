import type { User } from '@/types/auth';

/**
 * Super-admin and Admin "Login as": the original session is parked in this tab's
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

const listeners = new Set<() => void>();

export function subscribeImpersonation(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
}

let cachedRaw: string | null = null;
let cachedParsed: ParkedSession | null = null;

export function parkImpersonatorSession(session: ParkedSession) {
  try {
    const str = JSON.stringify(session);
    sessionStorage.setItem(KEY, str);
    cachedRaw = str;
    cachedParsed = session;
    listeners.forEach((l) => l());
  } catch {
    /* storage unavailable — the impersonation still works, just without "Return" */
  }
}

export function readParkedSession(): ParkedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw === cachedRaw) {
      return cachedParsed;
    }
    cachedRaw = raw;
    cachedParsed = raw ? (JSON.parse(raw) as ParkedSession) : null;
    return cachedParsed;
  } catch {
    return null;
  }
}

export function clearParkedSession() {
  try {
    sessionStorage.removeItem(KEY);
    cachedRaw = null;
    cachedParsed = null;
    listeners.forEach((l) => l());
  } catch {
    /* ignore */
  }
}
