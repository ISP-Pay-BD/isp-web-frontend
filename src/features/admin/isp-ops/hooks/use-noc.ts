'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * NOC incidents / maintenance windows (/v1/network-ops/noc/incidents) and the
 * live summary computed from the tenant's router status + last cached poll.
 */

export type NocKind = 'incident' | 'maintenance';
export type NocSeverity = 'minor' | 'major' | 'critical';
export const NOC_STATUSES: Record<NocKind, string[]> = {
  incident: ['investigating', 'identified', 'monitoring', 'resolved'],
  maintenance: ['scheduled', 'in_progress', 'completed', 'cancelled'],
};

export interface NocIncident {
  id: string;
  kind: NocKind;
  title: string;
  description: string | null;
  severity: NocSeverity;
  status: string;
  isOpen: boolean;
  routerIds: string[];
  routers: string[];
  areaIds: string[];
  areas: string[];
  startsAt: string | null;
  endsAt: string | null;
}

export interface NocRouterHealth {
  id: string;
  name: string;
  enabled: boolean;
  state: 'online' | 'offline' | 'unknown';
  activeSessions: number | null;
  totalSessions: number | null;
  lastPolledAt: string | null;
}

export interface NocSummary {
  routers: { total: number; enabled: number; online: number; offline: number; unknown: number; activeSessions: number; items: NocRouterHealth[] };
  incidents: { open: number; bySeverity: Record<NocSeverity, number> };
  maintenance: { inProgress: number; upcoming: number };
  generatedAt: string | null;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;
const ids = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x)) : []);

function mapIncident(raw: unknown): NocIncident {
  const r = obj(raw);
  const severity = str(r.severity);
  return {
    id: str(r.id),
    kind: str(r.kind) === 'maintenance' ? 'maintenance' : 'incident',
    title: str(r.title),
    description: opt(r.description),
    severity: severity === 'critical' || severity === 'major' ? severity : 'minor',
    status: str(r.status),
    isOpen: r.is_open === true,
    routerIds: ids(r.router_ids),
    routers: ids(r.routers),
    areaIds: ids(r.area_ids),
    areas: ids(r.areas),
    startsAt: opt(r.starts_at),
    endsAt: opt(r.ends_at),
  };
}

const nocKeys = {
  all: ['admin', 'noc'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'noc', 'list', params] as const,
  summary: ['admin', 'noc', 'summary'] as const,
};

export function useNocIncidents({ page, pageSize, search, status }: { page: number; pageSize: number; search?: string; status?: string }) {
  const params = { page, limit: pageSize, search: search || undefined, status: status || undefined };
  return useQuery({
    queryKey: nocKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/noc/incidents', params, { signal });
      return { items: res.items.map(mapIncident), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

/** Live NOC summary — a monitoring screen, refreshed every 60s while visible. */
export function useNocSummary() {
  return useQuery({
    queryKey: nocKeys.summary,
    queryFn: async ({ signal }): Promise<NocSummary> => {
      const d = obj(await http.get<unknown>('/v1/network-ops/noc/summary', undefined, signal));
      const r = obj(d.routers);
      const inc = obj(d.incidents);
      const sev = obj(inc.by_severity);
      const m = obj(d.maintenance);
      return {
        routers: {
          total: num(r.total),
          enabled: num(r.enabled),
          online: num(r.online),
          offline: num(r.offline),
          unknown: num(r.unknown),
          activeSessions: num(r.active_sessions),
          items: (Array.isArray(r.items) ? r.items : []).map((x) => {
            const i = obj(x);
            const state = str(i.state);
            return {
              id: str(i.id),
              name: str(i.name),
              enabled: i.enabled === true,
              state: state === 'online' || state === 'offline' ? state : 'unknown',
              activeSessions: i.active_sessions === null || i.active_sessions === undefined ? null : num(i.active_sessions),
              totalSessions: i.total_sessions === null || i.total_sessions === undefined ? null : num(i.total_sessions),
              lastPolledAt: opt(i.last_polled_at),
            };
          }),
        },
        incidents: { open: num(inc.open), bySeverity: { minor: num(sev.minor), major: num(sev.major), critical: num(sev.critical) } },
        maintenance: { inProgress: num(m.in_progress), upcoming: num(m.upcoming) },
        generatedAt: opt(d.generated_at),
      };
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useSaveNocIncident() {
  const qc = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      mapIncident(id ? await http.put<unknown>(`/v1/network-ops/noc/incidents/${id}`, body) : await http.post<unknown>('/v1/network-ops/noc/incidents', body)),
    onSuccess: (i, { id }) => {
      if (i.kind === 'maintenance') {
        toast.success(id ? t('admin.ops.noc.toast.maintenanceUpdated', 'Maintenance updated') : t('admin.ops.noc.toast.maintenanceCreated', 'Maintenance window created'));
      } else {
        toast.success(id ? t('admin.ops.noc.toast.incidentUpdated', 'Incident updated') : t('admin.ops.noc.toast.incidentCreated', 'Incident created'));
      }
      qc.invalidateQueries({ queryKey: nocKeys.all });
    },
  });
}

export function useDeleteNocIncident() {
  const qc = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/network-ops/noc/incidents/${id}`),
    onSuccess: () => {
      toast.success(t('admin.ops.noc.toast.deleted', 'Deleted'));
      qc.invalidateQueries({ queryKey: nocKeys.all });
    },
  });
}
