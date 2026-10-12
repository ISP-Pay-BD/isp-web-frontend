import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { INVENTORY_URL, inventoryKeys, mapSummary } from '../api';

/** GET /v1/inventory/summary — tenant-wide KPI counts for every inventory/purchase screen. */
export function useInventorySummary() {
  return useQuery({
    queryKey: inventoryKeys.summary,
    queryFn: async ({ signal }) => mapSummary(await http.get<unknown>(`${INVENTORY_URL}/summary`, undefined, signal)),
  });
}
