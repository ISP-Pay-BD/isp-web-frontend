import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { idParam } from '@/features/admin/inventory/api';
import { PURCHASE_DOC_URL, mapBillPayments, purchaseKeys, type BillPaymentPayload } from '../api';
import { usePurchaseDocList, type PurchaseDocListParams } from './use-purchase-docs';

export interface PurchaseBillListParams extends PurchaseDocListParams {
  vendorId?: string;
  paymentStatus?: 'paid' | 'partial' | 'unpaid' | '';
}

/** Server-paginated purchase bills (GET /v1/purchase-bills?…&vendor_id&payment_status). */
export function usePurchaseBills({ vendorId, paymentStatus, ...list }: PurchaseBillListParams) {
  return usePurchaseDocList('bill', list, {
    vendor_id: idParam(vendorId),
    payment_status: paymentStatus || undefined,
  });
}

const billUrl = (rid: string) => `${PURCHASE_DOC_URL.bill}/${encodeURIComponent(rid)}`;

/** GET /v1/purchase-bills/{rid}/payments — history + paid/due + allowed payment methods. */
export function useBillPayments(rid: string | null) {
  return useQuery({
    queryKey: [...purchaseKeys.bills, 'payments', rid],
    queryFn: async ({ signal }) => mapBillPayments(await http.get<unknown>(`${billUrl(rid ?? '')}/payments`, undefined, signal)),
    enabled: Boolean(rid),
    staleTime: 0,
  });
}

/** POST /v1/purchase-bills/{rid}/payments. */
export function useRecordBillPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rid, body }: { rid: string; body: BillPaymentPayload }) => http.post<unknown>(`${billUrl(rid)}/payments`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchaseKeys.bills }),
  });
}

/** DELETE /v1/purchase-bills/{rid}/payments/{paymentId} — voids a payment. */
export function useVoidBillPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rid, paymentId }: { rid: string; paymentId: string }) =>
      http.delete<unknown>(`${billUrl(rid)}/payments/${encodeURIComponent(paymentId)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchaseKeys.bills }),
  });
}
