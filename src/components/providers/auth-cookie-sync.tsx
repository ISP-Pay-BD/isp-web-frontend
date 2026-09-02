'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/** Keeps middleware cookie in sync with persisted Zustand auth state. */
export function AuthCookieSync() {
  const syncSessionCookie = useAuthStore((s) => s.syncSessionCookie);

  useEffect(() => {
    syncSessionCookie();
  }, [syncSessionCookie]);

  return null;
}
