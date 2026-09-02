import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

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
      const data = await mockFetch('admin.domain', 'accounting');
      return (data as { chartOfAccounts: ChartOfAccountItem[] }).chartOfAccounts ?? [];
    },
  });

  return {
    ...query,
    accounts: query.data ?? [],
  };
}
