'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { MeteringRow, SlaRow, TenantHealthCard, BillingModeRow } from '@/data/platform/catalog.data';

export function usePlatformMetering() {
  return useQuery({
    queryKey: ['platform', 'domain', 'metering'],
    queryFn: async () => {
      const res = (await mockFetch('platform.domain', 'metering')) as { items: MeteringRow[] };
      return res.items;
    },
  });
}

export function usePlatformSla() {
  return useQuery({
    queryKey: ['platform', 'domain', 'sla'],
    queryFn: async () => {
      const res = (await mockFetch('platform.domain', 'sla')) as { items: SlaRow[] };
      return res.items;
    },
  });
}

export function useTenantHealth(tenantId: string) {
  return useQuery({
    queryKey: ['platform', 'domain', 'tenantHealth', tenantId],
    queryFn: async () => {
      const map = (await mockFetch('platform.domain', 'tenantHealth')) as Record<string, TenantHealthCard>;
      return map[tenantId] ?? map.tenant_demo ?? map.ten_01;
    },
  });
}

export function useBillingMode(adminId: string) {
  return useQuery({
    queryKey: ['platform', 'domain', 'billingModes', adminId],
    queryFn: async () => {
      const res = (await mockFetch('platform.domain', 'billingModes')) as { items: BillingModeRow[] };
      return res.items.find((r) => r.adminId === adminId) ?? res.items[0];
    },
  });
}
