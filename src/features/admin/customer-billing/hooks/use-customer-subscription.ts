'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { customerBillingApi, type RenewBody } from '../api/customer-billing.api';

export const subscriptionKeys = {
  detail: (id: string) => ['admin', 'customers', 'subscription', id] as const,
};

export function useCustomerSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => customerBillingApi.subscription(id),
    enabled: Boolean(id),
  });
}

/** Subscription, customer caches and the dashboard counters all change after a payment write. */
function useInvalidate(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
    qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
    qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };
}

export function useRenewSubscription(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: (body: RenewBody) => customerBillingApi.renew(id, body),
    onSuccess: () => {
      invalidate();
      toast.success(t('admin.customerBilling.renewed', 'Subscription updated'));
    },
  });
}

export function useBatchBilling(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: (months: Record<string, unknown>[]) => customerBillingApi.batchBilling(id, months),
    onSuccess: (res, months) => {
      invalidate();
      toast.success(
        t('admin.customerBilling.batchSaved', '{count} billing month(s) saved', {
          count: res?.processed ?? months.length,
        }),
      );
    },
  });
}
