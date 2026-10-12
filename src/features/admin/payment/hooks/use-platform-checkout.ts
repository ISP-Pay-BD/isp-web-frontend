'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';

/** Display names for the gateway slugs the backend reports as checkout providers. */
export const GATEWAY_LABEL: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  sslcommerz: 'Cards / SSLCommerz',
  eps: 'EPS',
  shurjopay: 'shurjoPay',
  paystation: 'PayStation',
};

export const gatewayLabel = (slug: string) => GATEWAY_LABEL[slug] ?? slug;

/** Query keys refreshed whenever a platform payment may have settled. */
export function invalidatePlatformBilling(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['admin', 'tenant-billing'] });
  qc.invalidateQueries({ queryKey: ['admin', 'subscription'] });
  qc.invalidateQueries({ queryKey: ['admin', 'wallet'] });
}

/**
 * POST /v1/reseller/billing/checkout/{gateway} {payment_id} — hosted checkout
 * for one of the caller's own PENDING platform invoices (same gateway code as
 * the customer app). Redirects the browser to the gateway on success.
 */
export function usePlatformCheckout() {
  return useMutation({
    mutationFn: async ({ paymentId, gateway }: { paymentId: string; gateway: string }) =>
      http.post<Record<string, unknown>>(`/v1/reseller/billing/checkout/${gateway}`, { payment_id: Number(paymentId) }),
    onSuccess: (data) => {
      const url = str(data?.redirect_url ?? data?.gateway_page_url);
      if (url) {
        toast.message('Redirecting to the payment gateway…');
        window.location.assign(url);
      } else {
        toast.error('The gateway did not return a checkout page.');
      }
    },
  });
}

/** GET /v1/reseller/billing/checkout/{gateway}/status/{ref} — re-verifies with the gateway. */
export function useCheckoutStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ gateway, reference }: { gateway: string; reference: string }) =>
      http.get<{ status?: string }>(`/v1/reseller/billing/checkout/${gateway}/status/${encodeURIComponent(reference)}`),
    onSuccess: (data) => {
      invalidatePlatformBilling(qc);
      const status = str(data?.status);
      if (status === 'completed') toast.success('Payment confirmed by the gateway');
      else if (status === 'failed') toast.error('The gateway reports this payment as failed');
      else toast.message('Still waiting for the gateway to confirm this payment');
    },
  });
}
