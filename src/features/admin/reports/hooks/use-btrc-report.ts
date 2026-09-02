import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

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
      const data = await mockFetch('admin.domain', 'reports');
      const rep = data as { btrcSummary: BtrcSummary; btrcSubscribers: BtrcReportSubscriber[] };
      return {
        summary: rep.btrcSummary,
        subscribers: rep.btrcSubscribers ?? [],
      };
    },
  });

  return {
    ...query,
    summary: query.data?.summary,
    subscribers: query.data?.subscribers ?? [],
  };
}
