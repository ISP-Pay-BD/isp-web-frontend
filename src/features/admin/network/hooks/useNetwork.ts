import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { oltKeys } from '@/features/admin/olt/hooks/useOltDevices';
import { asList } from '@/features/admin/olt/types';
import { buildMapNodes, mapTopologyOnu, mapTopologyPort } from '../types';

/** ONU leaves drawn per request; port totals always cover every ONU. */
export const TOPOLOGY_LEAF_LIMIT = 300;

export const networkKeys = {
  nodes: ['admin', 'network', 'nodes'] as const,
};

/**
 * GET /v1/olts/{id|all}/topology — complete per-PON totals plus a capped
 * list of ONU leaves (narrow with `ponPort` to see every ONU of a port).
 */
export function useNetworkTopology(oltId: string, ponPort: string) {
  const params = { limit: TOPOLOGY_LEAF_LIMIT, pon_port: ponPort === 'all' ? undefined : ponPort };
  return useQuery({
    queryKey: oltKeys.topology({ oltId, ...params }),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/olts/${encodeURIComponent(oltId || 'all')}/topology`, params);
      return {
        items: res.items.map(mapTopologyOnu),
        total: res.meta.total,
        truncated: res.raw.truncated === true,
        ponPorts: asList(res.raw.pon_ports).map(mapTopologyPort),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/network/nodes — the tenant's network map nodes with real coordinates. */
export function useNetworkNodes() {
  return useQuery({
    queryKey: networkKeys.nodes,
    queryFn: async () => {
      const data = await http.get<{ items?: unknown; total?: unknown; truncated?: unknown }>('/v1/network/nodes');
      const items = asList(data?.items);
      return {
        nodes: buildMapNodes(items),
        total: Number(data?.total ?? items.length) || items.length,
        truncated: data?.truncated === true,
      };
    },
  });
}
