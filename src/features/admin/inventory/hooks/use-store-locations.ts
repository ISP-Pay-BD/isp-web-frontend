import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchList,
  fetchPaged,
  inventoryKeys,
  mapStoreLocation,
  pageParams,
  type ListParams,
} from '../api';

/** Server-paginated store locations (GET /v1/inventory/store-locations). */
export function useStoreLocations(list: ListParams) {
  const params = pageParams(list);
  return useQuery({
    queryKey: [...inventoryKeys.locations, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/store-locations`, params, mapStoreLocation, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** Store locations for dropdowns (per_page=100). */
export function useStoreLocationOptions(enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.locations, 'options'],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/store-locations`, { per_page: 100 }, mapStoreLocation, signal),
    enabled,
  });
}

export interface StoreLocationPayload {
  location_name: string;
  short_value: string;
}

/** POST /v1/inventory/store-locations or PUT …/{id}. */
export function useSaveStoreLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: StoreLocationPayload }) =>
      id
        ? http.put<unknown>(`${INVENTORY_URL}/store-locations/${id}`, body)
        : http.post<unknown>(`${INVENTORY_URL}/store-locations`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.locations });
      qc.invalidateQueries({ queryKey: inventoryKeys.stock });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}

export function useDeleteStoreLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`${INVENTORY_URL}/store-locations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.locations });
      qc.invalidateQueries({ queryKey: inventoryKeys.stock });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}
