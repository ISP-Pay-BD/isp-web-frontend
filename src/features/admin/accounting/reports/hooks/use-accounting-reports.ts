import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export interface AccountingReportItem {
  id: string;
  name: string;
  period: string;
  netBdt: number;
  grossRevenueBdt?: number;
  totalExpensesBdt?: number;
  marginPct?: number;
  type?: string;
  activePops?: number;
  topPerformer?: string;
}

export function useAccountingReports() {
  const query = useQuery({
    queryKey: ['admin', 'accounting', 'reports'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'accounting');
      const acc = data as { accountingReports: AccountingReportItem[]; otcReport: unknown[] };
      return {
        reports: acc.accountingReports ?? [],
        otc: acc.otcReport ?? [],
      };
    },
  });

  return {
    ...query,
    reports: query.data?.reports ?? [],
    otcReport: query.data?.otc ?? [],
  };
}
