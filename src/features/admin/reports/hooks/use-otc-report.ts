'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export type OtcReportRow = {
  date: string;
  openingBdt: number;
  collectionsBdt: number;
  expensesBdt: number;
  closingBdt: number;
};

export function useOtcReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'otc'],
    queryFn: async () => {
      try {
        const raw = await adminService.getAccountingDomain('balance-sheet');
        if (Array.isArray(raw)) return raw as OtcReportRow[];
        if (raw && typeof raw === 'object' && 'otcReport' in raw && Array.isArray((raw as any).otcReport)) {
          return (raw as any).otcReport as OtcReportRow[];
        }
        return [];
      } catch {
        return [];
      }
    },
  });
}

