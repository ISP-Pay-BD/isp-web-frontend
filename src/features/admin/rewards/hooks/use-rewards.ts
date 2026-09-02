'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { ReferralTransaction, RewardConfig, TopReferrer } from '@/data/admin/rewards.data';

export function useRewards() {
  return useQuery({
    queryKey: ['admin', 'domain', 'rewards'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'rewards');
      return res as {
        config: RewardConfig;
        transactions: ReferralTransaction[];
        topReferrers: TopReferrer[];
      };
    },
  });
}
