'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerSubscription() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'subscription'],
    queryFn: () => mockFetch('customer.subscription'),
  });

  const renewMutation = useMutation({
    mutationFn: (packageId?: string) => mockFetch('customer.subscription.renew', packageId),
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
