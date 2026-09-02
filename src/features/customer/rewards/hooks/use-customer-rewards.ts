'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export function useCustomerRewards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'rewards'],
    queryFn: () => mockFetch('customer.rewards'),
  });

  const redeemMutation = useMutation({
    mutationFn: (points: number) => mockFetch('customer.rewards.redeem', points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'dashboard'] });
    },
  });

  return {
    ...query,
    redeemMutation,
  };
}
