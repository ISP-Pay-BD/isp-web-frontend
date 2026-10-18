'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, type ApiError } from '@/lib/api/client';
import {
  mapDashboard,
  mapGenerateResult,
  mapProfile,
  mapProfilesData,
  mapSale,
  mapSession,
  mapSessionSummary,
  mapUser,
  mapUserSummary,
  mapVoucher,
  mapVoucherSummary,
  type HotspotExpiredMode,
} from '../types';

/** Every key is scoped by router so switching routers never shows another device's rows. */
export const hotspotKeys = {
  all: ['admin', 'hotspot'] as const,
  router: (routerId: string) => ['admin', 'hotspot', routerId] as const,
  dashboard: (routerId: string) => ['admin', 'hotspot', routerId, 'dashboard'] as const,
  sessions: (routerId: string) => ['admin', 'hotspot', routerId, 'sessions'] as const,
  users: (routerId: string) => ['admin', 'hotspot', routerId, 'users'] as const,
  profiles: (routerId: string) => ['admin', 'hotspot', routerId, 'profiles'] as const,
  report: (routerId: string) => ['admin', 'hotspot', routerId, 'report'] as const,
  vouchers: (routerId: string) => ['admin', 'hotspot', routerId, 'vouchers'] as const,
  walledGarden: (routerId: string) => ['admin', 'hotspot', routerId, 'walled-garden'] as const,
};

/**
 * Device reads: an offline router (503) or a router that did not answer (502)
 * is shown at once — retrying would only hold the request open on a dead link.
 */
export const deviceRetry = (failureCount: number, error: ApiError) =>
  error.isTransient && error.status !== 502 && error.status !== 503 && failureCount < 2;

/** Live-monitoring screens only (dashboard): ≥30s, paused in background tabs. */
const LIVE = { refetchInterval: 30_000, refetchIntervalInBackground: false } as const;

export interface PageParams {
  page: number;
  pageSize: number;
  search?: string;
}

const pageQuery = (routerId: string | null, { page, pageSize, search }: PageParams) => ({
  router_id: routerId,
  page,
  limit: pageSize,
  search: search || undefined,
});

/* ───────── reads ───────── */

export function useHotspotDashboard(routerId: string | null, options: { live?: boolean } = {}) {
  return useQuery({
    queryKey: hotspotKeys.dashboard(routerId ?? ''),
    queryFn: async () => mapDashboard(await http.get<unknown>('/v1/hotspot/dashboard', { router_id: routerId })),
    enabled: Boolean(routerId),
    retry: deviceRetry,
    ...(options.live ? LIVE : {}),
  });
}

export function useHotspotSessions(routerId: string | null, params: PageParams) {
  return useQuery({
    queryKey: [...hotspotKeys.sessions(routerId ?? ''), params],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/hotspot/sessions', pageQuery(routerId, params));
      return { items: res.items.map(mapSession), meta: res.meta, summary: mapSessionSummary(res.raw.summary) };
    },
    enabled: Boolean(routerId),
    retry: deviceRetry,
    placeholderData: keepPreviousData,
    ...LIVE,
  });
}

export function useHotspotUsers(routerId: string | null, params: PageParams & { profile?: string }) {
  return useQuery({
    queryKey: [...hotspotKeys.users(routerId ?? ''), params],
    queryFn: async () => {
      const res = await http.getPage<unknown>(
        '/v1/hotspot/users',
        { ...pageQuery(routerId, params), profile: params.profile || undefined },
        { listKey: 'users' },
      );
      const servers = Array.isArray(res.raw.servers)
        ? (res.raw.servers as Record<string, unknown>[]).map((s) => String(s.name ?? '')).filter(Boolean)
        : [];
      return {
        items: res.items.map(mapUser),
        meta: res.meta,
        summary: mapUserSummary(res.raw.summary),
        profiles: Array.isArray(res.raw.profiles) ? res.raw.profiles.map(mapProfile) : [],
        servers,
      };
    },
    enabled: Boolean(routerId),
    retry: deviceRetry,
    placeholderData: keepPreviousData,
  });
}

export function useHotspotProfiles(routerId: string | null) {
  return useQuery({
    queryKey: hotspotKeys.profiles(routerId ?? ''),
    queryFn: async () => mapProfilesData(await http.get<unknown>('/v1/hotspot/profiles', { router_id: routerId })),
    enabled: Boolean(routerId),
    retry: deviceRetry,
  });
}

export interface ReportParams extends PageParams {
  from?: string;
  to?: string;
}

export function useHotspotReport(routerId: string | null, params: ReportParams) {
  return useQuery({
    queryKey: [...hotspotKeys.report(routerId ?? ''), params],
    queryFn: async () => {
      const res = await http.getPage<unknown>(
        '/v1/hotspot/report',
        { router_id: routerId, page: params.page, limit: params.pageSize, from: params.from || undefined, to: params.to || undefined },
        { listKey: 'rows' },
      );
      return {
        items: res.items.map(mapSale),
        meta: res.meta,
        totalSales: Number(res.raw.total ?? 0),
        count: Number(res.raw.count ?? 0),
      };
    },
    enabled: Boolean(routerId),
    retry: deviceRetry,
    placeholderData: keepPreviousData,
  });
}

/** Whole filtered report (no page) for the CSV export. */
export async function fetchHotspotReportRows(routerId: string, range: { from?: string; to?: string }) {
  const data = await http.get<{ rows?: unknown[] }>('/v1/hotspot/report', {
    router_id: routerId,
    from: range.from || undefined,
    to: range.to || undefined,
  });
  return (data.rows ?? []).map(mapSale);
}

export function useHotspotVouchers(routerId: string | null, params: PageParams & { status?: string }) {
  return useQuery({
    queryKey: [...hotspotKeys.vouchers(routerId ?? ''), params],
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/hotspot/vouchers', {
        ...pageQuery(routerId, params),
        status: params.status || undefined,
      });
      return { items: res.items.map(mapVoucher), meta: res.meta, summary: mapVoucherSummary(res.raw.summary) };
    },
    enabled: Boolean(routerId),
    retry: deviceRetry,
    placeholderData: keepPreviousData,
  });
}

/* ───────── writes ───────── */

export interface CreateHotspotUserInput {
  name: string;
  password: string;
  profile: string;
  server?: string;
  macAddress?: string;
  timeLimit?: string;
  dataLimitMb?: string;
  comment?: string;
}

export function useCreateHotspotUser(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHotspotUserInput) =>
      http.post('/v1/hotspot/users', {
        name: input.name,
        password: input.password,
        profile: input.profile,
        server: input.server || undefined,
        mac_address: input.macAddress || undefined,
        timelimit: input.timeLimit || undefined,
        datalimit: input.dataLimitMb || undefined,
        comment: input.comment || undefined,
      }, { router_id: routerId }),
    onSuccess: () => invalidateUsers(qc, routerId),
  });
}

/** Row actions on one hotspot user: extend its time limit, clear its MAC, enable/disable. */
export type HotspotUserAction =
  | { id: string; extendUptime: string }
  | { id: string; resetMac: true }
  | { id: string; disabled: boolean };

export function useUpdateHotspotUser(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: HotspotUserAction) =>
      http.put<{ id: string; limit_uptime?: string }>(
        '/v1/hotspot/users',
        {
          id: action.id,
          ...('extendUptime' in action ? { extend_uptime: action.extendUptime } : {}),
          ...('resetMac' in action ? { reset_mac: true } : {}),
          ...('disabled' in action ? { disabled: action.disabled } : {}),
        },
        { router_id: routerId },
      ),
    onSuccess: () => invalidateUsers(qc, routerId),
  });
}

export function useDeleteHotspotUser(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete('/v1/hotspot/users', { router_id: routerId }, { id }),
    onSuccess: () => invalidateUsers(qc, routerId),
  });
}

/** Users, vouchers and the dashboard counters all read the same /ip/hotspot/user table. */
function invalidateUsers(qc: ReturnType<typeof useQueryClient>, routerId: string | null) {
  if (!routerId) return;
  void qc.invalidateQueries({ queryKey: hotspotKeys.users(routerId) });
  void qc.invalidateQueries({ queryKey: hotspotKeys.vouchers(routerId) });
  void qc.invalidateQueries({ queryKey: hotspotKeys.dashboard(routerId) });
}

export interface HotspotProfileInput {
  id?: string;
  name: string;
  rateLimit: string;
  validity: string;
  priceBdt: string;
  sellingPriceBdt: string;
  sharedUsers: string;
  addressPool: string;
  parentQueue: string;
  expiredMode: HotspotExpiredMode;
  lockUser: boolean;
}

export function useSaveHotspotProfile(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HotspotProfileInput) => {
      const body = {
        ...(input.id ? { id: input.id } : {}),
        name: input.name,
        rate_limit: input.rateLimit || undefined,
        validity: input.validity || undefined,
        price_bdt: input.priceBdt || '0',
        selling_price_bdt: input.sellingPriceBdt || '0',
        shared_users: input.sharedUsers || '1',
        address_pool: input.addressPool || 'none',
        parent_queue: input.parentQueue || 'none',
        expired_mode: input.expiredMode,
        lock_user: input.lockUser ? 'Enable' : 'Disable',
      };
      return input.id
        ? http.put('/v1/hotspot/profiles', body, { router_id: routerId })
        : http.post('/v1/hotspot/profiles', body, { router_id: routerId });
    },
    onSuccess: () => invalidateProfiles(qc, routerId),
  });
}

export function useDeleteHotspotProfile(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete('/v1/hotspot/profiles', { router_id: routerId }, { id }),
    onSuccess: () => invalidateProfiles(qc, routerId),
  });
}

/** The users payload embeds the profile list (create-user picker). */
function invalidateProfiles(qc: ReturnType<typeof useQueryClient>, routerId: string | null) {
  if (!routerId) return;
  void qc.invalidateQueries({ queryKey: hotspotKeys.profiles(routerId) });
  void qc.invalidateQueries({ queryKey: hotspotKeys.users(routerId) });
}

export function useDisconnectHotspotSession(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete('/v1/hotspot/sessions', { router_id: routerId, id }),
    onSuccess: () => {
      if (!routerId) return;
      void qc.invalidateQueries({ queryKey: hotspotKeys.sessions(routerId) });
      void qc.invalidateQueries({ queryKey: hotspotKeys.dashboard(routerId) });
    },
  });
}

export interface GenerateVouchersInput {
  profile: string;
  qty: number;
  codeLength: number;
  prefix?: string;
  timeLimit?: string;
  dataLimitMb?: string;
  batch?: string;
}

export function useGenerateVouchers(routerId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GenerateVouchersInput) =>
      mapGenerateResult(
        await http.post<unknown>('/v1/hotspot/vouchers/generate', {
          router_id: routerId,
          profile: input.profile,
          qty: input.qty,
          // Voucher codes: login = password = code, so the code alone is the PIN card.
          user_mode: 'username_only',
          name_length: input.codeLength,
          prefix_type: 'alphanumeric',
          prefix_value: input.prefix || undefined,
          time_limit: input.timeLimit || undefined,
          data_limit: input.dataLimitMb || undefined,
          comment: input.batch || undefined,
        }),
      ),
    onSuccess: () => invalidateUsers(qc, routerId),
  });
}
