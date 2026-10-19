'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * Bandwidth SLA definitions per package or customer (/v1/network-ops/slas).
 * The platform records no per-link uptime/throughput history, so there are
 * no measured values — definitions only (`measurementAvailable` is false).
 */

export type SlaScope = 'package' | 'customer';

export interface BandwidthSla {
  id: string;
  name: string;
  scope: SlaScope;
  packageId: string | null;
  packageName: string | null;
  packageBandwidth: string | null;
  userId: string | null;
  customerName: string | null;
  committedMbps: number;
  uptimeTargetPct: number;
  status: 'active' | 'inactive';
  notes: string | null;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;

function mapSla(raw: unknown): BandwidthSla {
  const r = obj(raw);
  return {
    id: str(r.id),
    name: str(r.name),
    scope: str(r.scope) === 'customer' ? 'customer' : 'package',
    packageId: opt(r.package_id),
    packageName: opt(r.package_name),
    packageBandwidth: opt(r.package_bandwidth),
    userId: opt(r.user_id),
    customerName: opt(r.customer_name),
    committedMbps: num(r.committed_mbps),
    uptimeTargetPct: num(r.uptime_target_pct),
    status: str(r.status) === 'inactive' ? 'inactive' : 'active',
    notes: opt(r.notes),
  };
}

const slaKeys = {
  all: ['admin', 'slas'] as const,
  list: (params: Record<string, unknown>) => ['admin', 'slas', 'list', params] as const,
};

export function useSlas({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, limit: pageSize, search: search || undefined };
  return useQuery({
    queryKey: slaKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/slas', params, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapSla),
        meta: res.meta,
        summary: {
          total: num(s.total),
          active: num(s.active),
          committedMbpsActive: num(s.committed_mbps_active),
          measurementAvailable: s.measurement_available === true,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useSaveSla() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      mapSla(id ? await http.put<unknown>(`/v1/network-ops/slas/${id}`, body) : await http.post<unknown>('/v1/network-ops/slas', body)),
    onSuccess: (_s, { id }) => {
      toast.success(id ? t('admin.ops.bandwidthSla.toast.updated', 'SLA updated') : t('admin.ops.bandwidthSla.toast.created', 'SLA created'));
      qc.invalidateQueries({ queryKey: slaKeys.all });
    },
  });
}

export function useDeleteSla() {
  const t = useTranslations();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/network-ops/slas/${id}`),
    onSuccess: () => {
      toast.success(t('admin.ops.bandwidthSla.toast.deleted', 'SLA deleted'));
      qc.invalidateQueries({ queryKey: slaKeys.all });
    },
  });
}
