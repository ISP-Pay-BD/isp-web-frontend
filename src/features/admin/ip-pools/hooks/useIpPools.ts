import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { IpPoolItem, RouterItem } from '@/data/admin/network-ops.data';

export function useIpPools() {
  return useQuery({
    queryKey: ['admin', 'ip-pools'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const [poolsRes, routersRes] = await Promise.allSettled([
        http.get<unknown>(`/v1/reseller/ip-pools/${resellerId}`),
        http.get<unknown>(`/v1/reseller/routers/${resellerId}`),
      ]);

      const pools = poolsRes.status === 'fulfilled'
        ? (Array.isArray(poolsRes.value) ? poolsRes.value : (poolsRes.value as { data?: unknown[] })?.data || [])
        : [];
      const routers = routersRes.status === 'fulfilled'
        ? (Array.isArray(routersRes.value) ? routersRes.value : (routersRes.value as { data?: unknown[] })?.data || [])
        : [];

      return {
        pools: pools as IpPoolItem[],
        routers: routers as RouterItem[],
      };
    },
  });
}
