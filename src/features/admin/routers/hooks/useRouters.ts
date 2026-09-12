import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { RouterItem } from '@/data/admin/network-ops.data';

export function useRouters() {
  return useQuery({
    queryKey: ['admin', 'routers'],
    queryFn: async () => {
      const routers = await adminService.getRouters();
      return (routers as RouterItem[]) ?? [];
    },
  });
}
