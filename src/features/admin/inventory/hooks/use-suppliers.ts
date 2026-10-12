import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchList,
  fetchPaged,
  inventoryKeys,
  mapSupplier,
  pageParams,
  type ListParams,
  type SupplierPayload,
} from '../api';

/** Server-paginated suppliers / vendors (GET /v1/inventory/suppliers). */
export function useSuppliers(list: ListParams) {
  const params = pageParams(list);
  return useQuery({
    queryKey: [...inventoryKeys.suppliers, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/suppliers`, params, mapSupplier, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** Suppliers for dropdowns (per_page=100). */
export function useSupplierOptions(enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.suppliers, 'options'],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/suppliers`, { per_page: 100 }, mapSupplier, signal),
    enabled,
  });
}

/** POST /v1/inventory/suppliers or PUT …/{id}. */
export function useSaveSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: SupplierPayload }) =>
      id ? http.put<unknown>(`${INVENTORY_URL}/suppliers/${id}`, body) : http.post<unknown>(`${INVENTORY_URL}/suppliers`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.suppliers });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${INVENTORY_URL}/suppliers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.suppliers });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}
