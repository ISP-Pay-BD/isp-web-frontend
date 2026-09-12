'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { ReferralTransaction, RewardConfig, TopReferrer } from '@/data/admin/rewards.data';

export function useRewards() {
  return useQuery({
    queryKey: ['admin', 'domain', 'rewards'],
    queryFn: async () => {
      const res = await adminService.getRewardsData();
      return res as {
        config: RewardConfig;
        transactions: ReferralTransaction[];
        topReferrers: TopReferrer[];
      };
    },
  });
}
