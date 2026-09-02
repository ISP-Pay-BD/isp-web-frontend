'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerNews() {
  return useQuery({
    queryKey: ['customer', 'news', 'list'],
    queryFn: () => mockFetch('customer.news.list'),
  });
}
