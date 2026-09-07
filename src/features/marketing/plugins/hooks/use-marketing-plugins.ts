'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useMarketingPlugins() {
  return useQuery({
    queryKey: ['marketing', 'plugins'],
    queryFn: () => mockFetch('marketing.plugins'),
  });
}
