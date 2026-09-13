'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import { toast } from 'sonner';
import type { AdminSubscription, AdminSubscriptionPlan } from '@/data/admin/subscription.data';

export function useAdminSubscription() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'domain', 'subscription'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/subscription/${resellerId}`);
      if (res && typeof res === 'object' && 'subscription' in res) {
        return res as { subscription: AdminSubscription; plans: AdminSubscriptionPlan[] };
      }
      return {
        subscription: {} as AdminSubscription,
        plans: [] as AdminSubscriptionPlan[],
      };
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (payload: { planId: string; method?: string }) => {
      const resellerId = getAuthUserId();
      return await http.post(`/v1/reseller/subscription/${resellerId}/recharge`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'subscription'] });
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'tenantBilling'] });
      toast.success('Subscription recharged successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Recharge failed'),
  });

  return { ...query, rechargeMutation };
}
