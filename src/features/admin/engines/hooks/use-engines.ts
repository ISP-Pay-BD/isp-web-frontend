'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import type { EnginesData } from '@/data/admin/engines.data';

export function useEngines(portal: 'admin' | 'platform' = 'admin') {
  return useQuery({
    queryKey: [portal, 'domain', 'engines'],
    queryFn: async () => {
      const res = await http.get<unknown>('/v1/engines/catalog');
      if (res && typeof res === 'object' && 'engines' in res) {
        return res as unknown as EnginesData;
      }
      return { engines: Array.isArray(res) ? res : [] } as unknown as EnginesData;
    },
  });
}
