import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { inventoryKeys, pageParams, type ListParams } from '@/features/admin/inventory/api';
import {
  PURCHASE_DOC_URL,
  docKey,
  mapDoc,
  mapDocTotals,
  type PurchaseDocKind,
  type PurchaseDocPayload,
} from '../api';

export interface PurchaseDocListParams extends ListParams {
  from?: string;
  to?: string;
}

/** Shared list query: data `{items, totals}` + root meta → getPage(listKey 'items'), totals at raw.totals. */
export function usePurchaseDocList(kind: PurchaseDocKind, list: PurchaseDocListParams, extra: Record<string, unknown> = {}) {
  const { from, to, ...paging } = list;
  const params = { ...pageParams(paging), from: from || undefined, to: to || undefined, ...extra };
  return useQuery({
    queryKey: [...docKey(kind), 'list', params],
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>(PURCHASE_DOC_URL[kind], params, { listKey: 'items', signal });
      return { items: res.items.map(mapDoc), meta: res.meta, totals: mapDocTotals(res.raw.totals) };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/requisitions/{rid} | /v1/purchase-bills/{rid} — Doc + lines. */
export function usePurchaseDoc(kind: PurchaseDocKind, rid: string | null) {
  return useQuery({
    queryKey: [...docKey(kind), 'detail', rid],
    queryFn: async ({ signal }) =>
      mapDoc(await http.get<unknown>(`${PURCHASE_DOC_URL[kind]}/${encodeURIComponent(rid ?? '')}`, undefined, signal)),
    enabled: Boolean(rid),
    staleTime: 0,
  });
}

/** Everything a purchase document write can change (lists, details, vendor totals, KPIs). */
export function usePurchaseInvalidation() {
  const qc = useQueryClient();
  return (kinds: PurchaseDocKind[]) => {
    for (const kind of kinds) qc.invalidateQueries({ queryKey: docKey(kind) });
    if (kinds.includes('bill')) qc.invalidateQueries({ queryKey: inventoryKeys.suppliers });
    qc.invalidateQueries({ queryKey: inventoryKeys.summary });
  };
}

/** POST (create) or PUT /{rid} (lines with `id` are updated, missing ones deleted, new ones inserted). */
export function useSavePurchaseDoc(kind: PurchaseDocKind) {
  const invalidate = usePurchaseInvalidation();
  return useMutation({
    mutationFn: async ({ rid, body }: { rid?: string | null; body: PurchaseDocPayload }) =>
      mapDoc(
        rid
          ? await http.put<unknown>(`${PURCHASE_DOC_URL[kind]}/${encodeURIComponent(rid)}`, body)
          : await http.post<unknown>(PURCHASE_DOC_URL[kind], body),
      ),
    onSuccess: () => invalidate([kind]),
  });
}

/** DELETE /{rid} — rejects a requisition / deletes a bill (409 while the bill has payments). */
export function useDeletePurchaseDoc(kind: PurchaseDocKind) {
  const invalidate = usePurchaseInvalidation();
  return useMutation({
    mutationFn: (rid: string) => http.delete<unknown>(`${PURCHASE_DOC_URL[kind]}/${encodeURIComponent(rid)}`),
    onSuccess: () => invalidate([kind]),
  });
}

