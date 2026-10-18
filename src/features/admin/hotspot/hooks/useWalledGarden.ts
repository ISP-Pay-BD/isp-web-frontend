'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapWalledGardenRule, mapWalledGardenSummary } from '../types';
import { deviceRetry, hotspotKeys, type PageParams } from './useHotspotData';

/** GET /v1/hotspot/walled-garden — the router's pre-login host rules (paginated + searched server-side). */
export function useWalledGarden(routerId: string | null, { page, pageSize, search }: PageParams) {
  return useQuery({
    queryKey: [...hotspotKeys.walledGarden(routerId ?? ''), { page, pageSize, search }],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/hotspot/walled-garden', {
        router_id: routerId,
        page,
        limit: pageSize,
        search: search || undefined,
      });
      return {
        items: res.items.map(mapWalledGardenRule),
        meta: res.meta,
        summary: mapWalledGardenSummary(res.raw.summary),
      };
    },
    enabled: Boolean(routerId),
    retry: deviceRetry,
    placeholderData: keepPreviousData,
  });
}

export interface WalledGardenInput {
  dstHost?: string;
  action?: 'allow' | 'deny';
  comment?: string;
  enabled?: boolean;
}

const toBody = (input: WalledGardenInput) => ({
  dst_host: input.dstHost,
  action: input.action,
  comment: input.comment,
  enabled: input.enabled,
});

export function useSaveWalledGardenRule(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: WalledGardenInput & { id?: string }) =>
      id
        ? http.put('/v1/hotspot/walled-garden', { id, ...toBody(input) }, { router_id: routerId })
        : http.post('/v1/hotspot/walled-garden', toBody(input), { router_id: routerId }),
    onSuccess: () => {
      if (routerId) void qc.invalidateQueries({ queryKey: hotspotKeys.walledGarden(routerId) });
    },
  });
}

export function useDeleteWalledGardenRule(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete('/v1/hotspot/walled-garden', { router_id: routerId, id }),
    onSuccess: () => {
      if (routerId) void qc.invalidateQueries({ queryKey: hotspotKeys.walledGarden(routerId) });
    },
  });
}
