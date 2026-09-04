'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/** True after zustand persist has finished reading localStorage. */
export function useAuthHydrated(): boolean {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(hasHydrated);

  useEffect(() => {
    if (hasHydrated) return;

    let cancelled = false;
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHasHydrated(true);
      if (!cancelled) {
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      }
    });

    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().setHasHydrated(true);
      if (!cancelled) {
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      }
    }

    return () => {
      cancelled = true;
      unsubFinish();
    };
  }, [hasHydrated]);

  return ready || hasHydrated;
}
