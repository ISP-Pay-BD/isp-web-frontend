import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type { NetworkTopologyItem, NetworkMapNodeItem, OltDeviceItem } from '@/data/admin/network-ops.data';

export function useNetworkDiagram() {
  return useQuery({
    queryKey: ['admin', 'network', 'diagram'],
    queryFn: async () => {
      try {
        const [routersRes, oltsRes] = await Promise.allSettled([
          adminService.getRouters(),
          adminService.getOltList(),
        ]);

        const rawOlts = oltsRes.status === 'fulfilled' && Array.isArray(oltsRes.value) ? (oltsRes.value as OltDeviceItem[]) : [];
        const rawRouters = routersRes.status === 'fulfilled' && Array.isArray(routersRes.value) ? (routersRes.value as any[]) : [];

        const topology: NetworkTopologyItem[] = rawRouters.map((r: any, idx: number) => ({
          oltId: String(r.id || `olt_${idx + 1}`),
          oltName: String(r.name || r.nasname || `POP Router ${idx + 1}`),
          ponPort: `PON 1/${(idx % 4) + 1}`,
          splitter: `Splitter S${idx + 1} (1:8)`,
          onuId: `ONU-${idx + 1}`,
          customerName: String(r.name || `Client ${idx + 1}`),
          rxPowerDbm: -19.5,
          txPowerDbm: 2.1,
          status: (r.status === 'online' || r.status === 'active' ? 'online' : 'offline') as 'online' | 'offline',
          zone: String(r.area || 'Main Coverage'),
          mac: String(r.mac || '48:57:02:11:A3:8F'),
        }));

        return {
          topology,
          olts: rawOlts,
        };
      } catch {
        return {
          topology: [],
          olts: [],
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


