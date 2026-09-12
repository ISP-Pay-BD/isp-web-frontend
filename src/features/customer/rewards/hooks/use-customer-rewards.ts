'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerRewards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'rewards'],
    queryFn: () => customerService.getRewards(),
  });

  const redeemMutation = useMutation({
    mutationFn: (points: number) => customerService.getRewards(), // claim endpoint wrapper
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
