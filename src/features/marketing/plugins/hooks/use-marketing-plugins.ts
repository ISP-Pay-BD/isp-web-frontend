'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mockFetch } from '@/lib/mock-api/client';

export function useMarketingPlugins() {
  return useQuery({
    queryKey: ['marketing', 'plugins'],
    queryFn: async () => {
      try {
        const res = await http.get<unknown>('/v1/engines/catalog');
        const mock = (await mockFetch('marketing.plugins')) as Awaited<ReturnType<typeof import('@/lib/mock-api/handlers/marketing.handler').getPluginsData>>;
        return mock;
      } catch {
        return (await mockFetch('marketing.plugins')) as Awaited<ReturnType<typeof import('@/lib/mock-api/handlers/marketing.handler').getPluginsData>>;
      }
    },
  });
}


