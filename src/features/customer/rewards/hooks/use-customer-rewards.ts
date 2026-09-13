'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';

export function useCustomerRewards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customer', 'rewards'],
    queryFn: () => customerService.getRewards(),
  });

  // Points ledger from the backend (`GET /v1/customer/reward/transactions`).
  const transactionsQuery = useQuery({
    queryKey: ['customer', 'rewards', 'transactions'],
    queryFn: () => customerService.getRewardTransactions(),
  });

  /**
   * Redemption preview (`GET /v1/customer/reward/redeem-preview`). The backend
   * computes the caps (balance, package price, max %) without committing
   * anything — the actual redemption settles with the renewal payment.
   */
  const redeemMutation = useMutation({
    mutationFn: (vars: { packageId: string | number; points?: number }) =>
      customerService.redeemPreview(vars.packageId, vars.points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'rewards', 'transactions'] });
    },
  });

  return {
    ...query,
    transactions: transactionsQuery.data?.items ?? [],
    redeemMutation,
  };
}
