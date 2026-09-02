'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { toast } from 'sonner';
import type { AdminSubscription, AdminSubscriptionPlan } from '@/data/admin/subscription.data';

export function useAdminSubscription() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'domain', 'subscription'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'subscription');
      return res as { subscription: AdminSubscription; plans: AdminSubscriptionPlan[] };
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: (payload: { planId: string; method?: string }) =>
      mockFetch('admin.subscription.recharge', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'subscription'] });
      qc.invalidateQueries({ queryKey: ['admin', 'domain', 'tenantBilling'] });
      toast.success('Subscription recharged successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Recharge failed'),
  });

  return { ...query, rechargeMutation };
}
