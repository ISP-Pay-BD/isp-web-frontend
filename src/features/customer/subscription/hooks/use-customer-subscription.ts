'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerSubscription() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'subscription'],
    queryFn: () => customerService.getSubscription(),
  });

  const renewMutation = useMutation({
    mutationFn: (packageId?: string) => customerService.renewSubscription(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });

  return {
    ...query,
    renewMutation,
  };
}
