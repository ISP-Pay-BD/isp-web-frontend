'use client';

import { useCallback, useState } from 'react';
import { useRouterOptions } from '@/features/admin/routers/hooks/useRouters';

const STORAGE_KEY = 'admin.hotspot.routerId';

function readStoredRouterId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode) — fall back to the first router
  }
}

/**
 * The MikroTik router every hotspot screen works on. Options come from the
 * tenant's active routers; the choice is remembered per browser so moving
 * between hotspot pages keeps the same router.
 */
export function useHotspotRouter() {
  const routersQuery = useRouterOptions();
  const [chosenId, setChosenId] = useState<string | null>(readStoredRouterId);

  const routers = routersQuery.data ?? [];
  const router = routers.find((r) => r.id === chosenId) ?? routers[0] ?? null;

  const selectRouter = useCallback((id: string) => {
    setChosenId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // not persisted — the selection still applies for this page
    }
  }, []);

  return { routers, router, routerId: router?.id ?? null, selectRouter, routersQuery };
}

export type HotspotRouterState = ReturnType<typeof useHotspotRouter>;
