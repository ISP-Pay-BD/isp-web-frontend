import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export interface BtrcSummary {
  totalSubscribers: number;
  totalBandwidthGbps: number;
  totalRevenueBdt: number;
  homeSubscribers: number;
  corporateSubscribers: number;
}

export interface BtrcReportSubscriber {
  sl: number;
  clientName: string;
  mobile: string;
  packageName: string;
  bandwidthMbps: number;
  priceBdt: number;
  area: string;
  clientType: string;
  status: string;
}

export function useBtrcReport() {
  const query = useQuery({
    queryKey: ['admin', 'reports', 'btrc'],
    queryFn: async () => {
      const [dashRes, custRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getCustomers({ limit: 100 }),
      ]);

      const totalSubs = dashRes.status === 'fulfilled' ? dashRes.value.totalCustomers : 0;
      const totalRev = dashRes.status === 'fulfilled' ? dashRes.value.monthlyCollectionBdt : 0;
      const customers = custRes.status === 'fulfilled' ? custRes.value.items : [];

      const subscribers: BtrcReportSubscriber[] = customers.map((c, idx) => ({
        sl: idx + 1,
        clientName: c.name,
        mobile: c.phone || '',
        packageName: c.packageName || 'Standard',
        bandwidthMbps: 20,
        priceBdt: c.packagePrice || 800,
        area: c.areaName || 'Main POP',
        clientType: 'Home',
        status: c.status,
      }));

      return {
        summary: {
          totalSubscribers: totalSubs,
          totalBandwidthGbps: Math.round((totalSubs * 15) / 1000) || 0,
          totalRevenueBdt: totalRev,
          homeSubscribers: totalSubs,
          corporateSubscribers: 0,
        },
        subscribers,
      };
    },
  });

  return {
    ...query,
    summary: query.data?.summary,
    subscribers: query.data?.subscribers ?? [],
  };
}
