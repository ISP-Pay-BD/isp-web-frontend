import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { IpPoolItem, RouterItem } from '@/data/admin/network-ops.data';

export function useIpPools() {
  return useQuery({
    queryKey: ['admin', 'ip-pools'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as { ipPools?: IpPoolItem[]; routers?: RouterItem[] };
      return {
        pools: data?.ipPools ?? [],
        routers: data?.routers ?? [],
      };
    },
  });
}
