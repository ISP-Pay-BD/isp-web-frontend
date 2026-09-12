'use client';

import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerPackages() {
  return useQuery({
    queryKey: ['customer', 'packages'],
    queryFn: () => customerService.getPackages(),
  });
}
