'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useMarketingPricing() {
  return useQuery({
    queryKey: ['marketing', 'pricing'],
    queryFn: () => mockFetch('marketing.pricing'),
  });
}
