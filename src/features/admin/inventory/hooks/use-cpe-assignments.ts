import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchList,
  fetchPaged,
  inventoryKeys,
  mapCpeAssignment,
  mapCustomerOption,
  pageParams,
  type CpeAssignPayload,
  type ListParams,
} from '../api';

export interface CpeListParams extends ListParams {
  status?: 'assigned' | 'returned' | '';
}

/** Server-paginated CPE / ONU assignments (GET /v1/inventory/cpe-assignments). */
export function useCpeAssignments({ status, ...list }: CpeListParams) {
  const params = { ...pageParams(list), status: status || undefined };
  return useQuery({
    queryKey: [...inventoryKeys.cpe, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/cpe-assignments`, params, mapCpeAssignment, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** Customer picker (GET /v1/inventory/customer-options?search=, up to 20). Pass an already-debounced search. */
export function useCustomerOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.customerOptions, search],
    queryFn: ({ signal }) => fetchList(`${INVENTORY_URL}/customer-options`, { search: search || undefined }, mapCustomerOption, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

function useCpeInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: inventoryKeys.cpe });
    qc.invalidateQueries({ queryKey: inventoryKeys.stock });
    qc.invalidateQueries({ queryKey: inventoryKeys.transactions });
    qc.invalidateQueries({ queryKey: inventoryKeys.summary });
  };
}

/** POST /v1/inventory/cpe-assignments — issues one unit from the location's stock. */
export function useAssignCpe() {
  const invalidate = useCpeInvalidation();
  return useMutation({
    mutationFn: (body: CpeAssignPayload) => http.post<unknown>(`${INVENTORY_URL}/cpe-assignments`, body),
    onSuccess: invalidate,
  });
}

/** POST /v1/inventory/cpe-assignments/{id}/return — +1 stock at `location_id` (defaults to the original). */
export function useReturnCpe() {
  const invalidate = useCpeInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { location_id?: string | number; note?: string } }) =>
      http.post<unknown>(`${INVENTORY_URL}/cpe-assignments/${id}/return`, body),
    onSuccess: invalidate,
  });
}
