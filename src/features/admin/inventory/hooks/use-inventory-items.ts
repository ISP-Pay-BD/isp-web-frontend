import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchList,
  fetchPaged,
  idParam,
  inventoryKeys,
  mapItem,
  pageParams,
  type ItemPayload,
  type ListParams,
} from '../api';

export interface ItemListParams extends ListParams {
  categoryId?: string;
  status?: string;
}

/** Server-paginated catalogue (GET /v1/inventory/items?page&per_page&search&category_id&status). */
export function useInventoryItems({ categoryId, status, ...list }: ItemListParams) {
  const params = { ...pageParams(list), category_id: idParam(categoryId), status: status || undefined };
  return useQuery({
    queryKey: [...inventoryKeys.items, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/items`, params, mapItem, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** Full catalogue for dropdowns (no `page` → unpaginated array). */
export function useInventoryItemOptions(enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.items, 'options'],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/items`, {}, mapItem, signal),
    enabled,
  });
}

/** POST /v1/inventory/items or PUT /v1/inventory/items/{id}. */
export function useSaveInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: ItemPayload }) =>
      id
        ? http.put<unknown>(`${INVENTORY_URL}/items/${encodeURIComponent(id)}`, body)
        : http.post<unknown>(`${INVENTORY_URL}/items`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items });
      qc.invalidateQueries({ queryKey: inventoryKeys.categories });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}

/** DELETE /v1/inventory/items/{id} — later item keys shift, so every item-keyed list refetches. */
export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${INVENTORY_URL}/items/${encodeURIComponent(id)}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.items });
      qc.invalidateQueries({ queryKey: inventoryKeys.categories });
      qc.invalidateQueries({ queryKey: inventoryKeys.stock });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}
