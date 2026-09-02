'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { TenantBillingPayment } from '@/data/admin/tenant-billing.data';

export function useTenantBilling() {
  return useQuery({
    queryKey: ['admin', 'domain', 'tenantBilling'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'tenantBilling');
      return res as {
        items: TenantBillingPayment[];
        summary: { totalPaidBdt: number; pendingBdt: number; lastPaymentDate: string };
      };
    },
  });
}
