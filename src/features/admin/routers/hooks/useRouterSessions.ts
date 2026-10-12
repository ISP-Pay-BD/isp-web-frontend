import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { routerKeys } from './useRouters';

export type SessionMode = 'all' | 'active' | 'inactive';

/** One PPPoE row of GET /v1/routers/{id}/sessions (secret merged with its live session). */
export interface PppoeRow {
  name: string;
  profile: string;
  service: string;
  active: boolean;
  sessionId: string;
  address: string;
  callerId: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  lastLoggedOut: string;
  lastDisconnectReason: string;
}

export interface SessionsPage {
  /** false = the router did not answer (the API still replies 200). */
  reachable: boolean;
  error: string;
  rows: PppoeRow[];
  total: number;
  activeCount: number;
  inactiveCount: number;
}

function mapRow(raw: unknown): PppoeRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    name: str(r.name),
    profile: str(r.profile),
    service: str(r.service),
    active: r.active === true,
    sessionId: str(r.session_id),
    address: str(r.address),
    callerId: str(r.caller_id ?? r.last_caller_id),
    uptime: str(r.uptime),
    bytesIn: num(r.bytes_in),
    bytesOut: num(r.bytes_out),
    lastLoggedOut: str(r.last_logged_out),
    lastDisconnectReason: str(r.last_disconnect_reason),
  };
}

export interface SessionParams {
  page: number;
  pageSize: number;
  search: string;
  mode: SessionMode;
}

export const sessionKeys = {
  list: (routerId: string, p: SessionParams) => [...routerKeys.detail(routerId), 'sessions', p] as const,
  logs: (p: Record<string, unknown>) => ['admin', 'routers', 'disconnect-logs', p] as const,
};

/** Live PPPoE users of one router, paginated + searched server-side. */
export function useRouterSessions(routerId: string, p: SessionParams) {
  return useQuery({
    queryKey: sessionKeys.list(routerId, p),
    queryFn: async (): Promise<SessionsPage> => {
      const res = await http.getPage<unknown>(
        `/v1/routers/${routerId}/sessions`,
        { router_id: routerId, mode: p.mode, page: p.page, limit: p.pageSize, search: p.search || undefined },
        { listKey: 'rows' },
      );
      const raw = res.raw;
      return {
        reachable: raw.reachable !== false,
        error: str(raw.error),
        rows: res.items.map(mapRow),
        total: res.meta.total,
        activeCount: num(raw.active_count),
        inactiveCount: num(raw.inactive_count),
      };
    },
    enabled: Boolean(routerId),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

/** POST /v1/routers/{id}/disconnect — by live session id or by PPPoE username. Logged server-side. */
export function useDisconnectSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routerId, sessionId, username }: { routerId: string; sessionId?: string; username?: string }) =>
      http.post<{ session_id: string }>(
        `/v1/routers/${routerId}/disconnect`,
        { session_id: sessionId || undefined, username: username || undefined },
        { router_id: routerId },
      ),
    onSuccess: (_res, { routerId }) => {
      qc.invalidateQueries({ queryKey: [...routerKeys.detail(routerId), 'sessions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'routers', 'disconnect-logs'] });
    },
    onError: (err, { routerId }) => {
      toast.error(err.message);
      // failed attempts are logged too
      qc.invalidateQueries({ queryKey: ['admin', 'routers', 'disconnect-logs'] });
      qc.invalidateQueries({ queryKey: [...routerKeys.detail(routerId), 'sessions'] });
    },
  });
}

export interface DisconnectLog {
  id: string;
  routerId: string;
  routerName: string;
  username: string;
  sessionId: string;
  result: 'ok' | 'failed';
  message: string;
  createdAt: string;
}

/** GET /v1/routers/disconnect-logs — the tenant's forced-disconnect audit trail. */
export function useDisconnectLogs(p: { page: number; pageSize: number; search: string }) {
  const params = { page: p.page, limit: p.pageSize, search: p.search || undefined };
  return useQuery({
    queryKey: sessionKeys.logs(params),
    queryFn: async () => {
      const res = await http.getPage<unknown>('/v1/routers/disconnect-logs', params);
      const summary = (res.raw.summary ?? {}) as Record<string, unknown>;
      return {
        items: res.items.map((raw): DisconnectLog => {
          const r = (raw ?? {}) as Record<string, unknown>;
          return {
            id: str(r.id),
            routerId: str(r.router_id),
            routerName: str(r.router_name),
            username: str(r.username),
            sessionId: str(r.session_id),
            result: str(r.result) === 'ok' ? 'ok' : 'failed',
            message: str(r.message),
            createdAt: str(r.created_at),
          };
        }),
        meta: res.meta,
        summary: { total: num(summary.total), ok: num(summary.ok), failed: num(summary.failed) },
      };
    },
    placeholderData: keepPreviousData,
  });
}
