'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

/** Writes the query string without a navigation (Next syncs `history.replaceState` into `useSearchParams`). */
export function replaceQuery(mutate: (params: URLSearchParams) => void) {
  const params = new URLSearchParams(window.location.search);
  mutate(params);
  const qs = params.toString();
  if (qs === window.location.search.replace(/^\?/, '')) return; // unchanged: skip, so Next does not re-render for nothing
  window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

/**
 * One filter kept in the URL (`?category_id=3`), so deep links and the Back button keep working.
 * Needs a `<Suspense>` boundary above it; the portal layouts already provide one.
 */
export function useUrlParam(key: string): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? '';
  const setValue = useCallback(
    (next: string) =>
      replaceQuery((params) => {
        if (next) params.set(key, next);
        else params.delete(key);
      }),
    [key],
  );
  return [value, setValue];
}
