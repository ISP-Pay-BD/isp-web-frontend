'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http, saveBlob } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { useTranslations } from '@/i18n/locale-context';

/**
 * Customer IP assignment history (/v1/network-ops/ip-logs). Each row: which
 * username held which IP from first_seen to last_seen, captured from live
 * PPPoE sessions and static assignments.
 */

export interface IpLogEntry {
  id: string;
  username: string;
  customerName: string | null;
  ipAddress: string;
  macAddress: string | null;
  routerName: string | null;
  source: 'pppoe_session' | 'static';
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface IpLogFilters {
  search?: string;
  ip?: string;
  from?: string;
  to?: string;
  source?: string;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;

function mapEntry(raw: unknown): IpLogEntry {
  const r = obj(raw);
  return {
    id: str(r.id),
    username: str(r.username),
    customerName: opt(r.customer_name),
    ipAddress: str(r.ip_address),
    macAddress: opt(r.mac_address),
    routerName: opt(r.router_name),
    source: str(r.source) === 'static' ? 'static' : 'pppoe_session',
    firstSeenAt: opt(r.first_seen_at),
    lastSeenAt: opt(r.last_seen_at),
  };
}

const filterParams = (f: IpLogFilters) => ({
  search: f.search || undefined,
  ip: f.ip || undefined,
  from: f.from || undefined,
  to: f.to || undefined,
  source: f.source || undefined,
});

const ipLogKeys = {
  all: ['admin', 'ip-logs'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'ip-logs', 'list', params] as const,
};

export function useIpLogs({ page, pageSize, ...filters }: IpLogFilters & { page: number; pageSize: number }) {
  const params = { page, limit: pageSize, ...filterParams(filters) };
  return useQuery({
    queryKey: ipLogKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/ip-logs', params, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapEntry),
        meta: res.meta,
        summary: { entries: num(s.entries), distinctIps: num(s.distinct_ips), users: num(s.users), lastCapture: opt(s.last_capture) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** Read live sessions + static IPs from the routers into the log. */
export function useCaptureIpLogs() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => obj(await http.post<unknown>('/v1/network-ops/ip-logs/capture')),
    onSuccess: (r) => {
      const unreachable = Array.isArray(r.unreachable) ? r.unreachable.length : 0;
      toast.success(
        t('admin.ops.ipLogs.captured', 'Captured {sessions} sessions and {statics} static IPs from {reached}/{routers} routers ({fresh} new entries)', {
          sessions: num(r.sessions),
          statics: num(r.static),
          reached: num(r.reached),
          routers: num(r.routers),
          fresh: num(r.new_entries),
        }) + (unreachable ? t('admin.ops.ipLogs.unreachable', ' — {n} unreachable', { n: unreachable }) : ''),
      );
      qc.invalidateQueries({ queryKey: ipLogKeys.all });
    },
  });
}

/** Server-side CSV of the filtered log. */
export function useExportIpLogs() {
  return useMutation({
    mutationFn: async (filters: IpLogFilters) => {
      const { blob, filename } = await http.download('/v1/network-ops/ip-logs/export', filterParams(filters));
      saveBlob(blob, filename ?? 'ip-assignment-log.csv');
    },
  });
}
