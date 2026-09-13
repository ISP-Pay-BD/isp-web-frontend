'use client';

import { useQuery } from '@tanstack/react-query';
import { ispOpsData, type IspOpsData } from '@/data/admin/isp-ops.data';
import { adminService } from '@/lib/api/services/admin.service';

export function useIspOps() {
  return useQuery({
    queryKey: ['admin', 'domain', 'ispOps'],
    queryFn: async (): Promise<IspOpsData> => {
      try {
        const raw = await adminService.getNetworkOpsBundle();
        let liveData: Partial<IspOpsData> = {};
        if (raw && typeof raw === 'object') {
          if ('data' in raw && raw.data && typeof raw.data === 'object') {
            liveData = raw.data as Partial<IspOpsData>;
          } else {
            liveData = raw as Partial<IspOpsData>;
          }
        }

        return {
          ...ispOpsData,
          ...(liveData || {}),
          outages: liveData.outages && liveData.outages.length > 0 ? liveData.outages : ispOpsData.outages,
          ponPorts: liveData.ponPorts && liveData.ponPorts.length > 0 ? liveData.ponPorts : ispOpsData.ponPorts,
          cgnatMaps: liveData.cgnatMaps && liveData.cgnatMaps.length > 0 ? liveData.cgnatMaps : ispOpsData.cgnatMaps,
          netflowTopTalkers: liveData.netflowTopTalkers && liveData.netflowTopTalkers.length > 0 ? liveData.netflowTopTalkers : ispOpsData.netflowTopTalkers,
          ipoeSessions: liveData.ipoeSessions && liveData.ipoeSessions.length > 0 ? liveData.ipoeSessions : ispOpsData.ipoeSessions,
          workOrders: liveData.workOrders && liveData.workOrders.length > 0 ? liveData.workOrders : ispOpsData.workOrders,
          leads: liveData.leads && liveData.leads.length > 0 ? liveData.leads : ispOpsData.leads,
        };
      } catch {
        return ispOpsData;
      }
    },
  });
}


