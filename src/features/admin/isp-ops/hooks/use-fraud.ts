'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * Fraud / account-sharing flags (/v1/network-ops/fraud/*): duplicate MAC,
 * NID or phone across the tenant's customers, found by a real SQL scan.
 */

export type FraudRule = 'duplicate_mac' | 'duplicate_nid' | 'duplicate_phone';
export type FraudStatus = 'open' | 'resolved' | 'ignored';

export interface FraudCustomer {
  id: string;
  name: string;
  mobile: string | null;
  pppoeId: string | null;
  routerId: string | null;
  status: string;
}

export interface FraudFlag {
  id: string;
  rule: FraudRule;
  matchValue: string;
  userCount: number;
  customers: FraudCustomer[];
  status: FraudStatus;
  note: string | null;
  firstDetectedAt: string | null;
  lastDetectedAt: string | null;
  resolvedAt: string | null;
}

export interface FraudSummary {
  open: number;
  resolved: number;
  ignored: number;
  monitoredCustomers: number;
  lastScanAt: string | null;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;

function mapFlag(raw: unknown): FraudFlag {
  const r = obj(raw);
  const status = str(r.status);
  return {
    id: str(r.id),
    rule: str(r.rule) as FraudRule,
    matchValue: str(r.match_value),
    userCount: num(r.user_count),
    customers: (Array.isArray(r.customers) ? r.customers : []).map((c) => {
      const x = obj(c);
      return { id: str(x.id), name: str(x.name), mobile: opt(x.mobile), pppoeId: opt(x.pppoe_id), routerId: opt(x.router_id), status: str(x.status) };
    }),
    status: status === 'resolved' || status === 'ignored' ? status : 'open',
    note: opt(r.note),
    firstDetectedAt: opt(r.first_detected_at),
    lastDetectedAt: opt(r.last_detected_at),
    resolvedAt: opt(r.resolved_at),
  };
}

function mapSummary(raw: unknown): FraudSummary {
  const s = obj(raw);
  return { open: num(s.open), resolved: num(s.resolved), ignored: num(s.ignored), monitoredCustomers: num(s.monitored_customers), lastScanAt: opt(s.last_scan_at) };
}

const fraudKeys = {
  all: ['admin', 'fraud'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'fraud', 'list', params] as const,
};

export function useFraudFlags({ page, pageSize, search, status }: { page: number; pageSize: number; search?: string; status?: string }) {
  const params = { page, limit: pageSize, search: search || undefined, status: status || undefined };
  return useQuery({
    queryKey: fraudKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/fraud/flags', params, { signal });
      return { items: res.items.map(mapFlag), meta: res.meta, summary: mapSummary(res.raw.summary) };
    },
    placeholderData: keepPreviousData,
  });
}

export function useRunFraudScan() {
  const qc = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: async () => obj(await http.post<unknown>('/v1/network-ops/fraud/scan')),
    onSuccess: (r) => {
      const fresh = num(r.new_flags);
      const reopened = num(r.reopened);
      toast.success(
        fresh || reopened
          ? t('admin.ops.fraud.scanDone', 'Scan complete: {fresh} new, {reopened} re-opened', { fresh, reopened })
          : t('admin.ops.fraud.scanNone', 'Scan complete: no new matches'),
      );
      qc.invalidateQueries({ queryKey: fraudKeys.all });
    },
  });
}

export function useSetFraudStatus() {
  const qc = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: FraudStatus; note?: string }) =>
      http.post<unknown>(`/v1/network-ops/fraud/flags/${id}/status`, { status, note }),
    onSuccess: (_d, { status }) => {
      toast.success(
        t('admin.ops.fraud.flagMarked', 'Flag marked {status}', {
          status: status === 'open' ? t('status.open', 'open') : status === 'resolved' ? t('status.resolved', 'resolved') : t('admin.ops.fraud.statusIgnored', 'ignored'),
        }),
      );
      qc.invalidateQueries({ queryKey: fraudKeys.all });
    },
  });
}
