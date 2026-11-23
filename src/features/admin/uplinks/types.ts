import { num, str } from '@/lib/api/case';

export type UplinkType = 'interface' | 'bgp' | 'ping' | 'netwatch';
export type AlertChannels = 'both' | 'whatsapp' | 'sms';
export type UplinkStatus = 'up' | 'down' | 'unknown';

export const UPLINK_TYPES: UplinkType[] = ['interface', 'bgp', 'ping', 'netwatch'];
export const ALERT_CHANNELS: AlertChannels[] = ['both', 'whatsapp', 'sms'];

/** One row of `router_uplinks` joined with its router (PHP `RouterUplink::getForAdmin`). */
export interface UplinkRow {
  id: string;
  routerId: string;
  routerName: string;
  routerHost: string;
  name: string;
  uplinkType: UplinkType;
  target: string;
  status: UplinkStatus;
  alertChannels: AlertChannels;
  notifyMobile: string;
  notifyWhatsapp: string;
  failThreshold: number;
  failCount: number;
  isEnabled: boolean;
  lastCheckedAt: string;
  lastStatusChangeAt: string;
  lastNotifiedAt: string;
  lastResponse: string;
}

export interface UplinkStats {
  total: number;
  up: number;
  down: number;
  routers: number;
}

export interface UplinkRouterOption {
  id: string;
  name: string;
  host: string;
}

export interface UplinkList {
  items: UplinkRow[];
  stats: UplinkStats;
  /** Tenant routers the API accepts for `router_id` (index `routers`). */
  routers: UplinkRouterOption[];
  /** Default alert recipient (index `adminUser`) — shown as the placeholder for the override fields. */
  adminMobile: string;
  adminWhatsapp: string;
}

export interface UplinkLogRow {
  id: string;
  eventType: string;
  status: string;
  channels: string;
  recipient: string;
  message: string;
  responseDetails: string;
  createdAt: string;
}

export interface UplinkCandidates {
  ok: boolean;
  error: string;
  interfaces: {
    name: string;
    type: string;
    comment: string;
    running: boolean;
    disabled: boolean;
  }[];
  bgp: { name: string; remote: string; as: string; state: string; established: boolean }[];
  netwatch: { host: string; comment: string; status: string }[];
}

export interface UplinkCheckResult {
  status: string;
  response: string;
  reason: string;
  alertSent: boolean;
}

export interface UplinkCheckAllSummary {
  total: number;
  up: number;
  down: number;
  alertsSent: number;
  message: string;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const flag = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  (list as readonly string[]).includes(str(v)) ? (str(v) as T) : fallback;

export function mapUplink(raw: unknown): UplinkRow {
  const r = obj(raw);
  const router = obj(r.router);
  return {
    id: str(r.id),
    routerId: str(r.router_id ?? router.id),
    routerName: str(r.router_name ?? router.name),
    routerHost: str(r.router_host ?? router.host),
    name: str(r.name),
    uplinkType: oneOf(r.uplink_type, UPLINK_TYPES, 'interface'),
    target: str(r.target),
    status: oneOf(r.status, ['up', 'down', 'unknown'] as const, 'unknown'),
    alertChannels: oneOf(r.alert_channels, ALERT_CHANNELS, 'both'),
    notifyMobile: str(r.notify_mobile),
    notifyWhatsapp: str(r.notify_whatsapp),
    failThreshold: num(r.fail_threshold, 1),
    failCount: num(r.fail_count),
    isEnabled: flag(r.is_enabled),
    lastCheckedAt: str(r.last_checked_at),
    lastStatusChangeAt: str(r.last_status_change_at),
    lastNotifiedAt: str(r.last_notified_at),
    lastResponse: str(r.last_response_time),
  };
}

/** Accepts `data: [...]` or `data: { uplinks | items: [...], stats }`; stats are derived when absent. */
export function mapUplinkList(raw: unknown): UplinkList {
  const d = obj(raw);
  const list = Array.isArray(raw) ? raw : arr(d.uplinks ?? d.items ?? d.data);
  const items = list.map(mapUplink);
  const s = obj(d.stats);
  const derived: UplinkStats = {
    total: items.length,
    up: items.filter((u) => u.status === 'up').length,
    down: items.filter((u) => u.status === 'down').length,
    routers: new Set(items.map((u) => u.routerId)).size,
  };
  const admin = obj(d.adminUser ?? d.admin_user);
  return {
    items,
    routers: arr(d.routers).map((r) => {
      const x = obj(r);
      return { id: str(x.id), name: str(x.name), host: str(x.host) };
    }),
    adminMobile: str(admin.mobile),
    adminWhatsapp: str(admin.whatsapp_number) || str(admin.mobile),
    stats: d.stats
      ? {
          total: num(s.total, derived.total),
          up: num(s.up, derived.up),
          down: num(s.down, derived.down),
          routers: num(s.routers, derived.routers),
        }
      : derived,
  };
}

export function mapLogs(raw: unknown): UplinkLogRow[] {
  const list = Array.isArray(raw) ? raw : arr(obj(raw).logs ?? obj(raw).items);
  return list.map((l) => {
    const x = obj(l);
    const details = x.response_details;
    return {
      id: str(x.id),
      eventType: str(x.event_type),
      status: str(x.status),
      channels: str(x.channels),
      recipient: str(x.recipient),
      message: str(x.message),
      responseDetails:
        details && typeof details === 'object' ? JSON.stringify(details) : str(details),
      createdAt: str(x.created_at),
    };
  });
}

export function mapCandidates(raw: unknown): UplinkCandidates {
  const r = obj(raw);
  return {
    ok: r.ok === undefined ? true : flag(r.ok),
    error: str(r.error),
    interfaces: arr(r.interfaces).map((i) => {
      const x = obj(i);
      return {
        name: str(x.name),
        type: str(x.type),
        comment: str(x.comment),
        running: flag(x.running),
        disabled: flag(x.disabled),
      };
    }),
    bgp: arr(r.bgp).map((b) => {
      const x = obj(b);
      return {
        name: str(x.name),
        remote: str(x.remote),
        as: str(x.as),
        state: str(x.state),
        established: flag(x.established),
      };
    }),
    netwatch: arr(r.netwatch).map((n) => {
      const x = obj(n);
      return { host: str(x.host), comment: str(x.comment), status: str(x.status) };
    }),
  };
}

/** `check/{id}` answers `200 {ok:false, error}` when the router row is gone — surface it as a failure. */
export function mapCheck(raw: unknown): UplinkCheckResult {
  const r = obj(raw);
  if (r.ok === false) throw new Error(str(r.error) || 'Check failed');
  return {
    status: str(r.status),
    response: str(r.response),
    reason: str(r.reason),
    alertSent: flag(r.alert_sent),
  };
}

export function mapCheckAll(raw: unknown): UplinkCheckAllSummary {
  const r = obj(raw);
  const s = obj(r.summary ?? r);
  return {
    total: num(s.total),
    up: num(s.up),
    down: num(s.down),
    alertsSent: num(s.alerts_sent),
    message: str(r.message),
  };
}
