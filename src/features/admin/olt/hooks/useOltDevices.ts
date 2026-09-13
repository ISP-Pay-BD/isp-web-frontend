import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { OltDeviceItem } from '@/data/admin/network-ops.data';

export function useOltDevices() {
  return useQuery({
    queryKey: ['admin', 'olt'],
    queryFn: async () => {
      try {
        const res = await adminService.getOltList();
        if (Array.isArray(res)) return res as OltDeviceItem[];
        if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: unknown[] }).data)) {
          return (res as { data: OltDeviceItem[] }).data;
        }
        return [];
      } catch {
        return [];
      }
    },
  });
}

