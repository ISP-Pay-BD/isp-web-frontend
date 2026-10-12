'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/** Debounced copy of `value` (real UI timing for search-as-you-type). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * A filter kept in the URL query (`?category_id=…`), so deep links like
 * /admin/inventory/items?category_id=3 work. Uses history.replaceState, which
 * Next.js syncs into useSearchParams without a navigation.
 * The calling component must sit under a <Suspense> boundary.
 */
export function useUrlParam(key: string): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? '';
  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(window.location.search);
      if (next) params.set(key, next);
      else params.delete(key);
      const qs = params.toString();
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    },
    [key],
  );
  return [value, setValue];
}
