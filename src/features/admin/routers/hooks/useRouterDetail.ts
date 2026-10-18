import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { mapRouter } from '../types';
import { routerKeys } from './useRouters';

export interface RouterInterface {
  name: string;
  type: string;
  comment: string;
  running: boolean;
  disabled: boolean;
}

export interface RouterLogLine {
  time: string;
  topics: string;
  message: string;
}

/** GET /v1/routers/{id}/live-details — read from the device on every call. */
export interface RouterLive {
  identity: string;
  model: string;
  version: string;
  uptime: string;
  cpuLoad: number | null;
  memoryUsedPct: number | null;
  hddUsedPct: number | null;
  cpu: string;
  cpuCount: string;
  architecture: string;
  serialNumber: string;
  firmware: string;
  configuredUsers: number;
  onlineUsers: number;
  checkedAt: string;
  interfaces: RouterInterface[];
  logs: RouterLogLine[];
}

function usedPct(free: unknown, total: unknown): number | null {
  const t = num(total);
  if (t <= 0) return null;
  return Math.round(((t - num(free)) / t) * 100);
}

const flag = (v: unknown) => v === true || v === 'true';

function mapLive(raw: unknown): RouterLive {
  const r = (raw ?? {}) as Record<string, unknown>;
  const cpu = str(r.cpu_load);
  return {
    identity: str(r.identity),
    model: str(r.model),
    version: str(r.version),
    uptime: str(r.uptime),
    cpuLoad: cpu === '' ? null : num(cpu),
    memoryUsedPct: usedPct(r.free_memory, r.total_memory),
    hddUsedPct: usedPct(r.free_hdd, r.total_hdd),
    cpu: str(r.cpu),
    cpuCount: str(r.cpu_count),
    architecture: str(r.architecture),
    serialNumber: str(r.serial_number),
    firmware: str(r.firmware),
    configuredUsers: num(r.configured_users),
    onlineUsers: num(r.online_users),
    checkedAt: str(r.checked_at),
    interfaces: (Array.isArray(r.interfaces) ? r.interfaces : []).map((i) => {
      const x = (i ?? {}) as Record<string, unknown>;
      return { name: str(x.name), type: str(x.type), comment: str(x.comment), running: flag(x.running), disabled: flag(x.disabled) };
    }),
    logs: (Array.isArray(r.logs) ? r.logs : [])
      .map((l) => {
        const x = (l ?? {}) as Record<string, unknown>;
        return { time: str(x.time), topics: str(x.topics), message: str(x.message) };
      })
      .reverse(),
  };
}

/** GET /v1/routers/{id}/detail — DB row; works while the device is offline. */
export function useRouterDetail(id: string) {
  return useQuery({
    queryKey: routerKeys.detail(id),
    queryFn: async () => mapRouter(await http.get<unknown>(`/v1/routers/${id}/detail`)),
    enabled: Boolean(id),
  });
}

/** Live device snapshot. A 502/503 means the router is offline — no retries. */
export function useRouterLive(id: string) {
  return useQuery({
    queryKey: [...routerKeys.detail(id), 'live'],
    queryFn: async () => mapLive(await http.get<unknown>(`/v1/routers/${id}/live-details`)),
    enabled: Boolean(id),
    retry: false,
    staleTime: 30_000,
  });
}
