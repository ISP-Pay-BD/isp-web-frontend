import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import {
  INVENTORY_URL,
  fetchPaged,
  idParam,
  inventoryKeys,
  mapStockRow,
  mapStockTransaction,
  pageParams,
  type ListParams,
  type StockTransactionPayload,
  type StockTxnType,
} from '../api';

export interface StockListParams extends ListParams {
  locationId?: string;
}

/** Server-paginated stock on hand per store location (GET /v1/inventory/stock). */
export function useStock({ locationId, ...list }: StockListParams) {
  const params = { ...pageParams(list), location_id: idParam(locationId) };
  return useQuery({
    queryKey: [...inventoryKeys.stock, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/stock`, params, mapStockRow, { signal }),
    placeholderData: keepPreviousData,
  });
}

/**
 * Current on-hand quantity of one item at one location (for out/adjust/transfer forms).
 * Filtered server-side by location + catalogue key (`item_id`).
 */
export function useStockLevel(itemId: string, locationId: string) {
  const enabled = Boolean(itemId && locationId);
  return useQuery({
    queryKey: [...inventoryKeys.stock, 'level', { itemId, locationId }],
    queryFn: async ({ signal }) => {
      const res = await fetchPaged(
        `${INVENTORY_URL}/stock`,
        { location_id: idParam(locationId), item_id: itemId, page: 1, per_page: 100 },
        mapStockRow,
        { signal },
      );
      return res.items.find((r) => r.itemId === itemId && r.locationId === locationId)?.quantity ?? 0;
    },
    enabled,
    staleTime: 0,
  });
}

export interface TransactionListParams extends ListParams {
  type?: StockTxnType | '';
  locationId?: string;
  fromDate?: string;
  toDate?: string;
}

/** Server-paginated stock movements (GET /v1/inventory/transactions). */
export function useStockTransactions({ type, locationId, fromDate, toDate, ...list }: TransactionListParams) {
  const params = {
    ...pageParams(list),
    type: type || undefined,
    location_id: idParam(locationId),
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };
  return useQuery({
    queryKey: [...inventoryKeys.transactions, params],
    queryFn: ({ signal }) => fetchPaged(`${INVENTORY_URL}/transactions`, params, mapStockTransaction, { signal }),
    placeholderData: keepPreviousData,
  });
}

/** POST /v1/inventory/transactions — stock in / out / adjust (counted qty) / transfer. */
export function useRecordStockTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StockTransactionPayload) => http.post<unknown>(`${INVENTORY_URL}/transactions`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.stock });
      qc.invalidateQueries({ queryKey: inventoryKeys.transactions });
      qc.invalidateQueries({ queryKey: inventoryKeys.summary });
    },
  });
}
