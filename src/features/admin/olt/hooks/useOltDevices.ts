import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, http } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import { asList, mapBrandOption, mapBrandUsage, mapOlt, mapOltSummary } from '../types';

export const oltKeys = {
  /** Everything derived from the OLT tables (lists, ONUs, topology). */
  all: ['admin', 'olt'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'olt', 'list', params] as const,
  options: ['admin', 'olt', 'options'] as const,
  catalog: ['admin', 'olt', 'catalog'] as const,
  onus: (id: string, params: Record<string, unknown>) => ['admin', 'olt', 'onus', id, params] as const,
  topology: (params: Record<string, unknown>) => ['admin', 'olt', 'topology', params] as const,
  /** Live device read — kept outside `all` so list invalidation never re-runs it. */
  diagnostics: (id: string) => ['admin', 'olt-diagnostics', id] as const,
};

/**
 * Device actions run the vendor script server-side (60 s timeout + kill
 * grace), longer than the client's default 30 s request timeout.
 */
const DEVICE_TIMEOUT_MS = 100_000;

export async function devicePost<T>(url: string): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, {}, { timeout: DEVICE_TIMEOUT_MS });
  return res.data.data;
}

export interface OltListParams {
  page: number;
  pageSize: number;
  search?: string;
  brand?: string;
}

/** Paginated OLT list + tenant-wide KPI totals and the brand catalogue. */
export function useOltDevices({ page, pageSize, search, brand }: OltListParams) {
  const params = { page, limit: pageSize, search: search || undefined, brand: brand || undefined };
  return useQuery({
    queryKey: oltKeys.list(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/olts', params);
      return {
        items: res.items.map(mapOlt),
        meta: res.meta,
        summary: mapOltSummary(res.raw.summary),
        brands: asList(res.raw.brands).map(mapBrandOption),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** OLTs for pickers (diagram filter) + the tenant's OLT count. */
export function useOltOptions() {
  return useQuery({
    queryKey: oltKeys.options,
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/olts', { page: 1, limit: 100 });
      return { items: res.items.map(mapOlt), total: res.meta.total };
    },
  });
}

/** Brand catalogue + per-vendor usage + totals, without loading the OLT rows. */
export function useOltCatalog() {
  return useQuery({
    queryKey: oltKeys.catalog,
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/olts', { page: 1, limit: 1 });
      return {
        brands: asList(res.raw.brands).map(mapBrandOption),
        usage: asList(res.raw.brand_counts).map(mapBrandUsage),
        summary: mapOltSummary(res.raw.summary),
      };
    },
  });
}

/** Whole directory for CSV export — one request (no paging params → backend's capped single page). */
export async function fetchAllOlts() {
  return (await http.getPage<unknown>('/v1/olts')).items.map(mapOlt);
}

/** Create (POST /v1/olts) or update (PUT /v1/olts/{id}); body is the backend's snake_case fields. */
export function useSaveOlt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      id ? http.put<unknown>(`/v1/olts/${id}`, body) : http.post<unknown>('/v1/olts', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: oltKeys.all }),
  });
}

/** DELETE /v1/olts/{id} — also drops its synced ONU cache. */
export function useDeleteOlt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/olts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: oltKeys.all }),
  });
}

/** POST /v1/olts/{id}/reboot — the vendor "line refresh" action. Callers toast the outcome (loading → result). */
export function useRebootOlt() {
  return useMutation({
    meta: { silent: true },
    mutationFn: (id: string) => devicePost<{ olt_id?: string; rebooted?: boolean }>(`/v1/olts/${id}/reboot`),
  });
}

/** POST /v1/olts/{id}/sync — reads every ONU from the device and replaces the cache (slow). */
export function useSyncOlt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => devicePost<{ olt_id?: string; synced?: number }>(`/v1/olts/${id}/sync`),
    onSuccess: () => qc.invalidateQueries({ queryKey: oltKeys.all }),
  });
}
