'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customerService, type PageParams } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';

/** GET /v1/customer/reward/wallet */
export function useRewardWallet() {
  return useQuery({
    queryKey: customerKeys.rewardWallet,
    queryFn: () => customerService.getRewardWallet(),
  });
}

/** GET /v1/customer/referral/overview */
export function useReferralOverview() {
  return useQuery({
    queryKey: customerKeys.referral,
    queryFn: () => customerService.getReferralOverview(),
  });
}

/** GET /v1/customer/reward/transactions — paginated points ledger. */
export function useRewardTransactions(params: PageParams) {
  return useQuery({
    queryKey: customerKeys.rewardTransactions(params),
    queryFn: () => customerService.getRewardTransactions(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /v1/customer/reward/redeem-preview — caps for redeeming on a package
 * renewal (commits nothing; points are held when the renewal invoice is created).
 */
export function useRedeemPreview(packageId: string, enabled: boolean) {
  return useQuery({
    queryKey: customerKeys.redeemPreview(packageId),
    queryFn: () => customerService.getRedeemPreview(packageId),
    enabled: enabled && Boolean(packageId),
    staleTime: 0,
  });
}
