import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { asList, mapOnu, mapOnuListOlt, mapOnuSummary, mapPonPortStat, type OnuHealth } from '../types';
import { oltKeys } from './useOltDevices';

export interface OltOnuParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: OnuHealth | 'all';
}

/** One OLT's synced ONUs — server-paginated; summary / ports cover the whole OLT. */
export function useOltOnus(oltId: string, { page, pageSize, search, status }: OltOnuParams) {
  const params = {
    page,
    limit: pageSize,
    search: search || undefined,
    status: status && status !== 'all' ? status : undefined,
  };
  return useQuery({
    queryKey: oltKeys.onus(oltId, params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/olts/${encodeURIComponent(oltId)}/onus`, params);
      return {
        items: res.items.map(mapOnu),
        meta: res.meta,
        summary: mapOnuSummary(res.raw.summary),
        ponPorts: asList(res.raw.pon_ports).map(mapPonPortStat),
        lastSyncedAt: typeof res.raw.last_synced_at === 'string' ? res.raw.last_synced_at : null,
        olt: mapOnuListOlt(res.raw.olt),
      };
    },
    enabled: Boolean(oltId),
    placeholderData: keepPreviousData,
  });
}

/** Every synced ONU of one OLT for CSV export — one request (backend caps the unpaged read). */
export async function fetchAllOltOnus(oltId: string) {
  return (await http.getPage<unknown>(`/v1/olts/${encodeURIComponent(oltId)}/onus`)).items.map(mapOnu);
}
