'use client';

import { useState, useEffect } from 'react';
import { mockFetch } from '@/lib/mock-api/client';
import type { LandingSectionsData } from '../types';

export function useLandingData() {
  const [data, setData] = useState<LandingSectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mockFetch('marketing.landing');
        if (!active) return;
        setData(res.sectionsA);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Failed to load landing data'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return {
    data,
    loading,
    error,
    refetch: () => setReloadKey((k) => k + 1),
  };
}
