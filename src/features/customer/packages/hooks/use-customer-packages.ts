'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerPackages() {
  return useQuery({
    queryKey: ['customer', 'packages'],
    queryFn: () => mockFetch('customer.packages'),
  });
}
