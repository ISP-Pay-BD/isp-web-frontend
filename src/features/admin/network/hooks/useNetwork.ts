import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { NetworkTopologyItem, NetworkMapNodeItem, OltDeviceItem } from '@/data/admin/network-ops.data';

export function useNetworkDiagram() {
  return useQuery({
    queryKey: ['admin', 'network', 'diagram'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as {
        networkTopologyData?: NetworkTopologyItem[];
        oltDevices?: OltDeviceItem[];
      };
      return {
        topology: data?.networkTopologyData ?? [],
        olts: data?.oltDevices ?? [],
      };
    },
  });
}

export function useNetworkMap() {
  return useQuery({
    queryKey: ['admin', 'network', 'map'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as {
        networkMapNodes?: NetworkMapNodeItem[];
      };
      return data?.networkMapNodes ?? [];
    },
  });
}
