'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { useTranslations } from '@/i18n/locale-context';
import { toPaymentBody, type CollectPaymentValues } from '../schemas/collect-payment.schema';
import { operationsKey } from './use-employee-operations';

/** `POST /v1/payments` — open to an employee with `customer_payment.create` (lane W2-R13), POP scope enforced. */
export function useCollectPayment() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CollectPaymentValues) =>
      http.post<{ id?: number }>('/v1/payments', toPaymentBody(values)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKey });
      toast.success(t('employee.collect.toastDone', 'Payment recorded'));
    },
  });
}
