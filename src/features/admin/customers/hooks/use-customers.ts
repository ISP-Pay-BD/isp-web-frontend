'use client';

import { useCallback } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { customersApi, optionsApi } from '../api/customers.api';
import type { CustomerListFilters, CustomerListParams } from '../types';

export const customerKeys = {
  all: ['admin', 'customers'] as const,
  list: (params: CustomerListParams) => ['admin', 'customers', 'list', params] as const,
  summary: (filters: CustomerListFilters) => ['admin', 'customers', 'summary', filters] as const,
  detail: (id: string, compact: boolean) => ['admin', 'customers', 'detail', id, compact] as const,
  session: (id: string) => ['admin', 'customers', 'session', id] as const,
  macStatus: (id: string) => ['admin', 'customers', 'mac', id] as const,
  audit: (id: string, page: number, perPage: number) => ['admin', 'customers', 'audit', id, page, perPage] as const,
  freeRequests: (params: Record<string, unknown>) => ['admin', 'customers', 'free-requests', params] as const,
};

/** Server-paginated, server-filtered customer list. */
export function useCustomers(params: CustomerListParams = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

/** KPI counts for the list (one grouped backend query). */
export function useCustomerSummary(filters: CustomerListFilters = {}) {
  return useQuery({
    queryKey: customerKeys.summary(filters),
    queryFn: () => customersApi.summary(filters),
    placeholderData: keepPreviousData,
  });
}

/** Full detail (live router/OLT lookups); `compact` skips them for forms and sub-pages. */
export function useCustomer(id: string, options: { compact?: boolean } = {}) {
  const compact = Boolean(options.compact);
  return useQuery({
    queryKey: customerKeys.detail(id, compact),
    queryFn: () => customersApi.detail(id, compact),
    enabled: Boolean(id),
  });
}

/** Warms the cache for a customer's detail screen, e.g. when the pointer rests on their name in the list. */
export function usePrefetchCustomer() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: string) =>
      queryClient.prefetchQuery({
        queryKey: customerKeys.detail(id, false),
        queryFn: () => customersApi.detail(id, false),
        staleTime: 30_000,
      }),
    [queryClient],
  );
}

/** Live PPPoE session — refreshed every 60s while the tab is visible, stops when the router is offline. */
export function useCustomerSession(id: string) {
  return useQuery({
    queryKey: customerKeys.session(id),
    queryFn: () => customersApi.session(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (query.state.data?.routerOnline === false ? false : 60_000),
    refetchIntervalInBackground: false,
  });
}

export function useMacStatus(id: string) {
  return useQuery({
    queryKey: customerKeys.macStatus(id),
    queryFn: () => customersApi.macStatus(id),
    enabled: Boolean(id),
  });
}

export function useCustomerAudit(id: string, page: number, perPage: number) {
  return useQuery({
    queryKey: customerKeys.audit(id, page, perPage),
    queryFn: () => customersApi.auditLogs(id, page, perPage),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useFreeRequests(params: { status?: string; search?: string; page?: number; perPage?: number }) {
  return useQuery({
    queryKey: customerKeys.freeRequests(params),
    queryFn: () => customersApi.freeRequests(params),
    placeholderData: keepPreviousData,
  });
}

/** Totals per status for the free-request pills (per_page=1 → meta.total only). */
export function useFreeRequestCounts() {
  return useQuery({
    queryKey: ['admin', 'customers', 'free-requests', 'counts'],
    queryFn: async () => {
      const [pending, approved, rejected] = await Promise.all(
        (['pending', 'approved', 'rejected'] as const).map((status) => customersApi.freeRequests({ status, perPage: 1 })),
      );
      return { pending: pending.meta.total, approved: approved.meta.total, rejected: rejected.meta.total };
    },
  });
}

// ── Option sources (cached; they change rarely) ──────────────────────────────

const OPTION_STALE = 5 * 60_000;

export function useAreaOptions() {
  return useQuery({ queryKey: ['admin', 'options', 'areas'], queryFn: optionsApi.areas, staleTime: OPTION_STALE });
}

export function useSubAreaOptions(areaId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'options', 'sub-areas', areaId],
    queryFn: () => optionsApi.subAreas(areaId as string),
    enabled: Boolean(areaId),
    staleTime: OPTION_STALE,
  });
}

export function usePackageOptions() {
  return useQuery({ queryKey: ['admin', 'options', 'packages'], queryFn: optionsApi.packages, staleTime: OPTION_STALE });
}

export function useRouterOptions() {
  return useQuery({ queryKey: ['admin', 'options', 'routers'], queryFn: optionsApi.routers, staleTime: OPTION_STALE });
}

export function usePppoeProfiles(routerId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'options', 'pppoe-profiles', routerId],
    queryFn: () => optionsApi.pppoeProfiles(routerId as string),
    enabled: Boolean(routerId),
    staleTime: OPTION_STALE,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

function messageOf(res: unknown, fallback: string): string {
  const r = res as { message?: unknown } | null;
  return typeof r?.message === 'string' && r.message ? r.message : fallback;
}

/** Customer list/summary/detail caches + the dashboard counters. */
function useInvalidateCustomers() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: customerKeys.all });
    qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    if (id) qc.invalidateQueries({ queryKey: ['admin', 'customers', 'detail', id] });
  };
}

export function useCreateCustomer() {
  const t = useTranslations();
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => customersApi.create(body),
    // The form maps field errors itself (handleApiError(err, setError)).
    meta: { silent: true },
    onSuccess: () => {
      invalidate();
      toast.success(t('admin.customers.toast.created', 'Customer created'));
    },
  });
}

export function useUpdateCustomer(id: string) {
  const t = useTranslations();
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => customersApi.update(id, body),
    meta: { silent: true },
    onSuccess: () => {
      invalidate(id);
      toast.success(t('admin.customers.toast.updated', 'Customer updated'));
    },
  });
}

export function useDeleteCustomer() {
  const t = useTranslations();
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(t('admin.customers.toast.deleted', 'Customer deleted'));
    },
  });
}

/** Bulk + single-customer actions; each toasts the backend's own result message. */
export function useCustomerActions() {
  const t = useTranslations();
  const invalidate = useInvalidateCustomers();
  const qc = useQueryClient();
  const done = (fallback: string, id?: string) => (res: unknown) => {
    invalidate(id);
    toast.success(messageOf(res, fallback));
  };

  return {
    bulkDelete: useMutation({ mutationFn: customersApi.bulkDelete, onSuccess: done(t('admin.customers.toast.bulkDeleted', 'Customers deleted')) }),
    bulkRecharge: useMutation({
      mutationFn: (v: { ids: string[]; willExpire: string; packageId?: string }) => customersApi.bulkRecharge(v.ids, v.willExpire, v.packageId),
      onSuccess: (res) => {
        invalidate();
        const payload = (res as { payload?: { success_count?: number; failed_count?: number } })?.payload;
        const n = payload?.success_count ?? 0;
        toast.success(
          payload?.failed_count
            ? t('admin.customers.toast.rechargedFailed', 'Recharged {n} customer(s), {failed} failed', { n, failed: payload.failed_count })
            : t('admin.customers.toast.recharged', 'Recharged {n} customer(s)', { n }),
        );
      },
    }),
    bulkUpdateRouter: useMutation({
      mutationFn: (v: { ids: string[]; routerId: string }) => customersApi.bulkUpdateRouter(v.ids, v.routerId),
      onSuccess: (res) => {
        invalidate();
        const r = res as { updated_count?: number; failed_count?: number };
        const n = r?.updated_count ?? 0;
        toast.success(
          r?.failed_count
            ? t('admin.customers.toast.routerChangedFailed', 'Router changed for {n} customer(s), {failed} failed', { n, failed: r.failed_count })
            : t('admin.customers.toast.routerChanged', 'Router changed for {n} customer(s)', { n }),
        );
      },
    }),
    bulkChangePackage: useMutation({
      mutationFn: (v: { ids: string[]; packageId: string }) => customersApi.bulkChangePackage(v.ids, v.packageId),
      onSuccess: done(t('admin.customers.toast.packageUpdated', 'Package updated')),
    }),
    bulkConnStatus: useMutation({
      mutationFn: (v: { ids: string[]; status: 'conn' | 'disconn' }) => customersApi.bulkConnStatus(v.ids, v.status),
      onSuccess: done(t('admin.customers.toast.accountStatusUpdated', 'Account status updated')),
    }),
    syncPppoe: useMutation({
      mutationFn: (customerId?: string) => customersApi.syncPppoe(customerId),
      onSuccess: (res, customerId) => {
        invalidate(customerId);
        const p = (res as { payload?: { updated?: number; skipped?: number; errors?: unknown[] } })?.payload;
        toast.success(
          t('admin.customers.toast.pppoeSync', 'PPPoE sync finished: {updated} updated, {skipped} unchanged, {failed} failed', {
            updated: p?.updated ?? 0,
            skipped: p?.skipped ?? 0,
            failed: p?.errors?.length ?? 0,
          }),
        );
      },
    }),
    sendSms: useMutation({
      mutationFn: (v: { ids: string[]; content: string }) => customersApi.sendSms(v.ids, v.content),
      onSuccess: (res) => toast.success(messageOf(res, t('admin.customers.toast.smsSent', 'SMS sent'))),
    }),
    kick: useMutation({
      mutationFn: customersApi.kick,
      onSuccess: (res, id) => {
        qc.invalidateQueries({ queryKey: customerKeys.session(id) });
        toast.success(messageOf(res, t('admin.customers.toast.sessionRefreshed', 'Session refreshed')));
      },
    }),
    ping: useMutation({
      mutationFn: customersApi.ping,
      onSuccess: (res) => {
        const r = res as { average_latency?: string; packets?: { sent?: number; received?: number; loss?: string } };
        toast.success(
          t('admin.customers.toast.ping', 'Ping: {avg} average, {received}/{sent} received ({loss} loss)', {
            avg: r?.average_latency ?? 'N/A',
            received: r?.packets?.received ?? 0,
            sent: r?.packets?.sent ?? 0,
            loss: r?.packets?.loss ?? '—',
          }),
        );
      },
    }),
    refreshOnu: useMutation({
      mutationFn: customersApi.refreshOnu,
      onSuccess: (res, id) => {
        qc.invalidateQueries({ queryKey: ['admin', 'customers', 'detail', id] });
        const r = res as { found?: boolean; rx?: string | null; hint?: string };
        if (r?.found) {
          toast.success(
            r.rx
              ? t('admin.customers.toast.onuFoundRx', 'ONU found: RX {rx}', { rx: r.rx })
              : t('admin.customers.toast.onuFound', 'ONU found'),
          );
        } else toast.info(r?.hint || t('admin.customers.toast.onuNotFound', 'No ONU matched on the OLTs'));
      },
    }),
    setConnStatus: useMutation({
      mutationFn: (v: { id: string; status: 'conn' | 'disconn' }) => customersApi.bulkConnStatus([v.id], v.status),
      onSuccess: (res, v) => done(t('admin.customers.toast.accountStatusUpdated', 'Account status updated'), v.id)(res),
    }),
    macBind: useMutation({
      mutationFn: customersApi.macBind,
      onSuccess: (res, id) => {
        qc.invalidateQueries({ queryKey: customerKeys.macStatus(id) });
        done(t('admin.customers.toast.macBound', 'MAC bound'), id)(res);
      },
    }),
    macUnbind: useMutation({
      mutationFn: customersApi.macUnbind,
      onSuccess: (res, id) => {
        qc.invalidateQueries({ queryKey: customerKeys.macStatus(id) });
        done(t('admin.customers.toast.macUnbound', 'MAC unbound'), id)(res);
      },
    }),
    approveFreeRequest: useMutation({ mutationFn: customersApi.approveFreeRequest, onSuccess: done(t('admin.customers.toast.requestApproved', 'Request approved')) }),
    rejectFreeRequest: useMutation({ mutationFn: customersApi.rejectFreeRequest, onSuccess: done(t('admin.customers.toast.requestRejected', 'Request rejected')) }),
  };
}

export function useImportCustomers() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (v: { file: File; onProgress?: (p: number) => void }) => customersApi.importExcel(v.file, v.onProgress),
    onSuccess: () => invalidate(),
  });
}

export function useExportCustomers() {
  return useMutation({ mutationFn: customersApi.exportExcel });
}
