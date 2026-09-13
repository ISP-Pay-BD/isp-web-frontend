import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
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
      try {
        const [plansRes, usersRes, routersRes] = await Promise.allSettled([
          adminService.getHotspotPlans(),
          adminService.getHotspotActiveUsers(),
          adminService.getRouters(),
        ]);

        const profiles = plansRes.status === 'fulfilled' && Array.isArray(plansRes.value) ? (plansRes.value as HotspotProfileItem[]) : [];
        const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? (usersRes.value as HotspotUserItem[]) : [];
        const routers = routersRes.status === 'fulfilled' && Array.isArray(routersRes.value) ? (routersRes.value as RouterItem[]) : [];

        return {
          profiles,
          users,
          reports: [] as HotspotReportItem[],
          routers,
        };
      } catch {
        return {
          profiles: [],
          users: [],
          reports: [],
          routers: [],
        };
      }
    },
  });
}

