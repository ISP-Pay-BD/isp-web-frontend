import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export interface ChartOfAccountItem {
  id: string;
  code: string;
  name: string;
  type: string;
  balanceBdt: number;
  parentId?: string;
}

export function useChartOfAccounts() {
  const query = useQuery({
    queryKey: ['admin', 'accounting', 'chart-of-accounts'],
    queryFn: async () => {
      const data = await adminService.getAccountingDomain('chart-of-accounts');
      if (data && typeof data === 'object' && 'chartOfAccounts' in data) {
        return (data as { chartOfAccounts: ChartOfAccountItem[] }).chartOfAccounts ?? [];
      }
      if (Array.isArray(data)) {
        return data as ChartOfAccountItem[];
      }
      return [];
    },
  });

  return {
    ...query,
    accounts: query.data ?? [],
  };
}
