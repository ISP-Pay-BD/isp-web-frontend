'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';

/** Keeps middleware cookie in sync with persisted Zustand auth state. */
export function AuthCookieSync() {
  const hydrated = useAuthHydrated();
  const syncSessionCookie = useAuthStore((s) => s.syncSessionCookie);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated) return;
    syncSessionCookie();
  }, [hydrated, syncSessionCookie, user, isAuthenticated]);

  return null;
}
