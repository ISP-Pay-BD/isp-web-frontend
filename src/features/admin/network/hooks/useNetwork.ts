import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { NetworkTopologyItem, NetworkMapNodeItem, OltDeviceItem } from '@/data/admin/network-ops.data';
import { networkTopologyData, oltDevices } from '@/data/admin/network-ops.data';

export function useNetworkDiagram() {
  return useQuery({
    queryKey: ['admin', 'network', 'diagram'],
    queryFn: async () => {
      try {
        const [oltsRes, topoRes] = await Promise.allSettled([
          adminService.getOltList(),
          adminService.getNetworkTopology(),
        ]);

        let rawOlts: OltDeviceItem[] = [];
        if (oltsRes.status === 'fulfilled' && oltsRes.value) {
          const val = oltsRes.value as any;
          if (Array.isArray(val)) {
            rawOlts = val;
          } else if (Array.isArray(val?.data)) {
            rawOlts = val.data;
          }
        }

        let topology: NetworkTopologyItem[] = [];
        if (topoRes.status === 'fulfilled' && topoRes.value) {
          const val = topoRes.value as any;
          if (Array.isArray(val)) {
            topology = val;
          } else if (Array.isArray(val?.data)) {
            topology = val.data;
          }
        }

        // Fallback to mock data only if backend returned zero data
        if (rawOlts.length === 0) {
          rawOlts = oltDevices;
        }
        if (topology.length === 0 && rawOlts === oltDevices) {
          topology = networkTopologyData;
        }

        return {
          topology,
          olts: rawOlts,
        };
      } catch {
        return {
          topology: networkTopologyData,
          olts: oltDevices,
        };
      }
    },
  });
}

export function useNetworkMap() {
  return useQuery({
    queryKey: ['admin', 'network', 'map'],
    queryFn: async () => {
      try {
        const routers = await adminService.getRouters();
        if (!Array.isArray(routers)) return [];
        return routers.map((r: any, idx: number) => ({
          id: String(r.id || `map_${idx + 1}`),
          type: (idx === 0 ? 'core' : 'pop') as 'core' | 'pop',
          level: (idx === 0 ? 'Root' : 'L1') as 'Root' | 'L1',
          name: String(r.name || `POP ${idx + 1}`),
          lat: Number(r.latitude || 23.8103 + idx * 0.01),
          lng: Number(r.longitude || 90.4125 + idx * 0.01),
          status: (r.status === 'online' || r.status === 'active' ? 'online' : 'offline') as 'online' | 'offline',
          ip: String(r.ip || r.host || '10.0.0.1'),
          deviceModel: String(r.model || 'MikroTik CCR'),
          connectedCount: Number(r.users || 0),
          zone: String(r.area || 'Main Coverage'),
        })) as NetworkMapNodeItem[];
      } catch {
        return [];
      }
    },
  });
}


