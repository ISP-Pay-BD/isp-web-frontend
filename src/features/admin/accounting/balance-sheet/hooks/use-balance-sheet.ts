import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export interface BalanceSheetData {
  asOf: string;
  assets: { totalBdt: number; items: Array<{ name: string; amountBdt: number }> };
  liabilities: { totalBdt: number; items: Array<{ name: string; amountBdt: number }> };
  equity: { totalBdt: number };
}

export function useBalanceSheet() {
  const query = useQuery({
    queryKey: ['admin', 'accounting', 'balance-sheet'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'accounting');
      return (data as { balanceSheet: BalanceSheetData }).balanceSheet;
    },
  });

  return { ...query, balanceSheet: query.data };
}
