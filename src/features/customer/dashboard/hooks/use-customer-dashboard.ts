'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerDashboard() {
  return useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: () => mockFetch('customer.dashboard'),
  });
}
