import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { INVENTORY_URL, fetchList, fetchPaged, inventoryKeys, mapUnit, pageParams, type ListParams } from '../api';

/** Server-paginated units (GET /v1/inventory/units). */
export function useInventoryUnits(list: ListParams) {
  const params = pageParams(list);
  return useQuery({
    queryKey: [...inventoryKeys.units, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/units`, params, mapUnit, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** Units for dropdowns (per_page=100). */
export function useUnitOptions(enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.units, 'options'],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/units`, { per_page: 100 }, mapUnit, signal),
    enabled,
  });
}

/** POST /v1/inventory/units or PUT /v1/inventory/units/{id} — body `{name}`. */
export function useSaveUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id?: string; name: string }) =>
      id ? http.put<unknown>(`${INVENTORY_URL}/units/${id}`, { name }) : http.post<unknown>(`${INVENTORY_URL}/units`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.units });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${INVENTORY_URL}/units/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.units });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}
