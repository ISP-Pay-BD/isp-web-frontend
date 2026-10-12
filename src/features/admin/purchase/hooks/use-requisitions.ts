import { useMutation } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { PURCHASE_DOC_URL, mapDoc } from '../api';
import { usePurchaseDocList, usePurchaseInvalidation, type PurchaseDocListParams } from './use-purchase-docs';

/** Server-paginated pending requisitions (GET /v1/requisitions?search&from&to&page&per_page). */
export function useRequisitions(params: PurchaseDocListParams) {
  return usePurchaseDocList('requisition', params);
}

/** POST /v1/requisitions/{rid}/approve — moves the requisition to purchase bills, returns the bill Doc. */
export function useApproveRequisition() {
  const invalidate = usePurchaseInvalidation();
  return useMutation({
    mutationFn: async (rid: string) =>
      mapDoc(await http.post<unknown>(`${PURCHASE_DOC_URL.requisition}/${encodeURIComponent(rid)}/approve`)),
    onSuccess: () => invalidate(['requisition', 'bill']),
  });
}
