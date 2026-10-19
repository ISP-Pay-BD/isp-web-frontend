'use client';

import { useEffect, useState } from 'react';

/** `value` once it stopped changing for `delayMs` (search inputs and composer text, before they reach a query key). */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
