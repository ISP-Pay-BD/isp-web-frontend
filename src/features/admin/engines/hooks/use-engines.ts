'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { EnginesData } from '@/data/admin/engines.data';

export function useEngines(portal: 'admin' | 'platform' = 'admin') {
  return useQuery({
    queryKey: [portal, 'domain', 'engines'],
    queryFn: async () => {
      const key = portal === 'platform' ? 'platform.domain' : 'admin.domain';
      const res = await mockFetch(key, 'engines');
      return res as EnginesData;
    },
  });
}
