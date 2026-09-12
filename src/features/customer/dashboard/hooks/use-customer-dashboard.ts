'use client';

import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerDashboard() {
  return useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: () => customerService.getDashboard(),
  });
}
