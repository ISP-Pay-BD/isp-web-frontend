import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type {
  HotspotProfileItem,
  HotspotUserItem,
  HotspotReportItem,
  RouterItem,
} from '@/data/admin/network-ops.data';

export function useHotspotData() {
  return useQuery({
    queryKey: ['admin', 'hotspot'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as {
        hotspotProfiles?: HotspotProfileItem[];
        hotspotUsers?: HotspotUserItem[];
        hotspotReports?: HotspotReportItem[];
        routers?: RouterItem[];
      };
      return {
        profiles: data?.hotspotProfiles ?? [],
        users: data?.hotspotUsers ?? [],
        reports: data?.hotspotReports ?? [],
        routers: data?.routers ?? [],
      };
    },
  });
}
