import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

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
      const data = await adminService.getAccountingDomain('balance-sheet');
      if (data && typeof data === 'object' && 'balanceSheet' in data) {
        return (data as { balanceSheet: BalanceSheetData }).balanceSheet;
      }
      return data as BalanceSheetData;
    },
  });

  return { ...query, balanceSheet: query.data };
}
