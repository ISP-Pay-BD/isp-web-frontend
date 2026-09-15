'use client';

import { useQuery } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import type { MeteringRow, SlaRow, TenantHealthCard, BillingModeRow } from '@/data/platform/catalog.data';

export function usePlatformMetering() {
  return useQuery({
    queryKey: ['platform', 'domain', 'metering'],
    queryFn: async () => {
      const raw = await platformService.getMetering();
      if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown[] }).items)) {
        return (raw as { items: MeteringRow[] }).items;
      }
      return [];
    },
  });
}

export function usePlatformSla() {
  return useQuery({
    queryKey: ['platform', 'domain', 'sla'],
    queryFn: async () => {
      const raw = await platformService.getSla();
      if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown[] }).items)) {
        return (raw as { items: SlaRow[] }).items;
      }
      return [];
    },
  });
}

export function useTenantHealth(tenantId: string) {
  return useQuery({
    queryKey: ['platform', 'domain', 'tenantHealth', tenantId],
    queryFn: async () => {
      const raw = await platformService.getTenantHealth(tenantId);
      if (raw && typeof raw === 'object') {
        return raw as TenantHealthCard;
      }
      return null;
    },
  });
}

export function useBillingMode(adminId: string) {
  return useQuery({
    queryKey: ['platform', 'domain', 'billingModes', adminId],
    queryFn: async () => {
      const raw = await platformService.getTenants({ q: adminId });
      const tenants = Array.isArray(raw) ? raw : ((raw as { items?: unknown[] })?.items ?? []);
      const match = (tenants as Record<string, unknown>[]).find((t) => t.id === adminId || t.admin_id === adminId);
      return {
        adminId,
        tenantName: String(match?.name ?? match?.tenant_name ?? ''),
        mode: (String(match?.billing_mode ?? 'prepaid') as 'prepaid' | 'postpaid'),
        walletBdt: Number(match?.wallet_balance ?? 0),
        nextInvoiceAt: match?.next_invoice_at ? String(match.next_invoice_at) : null,
      } as BillingModeRow;
    },
  });
}
