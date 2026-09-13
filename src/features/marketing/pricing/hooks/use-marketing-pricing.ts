'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mockFetch } from '@/lib/mock-api/client';

export function useMarketingPricing() {
  return useQuery({
    queryKey: ['marketing', 'pricing'],
    queryFn: async () => {
      try {
        const res = await http.get<unknown>('/v1/platform/subscriptions');
        const mock = (await mockFetch('marketing.pricing')) as Awaited<ReturnType<typeof import('@/lib/mock-api/handlers/marketing.handler').getPricingData>>;
        return mock;
      } catch {
        return (await mockFetch('marketing.pricing')) as Awaited<ReturnType<typeof import('@/lib/mock-api/handlers/marketing.handler').getPricingData>>;
      }
    },
  });
}


