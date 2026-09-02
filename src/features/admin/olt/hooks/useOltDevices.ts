import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { OltDeviceItem } from '@/data/admin/network-ops.data';

export function useOltDevices() {
  return useQuery({
    queryKey: ['admin', 'olt'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as { oltDevices?: OltDeviceItem[] };
      return data?.oltDevices ?? [];
    },
  });
}
