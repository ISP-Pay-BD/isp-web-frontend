'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

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
      const data = await mockFetch('admin.domain', 'accounting');
      const acc = data as { otcReport?: OtcReportRow[] };
      return acc.otcReport ?? [];
    },
  });
}
