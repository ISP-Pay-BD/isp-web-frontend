'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { http, saveBlob } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { cleanParams, getPagedWithSummary } from '@/features/admin/customer-payments/api/paged';

type Raw = Record<string, unknown>;

/** First day of the current month / today, as YYYY-MM-DD (local time). */
export function monthToDateRange(): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return { from: `${today.slice(0, 8)}01`, to: today };
}

/* ───────────────────────────── Usage ───────────────────────────── */

export interface UsageRow {
  customerId: string;
  customerName: string;
  mobile: string;
  packageName: string;
  downloadGb: number;
  uploadGb: number;
  activeDays: number;
  lastSeen: string;
}

export interface UsageFilters {
  page: number;
  pageSize: number;
  search: string;
  from: string;
  to: string;
}

const mbToGb = (mb: unknown) => Math.round((num(mb) / 1024) * 100) / 100;

/** GET /v1/reseller/reports/usage — per-customer transfer in the window (rx = download). */
export function useUsageReport(filters: UsageFilters) {
  return useQuery({
    queryKey: ['admin', 'reports', 'usage', filters],
    queryFn: async ({ signal }) => {
      const res = await getPagedWithSummary<Raw>(
        '/v1/reseller/reports/usage',
        { page: filters.page, per_page: filters.pageSize, search: filters.search, from: filters.from, to: filters.to },
        signal,
      );
      const s = res.summary ?? {};
      return {
        meta: res.meta,
        summary: { customers: num(s.customers), downloadGb: mbToGb(s.rx_mb), uploadGb: mbToGb(s.tx_mb) },
        items: res.items.map(
          (r): UsageRow => ({
            customerId: str(r.customer_id),
            customerName: str(r.customer_name),
            mobile: str(r.mobile),
            packageName: str(r.package_name),
            downloadGb: mbToGb(r.rx_mb),
            uploadGb: mbToGb(r.tx_mb),
            activeDays: num(r.active_days),
            lastSeen: str(r.last_seen),
          }),
        ),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** GET /v1/reseller/reports/bandwidth — daily transfer series for the window (GB/day). */
export function useBandwidthSeries(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', 'bandwidth', range],
    queryFn: async () => {
      const r = await http.get<Raw>('/v1/reseller/reports/bandwidth', cleanParams(range));
      const points = Array.isArray(r.graphPoints) ? (r.graphPoints as Raw[]) : [];
      return points.map((p) => ({ date: str(p.time), downloadGb: num(p.inbound), uploadGb: num(p.outbound) }));
    },
  });
}

/* ───────────────────────── Package revenue ───────────────────────── */

export interface PackageRevenueRow {
  key: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  packageName: string;
  listPriceBdt: number | null;
  customers: number;
  activeCustomers: number;
  collectedBdt: number;
  payments: number;
}

/** GET /v1/reseller/reports/package-revenue — collected money per owner + package. */
export function usePackageRevenue(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', 'package-revenue', range],
    queryFn: async () => {
      const r = await http.get<Raw>('/v1/reseller/reports/package-revenue', cleanParams(range));
      const items = (Array.isArray(r.items) ? (r.items as Raw[]) : []).map(
        (i): PackageRevenueRow => ({
          key: `${str(i.owner_id)}:${str(i.package_id)}`,
          ownerId: str(i.owner_id),
          ownerName: str(i.owner_name),
          ownerRole: str(i.owner_role),
          packageName: str(i.package_name),
          listPriceBdt: i.list_price === null || i.list_price === undefined ? null : num(i.list_price),
          customers: num(i.customers),
          activeCustomers: num(i.active_customers),
          collectedBdt: num(i.collected),
          payments: num(i.payments),
        }),
      );
      const t = (r.totals ?? {}) as Raw;
      return {
        items,
        totals: {
          customers: num(t.customers),
          activeCustomers: num(t.active_customers),
          collectedBdt: num(t.collected),
          payments: num(t.payments),
        },
      };
    },
  });
}

/* ───────────────────────────── Cash book ───────────────────────────── */

export interface CashbookEntry {
  key: string;
  direction: 'in' | 'out';
  refId: string;
  at: string;
  amountBdt: number;
  method: string;
  reference: string;
  party: string;
  handledBy: string;
  note: string;
}

export interface CashbookFilters {
  page: number;
  pageSize: number;
  search: string;
  method: string;
  from: string;
  to: string;
}

/** GET /v1/reseller/reports/cashbook — collections (in) + expenses (out) for the window. */
export function useCashbook(filters: CashbookFilters) {
  return useQuery({
    queryKey: ['admin', 'reports', 'cashbook', filters],
    queryFn: async ({ signal }) => {
      const res = await getPagedWithSummary<Raw>(
        '/v1/reseller/reports/cashbook',
        { page: filters.page, per_page: filters.pageSize, search: filters.search, method: filters.method, from: filters.from, to: filters.to },
        signal,
      );
      const s = res.summary ?? {};
      const list = (v: unknown) => (Array.isArray(v) ? (v as Raw[]) : []);
      return {
        meta: res.meta,
        summary: {
          cashIn: num(s.cash_in),
          cashInCount: num(s.cash_in_count),
          cashOut: num(s.cash_out),
          cashOutCount: num(s.cash_out_count),
          net: num(s.net),
          expensesTracked: Boolean(s.expenses_tracked),
          daily: list(s.daily).map((d) => ({ date: str(d.date), cashIn: num(d.cash_in), cashOut: num(d.cash_out) })),
          byMethod: list(s.by_method).map((m) => ({ method: str(m.method), count: num(m.count), total: num(m.total) })),
          byCollector: list(s.by_collector).map((c) => ({ name: str(c.name), count: num(c.count), total: num(c.total) })),
        },
        items: res.items.map(
          (e): CashbookEntry => ({
            key: `${str(e.direction)}-${str(e.ref_id)}`,
            direction: str(e.direction) === 'out' ? 'out' : 'in',
            refId: str(e.ref_id),
            at: str(e.at),
            amountBdt: num(e.amount),
            method: str(e.method),
            reference: str(e.reference),
            party: str(e.party),
            handledBy: str(e.handled_by),
            note: str(e.note),
          }),
        ),
      };
    },
    placeholderData: keepPreviousData,
  });
}

export async function downloadCashbookCsv(filters: Omit<CashbookFilters, 'page' | 'pageSize'>) {
  const { blob, filename } = await http.download(
    '/v1/reseller/reports/export',
    cleanParams({ type: 'cashbook', from: filters.from, to: filters.to, method: filters.method, search: filters.search }),
  );
  saveBlob(blob, filename ?? 'cashbook.csv');
}
