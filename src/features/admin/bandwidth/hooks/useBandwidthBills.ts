import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapPurchaseBill, mapPurchaseBillTotals } from '../types';
import { bandwidthKeys, compact } from './keys';

export interface BillListParams {
  page: number;
  pageSize: number;
  search?: string;
  providerId?: string;
  status?: '' | 'Paid' | 'Due';
  from?: string;
  to?: string;
}

/**
 * GET /v1/bandwidth/purchase-bills — paged in SQL; `totals` cover the whole
 * filtered set. Without a date range the backend defaults to the last 30
 * days, so `all=1` is sent to list every bill.
 */
export function useBandwidthBills({ page, pageSize, search, providerId, status, from, to }: BillListParams) {
  const params = compact({ page, per_page: pageSize, search, provider_id: providerId, status, from, to, all: from || to ? undefined : 1 });
  return useQuery({
    queryKey: bandwidthKeys.billList(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/bandwidth/purchase-bills', params, { listKey: 'items' });
      return { items: res.items.map(mapPurchaseBill), meta: res.meta, totals: mapPurchaseBillTotals(res.raw.totals) };
    },
    placeholderData: keepPreviousData,
  });
}

export interface BillLineInput {
  itemId: string;
  itemName?: string;
  description: string;
  unit: string;
  qty: string;
  rate: string;
  vat: string;
  fromDate: string;
  toDate: string;
}

export interface BillInput {
  providerId: string;
  invoiceNumber: string;
  billingDate: string;
  paymentStatus: 'Paid' | 'Due';
  discount: string;
  paidNumber: string;
  paymentMethod: string;
  paidBy: string;
  receivedBy: string;
  remarks: string;
  lines: BillLineInput[];
}

function billBody(v: BillInput) {
  return {
    provider_id: v.providerId,
    invoice_number: v.invoiceNumber.trim(),
    billing_date: v.billingDate,
    payment_status: v.paymentStatus,
    discount: v.discount.trim() || 0,
    paid_number: v.paidNumber.trim() || 0,
    payment_method: v.paymentMethod,
    paid_by: v.paidBy.trim(),
    received_by: v.receivedBy.trim(),
    remarks: v.remarks.trim(),
    items: v.lines.map((l) => ({
      item_id: l.itemId,
      item: l.itemId ? undefined : l.itemName,
      description: l.description.trim(),
      unit: l.unit.trim(),
      qty: l.qty,
      rate: l.rate,
      vat: l.vat.trim() || 0,
      from_date: l.fromDate,
      to_date: l.toDate,
    })),
  };
}

function useBillInvalidation() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: bandwidthKeys.bills });
}

/** POST /v1/bandwidth/purchase-bills (invoice number auto-generated when blank). */
export function useCreateBandwidthBill() {
  const invalidate = useBillInvalidation();
  return useMutation({
    mutationFn: (v: BillInput) => http.post('/v1/bandwidth/purchase-bills', billBody(v)),
    onSuccess: invalidate,
  });
}

/** PUT /v1/bandwidth/purchase-bills/{id}. */
export function useUpdateBandwidthBill() {
  const invalidate = useBillInvalidation();
  return useMutation({
    mutationFn: (v: BillInput & { id: number }) => http.put(`/v1/bandwidth/purchase-bills/${v.id}`, billBody(v)),
    onSuccess: invalidate,
  });
}

/** DELETE one bill, or POST …/bulk-delete for several. */
export function useDeleteBandwidthBills() {
  const invalidate = useBillInvalidation();
  return useMutation({
    mutationFn: (ids: number[]) =>
      ids.length === 1
        ? http.delete(`/v1/bandwidth/purchase-bills/${ids[0]}`)
        : http.post('/v1/bandwidth/purchase-bills/bulk-delete', { ids }),
    onSuccess: invalidate,
  });
}
