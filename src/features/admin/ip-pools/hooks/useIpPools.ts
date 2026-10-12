import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num } from '@/lib/api/case';
import {
  mapIpPool,
  mapIpPoolAvailability,
  mapIpPoolSummary,
  type IpPoolType,
} from '../types';

export const ipPoolKeys = {
  all: ['admin', 'ip-pools'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'ip-pools', 'list', params] as const,
  available: (id: string) => ['admin', 'ip-pools', 'available', id] as const,
};

export interface IpPoolListParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: IpPoolType;
}

/** Server-paginated pool list + tenant-wide summary (`data.summary`). */
export function useIpPools({ page, pageSize, search, type }: IpPoolListParams) {
  const params = { page, limit: pageSize, search: search || undefined, pool_type: type || undefined };
  return useQuery({
    queryKey: ipPoolKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/ip-pools', params, { listKey: 'pools', signal });
      return { items: res.items.map(mapIpPool), meta: res.meta, summary: mapIpPoolSummary(res.raw.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

/** Free addresses of one pool, fetched on demand (backend caps at 50). */
export function useIpPoolAvailability(poolId: string | null) {
  return useQuery({
    queryKey: ipPoolKeys.available(poolId ?? ''),
    queryFn: async ({ signal }) =>
      mapIpPoolAvailability(await http.get<unknown>(`/v1/ip-pools/${poolId}/available`, { limit: 50 }, signal)),
    enabled: Boolean(poolId),
    staleTime: 0,
  });
}

/** Body keys match IpPoolService::validatedPool (snake_case). */
export type IpPoolPayload = Record<string, unknown>;

interface RouterSyncResult {
  routerSynced: boolean;
}

/**
 * Create (POST /v1/ip-pools) or update (PUT /v1/ip-pools/{id}).
 * `silent`: the form maps field errors + toasts via handleApiError itself.
 */
export function useSaveIpPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: IpPoolPayload }): Promise<RouterSyncResult> => {
      const res = id
        ? await http.put<Record<string, unknown>>(`/v1/ip-pools/${id}`, body)
        : await http.post<Record<string, unknown>>('/v1/ip-pools', body);
      // Only create pushes to the MikroTik; update is DB-only (backend parity with web).
      return { routerSynced: id ? true : res?.router_synced === true };
    },
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: ipPoolKeys.all }),
  });
}

/** DELETE /v1/ip-pools/{id} — 409 POOL_IN_USE while assignments are active. */
export function useDeleteIpPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<RouterSyncResult> => {
      const res = await http.delete<Record<string, unknown>>(`/v1/ip-pools/${id}`);
      return { routerSynced: res?.router_synced === true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ipPoolKeys.all }),
  });
}

/** POST /v1/ip-pools/sync/{routerId} — upserts pools from the router's /ip/pool. */
export function useSyncIpPools() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (routerId: string) => {
      const res = await http.post<Record<string, unknown>>(`/v1/ip-pools/sync/${routerId}`);
      return { synced: num(res?.synced), found: num(res?.found) };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ipPoolKeys.all }),
  });
}
