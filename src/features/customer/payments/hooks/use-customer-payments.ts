'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerService, type ManualPaymentPayload, type PageParams } from '@/lib/api/services/customer.service';
import { customerKeys } from '@/features/customer/shared/hooks/use-customer-account';

/** GET /v1/customer/payment-fetch — server-paginated payment history. */
export function useCustomerPayments(params: PageParams) {
  return useQuery({
    queryKey: customerKeys.paymentsPage(params),
    queryFn: () => customerService.getPayments(params),
    placeholderData: keepPreviousData,
  });
}

/** POST /v1/customer/payments — records a manual payment as pending (staff verify it). */
export function useSubmitManualPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: (payload: ManualPaymentPayload) => customerService.submitManualPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.payments });
      queryClient.invalidateQueries({ queryKey: customerKeys.dashboard });
    },
  });
}

/** GET /v1/customer/json/invoice-print?invoice_id= — only settled payments have an invoice. */
export function useCustomerInvoice(id: string) {
  return useQuery({
    queryKey: customerKeys.invoice(id),
    queryFn: () => customerService.getInvoice(id),
    enabled: Boolean(id),
  });
}
