import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/** One MikroTik simple queue from GET /v1/routers/{id}/corporate-queues. */
export interface CorporateQueue {
  queueId: string;
  name: string;
  target: string;
  ipAddress: string;
  maxLimit: string;
  comment: string;
  disabled: boolean;
  /** Linked to a billing customer (by queue comment or reserved IP). */
  linked: boolean;
  userId: string;
  customerName: string;
}

export type QueueFilter = 'all' | 'linked' | 'unlinked' | 'disabled';

export interface QueueSummary {
  total: number;
  linked: number;
  unlinked: number;
  disabled: number;
}

function mapQueue(raw: unknown): CorporateQueue {
  const q = (raw ?? {}) as Record<string, unknown>;
  return {
    queueId: str(q.queue_id),
    name: str(q.name),
    target: str(q.target),
    ipAddress: str(q.ip_address),
    maxLimit: str(q.max_limit),
    comment: str(q.comment),
    disabled: q.disabled === true,
    linked: q.synced === true,
    userId: str(q.user_id),
    customerName: str(q.customer_name),
  };
}

const corporateKeys = {
  all: ['admin', 'corporate-queues'] as const,
  list: (routerId: string, p: Record<string, unknown>) => ['admin', 'corporate-queues', routerId, p] as const,
};

/** Live corporate queues of ONE router (a dead router answers 503 → offline state, no retries). */
export function useCorporateQueues(
  routerId: string,
  p: { page: number; pageSize: number; search: string; status: QueueFilter },
) {
  const params = {
    page: p.page,
    limit: p.pageSize,
    search: p.search || undefined,
    status: p.status === 'all' ? undefined : p.status,
  };
  return useQuery({
    queryKey: corporateKeys.list(routerId, params),
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/routers/${routerId}/corporate-queues`, params, { listKey: 'queues' });
      const s = (res.raw.summary ?? {}) as Record<string, unknown>;
      const summary: QueueSummary = { total: num(s.total), linked: num(s.linked), unlinked: num(s.unlinked), disabled: num(s.disabled) };
      return { items: res.items.map(mapQueue), meta: res.meta, summary };
    },
    enabled: Boolean(routerId),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export interface ImportCorporateInput {
  routerId: string;
  queues: { queueId: string; customerName?: string }[];
  packageId: string;
  areaId: string;
}

/** POST /v1/routers/{id}/import-corporate — creates static/corporate customers for unlinked queues. */
export function useImportCorporate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routerId, queues, packageId, areaId }: ImportCorporateInput) =>
      http.post<{ imported: number; failed: { queue_id: string; reason: string }[] }>(
        `/v1/routers/${routerId}/import-corporate`,
        {
          queues: queues.map((q) => ({ queue_id: q.queueId, customer_name: q.customerName || undefined })),
          package_id: Number(packageId),
          area_id: Number(areaId),
        },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: corporateKeys.all }),
  });
}

export interface Option {
  id: string;
  name: string;
}

/** Tenant packages for the import dialog (GET /v1/packages). */
export function usePackageOptions(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'corporate-queues', 'package-options'],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/packages', { limit: 100, status: 'active' });
      return res.items.map((raw): Option => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return { id: str(r.id), name: str(r.package_name ?? r.name) };
      });
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Tenant areas for the import dialog (GET /v1/areas). */
export function useAreaOptions(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'corporate-queues', 'area-options'],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/areas', { limit: 100 });
      return res.items.map((raw): Option => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return { id: str(r.id), name: str(r.area_name ?? r.name) };
      });
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}
