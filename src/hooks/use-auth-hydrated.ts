'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/** True after zustand persist has finished reading localStorage. */
export function useAuthHydrated(): boolean {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(hasHydrated);

  useEffect(() => {
    setReady(useAuthStore.getState().hasHydrated);

    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHasHydrated(true);
      setReady(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().setHasHydrated(true);
      setReady(true);
    }

    return unsubFinish;
  }, []);

  return ready || hasHydrated;
}
