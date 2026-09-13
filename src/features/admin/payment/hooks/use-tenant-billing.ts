'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { getAuthUserId } from '@/lib/api/auth-utils';
import type { TenantBillingPayment } from '@/data/admin/tenant-billing.data';

export function useTenantBilling() {
  return useQuery({
    queryKey: ['admin', 'domain', 'tenantBilling'],
    queryFn: async () => {
      const resellerId = getAuthUserId();
      const res = await http.get<unknown>(`/v1/reseller/transactions/${resellerId}`);
      if (res && typeof res === 'object' && 'items' in res) {
        return res as {
          items: TenantBillingPayment[];
          summary: { totalPaidBdt: number; pendingBdt: number; lastPaymentDate: string };
        };
      }
      return {
        items: Array.isArray(res) ? (res as TenantBillingPayment[]) : [],
        summary: { totalPaidBdt: 0, pendingBdt: 0, lastPaymentDate: new Date().toISOString() },
      };
    },
  });
}
