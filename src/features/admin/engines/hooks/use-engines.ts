'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { enginesData, type EnginesData } from '@/data/admin/engines.data';

export function useEngines(portal: 'admin' | 'platform' = 'admin') {
  return useQuery({
    queryKey: [portal, 'domain', 'engines'],
    queryFn: async (): Promise<EnginesData> => {
      try {
        const res = await http.get<unknown>('/v1/engines/catalog');
        let payload: unknown = res;
        if (res && typeof res === 'object' && 'data' in res) {
          payload = (res as { data: unknown }).data;
        }

        if (payload && typeof payload === 'object' && 'records' in payload && 'groups' in payload) {
          return payload as EnginesData;
        }

        return enginesData;
      } catch {
        return enginesData;
      }
    },
  });
}
