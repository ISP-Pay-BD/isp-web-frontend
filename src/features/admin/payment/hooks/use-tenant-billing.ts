'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import { getPagedWithSummary } from '@/features/admin/customer-payments/api/paged';
import { toLedgerStatus, toMethodKey } from '@/features/admin/customer-payments/lib/mappers';
import type { LedgerStatus, MethodKey } from '@/features/admin/customer-payments/types';

/** The tenant's own platform payments (subscription, wallet top-up, fund). */
export interface PlatformPayment {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  methodRaw: string;
  method: MethodKey;
  status: LedgerStatus;
  createdAt: string;
  paidAt: string | null;
  description: string;
  period: string;
  trxId: string;
  gateway: string | null;
  gatewayRef: string | null;
}

export interface PlatformPaymentSummary {
  count: number;
  paidAmount: number;
  pendingAmount: number;
  paidCount: number;
  pendingCount: number;
  lastPaidAt: string | null;
}

export interface TenantBillingFilters {
  page: number;
  pageSize: number;
  search: string;
  status: 'all' | 'successful' | 'pending' | 'failed';
}

type Raw = Record<string, unknown>;

function describe(r: Raw, meta: Raw): string {
  const purpose = str(meta.purpose ?? meta.channel);
  if (purpose === 'wallet_topup') return 'Wallet top-up';
  const comment = str(r.comment);
  if (comment) return comment;
  if (purpose === 'reseller_self_recharge') return 'Subscription recharge';
  if (str(r.user_type) === 'resellerAdmin') return 'Fund top-up';
  return 'Platform payment';
}

export function mapPlatformPayment(r: Raw): PlatformPayment {
  let meta: Raw = {};
  try {
    const parsed = JSON.parse(str(r.custom_data) || '{}');
    if (parsed && typeof parsed === 'object') meta = parsed as Raw;
  } catch {
    meta = {};
  }
  const id = str(r.id);
  const created = str(r.created_at);
  const methodRaw = str(r.paid_via);
  const year = created.slice(0, 4);
  return {
    id,
    invoiceNo: str(r.invoice) || `#${id}`,
    amountBdt: num(r.amount),
    methodRaw,
    method: toMethodKey(methodRaw),
    status: toLedgerStatus(r.status),
    createdAt: created,
    paidAt: r.paid_at ? str(r.paid_at) : null,
    description: describe(r, meta),
    period: [str(r.month), year].filter(Boolean).join(' '),
    trxId: str(r.method_trx),
    gateway: meta.gw_provider ? str(meta.gw_provider) : null,
    gatewayRef: meta.gw_ref ? str(meta.gw_ref) : null,
  };
}

/** GET /v1/reseller/payments/{rid} — server page + whole-set summary. */
export function useTenantBilling(filters: TenantBillingFilters) {
  return useQuery({
    queryKey: ['admin', 'tenant-billing', filters],
    queryFn: async ({ signal }) => {
      const res = await getPagedWithSummary(
        `/v1/reseller/payments/${getResellerId()}`,
        { page: filters.page, per_page: filters.pageSize, search: filters.search, status: filters.status },
        signal,
      );
      const s = res.summary ?? {};
      const summary: PlatformPaymentSummary = {
        count: num(s.count),
        paidAmount: num(s.paid_amount),
        pendingAmount: num(s.pending_amount),
        paidCount: num(s.paid_count),
        pendingCount: num(s.pending_count),
        lastPaidAt: s.last_paid_at ? str(s.last_paid_at) : null,
      };
      return { items: res.items.map(mapPlatformPayment), meta: res.meta, summary };
    },
    placeholderData: keepPreviousData,
  });
}
