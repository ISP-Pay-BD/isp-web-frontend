import { num, str } from '@/lib/api/case';

/**
 * Hotspot payloads (zapi Reseller/Hotspot). Every list here is read live
 * from the selected MikroTik router (`?router_id=`); RouterOS keys are
 * kebab-case in the users/profiles payloads and snake_case elsewhere.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const list = (v: unknown): Raw[] => (Array.isArray(v) ? v.map(obj) : []);
/** RouterOS API booleans arrive as "true"/"false" (CLI style: yes/no). */
const flag = (v: unknown): boolean => v === true || ['true', 'yes'].includes(str(v).toLowerCase());

/* ───────── dashboard ───────── */

export interface HotspotLogEntry {
  time: string;
  topic: string;
  message: string;
}

export interface HotspotDashboard {
  routerTime: string;
  uptime: string;
  boardName: string;
  os: string;
  cpuLoad: number;
  ram: string;
  hdd: string;
  activeSessions: number;
  totalUsers: number;
  incomeToday: number;
  incomeMonth: number;
  logs: HotspotLogEntry[];
}

export function mapDashboard(raw: unknown): HotspotDashboard {
  const d = obj(raw);
  const system = obj(d.system);
  const board = obj(d.board);
  const resource = obj(d.resource);
  const hotspot = obj(d.hotspot);
  const income = obj(d.income);
  return {
    routerTime: str(system.time),
    uptime: str(system.uptime),
    boardName: str(board.name),
    os: str(board.os),
    cpuLoad: num(resource.cpu),
    ram: str(resource.ram),
    hdd: str(resource.hdd),
    activeSessions: num(hotspot.active),
    totalUsers: num(hotspot.users),
    incomeToday: num(income.today),
    incomeMonth: num(income.month),
    logs: list(obj(d.logs).items).map((l) => ({ time: str(l.time).trim(), topic: str(l.topic), message: str(l.message) })),
  };
}

/* ───────── live sessions (/ip/hotspot/active) ───────── */

export interface HotspotSession {
  id: string;
  user: string;
  address: string;
  macAddress: string;
  server: string;
  loginBy: string;
  uptime: string;
  idleTime: string;
  sessionTimeLeft: string;
  bytesIn: number;
  bytesOut: number;
}

export interface HotspotSessionSummary {
  total: number;
  bytesIn: number;
  bytesOut: number;
}

export function mapSession(raw: unknown): HotspotSession {
  const s = obj(raw);
  return {
    id: str(s.id),
    user: str(s.user),
    address: str(s.address),
    macAddress: str(s.mac_address),
    server: str(s.server),
    loginBy: str(s.login_by),
    uptime: str(s.uptime),
    idleTime: str(s.idle_time),
    sessionTimeLeft: str(s.session_time_left),
    bytesIn: num(s.bytes_in),
    bytesOut: num(s.bytes_out),
  };
}

export function mapSessionSummary(raw: unknown): HotspotSessionSummary {
  const s = obj(raw);
  return { total: num(s.total), bytesIn: num(s.bytes_in), bytesOut: num(s.bytes_out) };
}

/* ───────── users (/ip/hotspot/user) ───────── */

export interface HotspotUser {
  id: string;
  name: string;
  server: string;
  profile: string;
  macAddress: string;
  disabled: boolean;
  limitUptime: string;
  limitBytesTotal: number;
  bytesIn: number;
  bytesOut: number;
  uptime: string;
  comment: string;
  address: string;
}

export interface HotspotUserSummary {
  enabled: number;
  disabled: number;
  bytesIn: number;
  bytesOut: number;
}

/** RouterOS "no MAC bound" value. */
const EMPTY_MAC = '00:00:00:00:00:00';

export function mapUser(raw: unknown): HotspotUser {
  const u = obj(raw);
  const mac = str(u['mac-address']);
  const limit = str(u['limit-uptime']);
  return {
    id: str(u.id ?? u['.id']),
    name: str(u.name),
    server: str(u.server),
    profile: str(u.profile),
    macAddress: mac === EMPTY_MAC ? '' : mac,
    disabled: flag(u.disabled),
    limitUptime: limit === '0' || limit === '0s' ? '' : limit,
    limitBytesTotal: num(u['limit-bytes-total']),
    bytesIn: num(u['bytes-in']),
    bytesOut: num(u['bytes-out']),
    uptime: str(u.uptime),
    comment: str(u.comment),
    address: str(u.address),
  };
}

export function mapUserSummary(raw: unknown): HotspotUserSummary {
  const s = obj(raw);
  return { enabled: num(s.enabled), disabled: num(s.disabled), bytesIn: num(s.bytes_in), bytesOut: num(s.bytes_out) };
}

/* ───────── user profiles = hotspot packages (mikhmon on-login metadata) ───────── */

export type HotspotExpiredMode = '0' | 'rem' | 'ntf' | 'remc' | 'ntfc';

export const EXPIRED_MODES: { value: HotspotExpiredMode; label: string }[] = [
  { value: '0', label: 'None (no expiry)' },
  { value: 'rem', label: 'Remove user' },
  { value: 'ntf', label: 'Notice' },
  { value: 'remc', label: 'Remove & record sale' },
  { value: 'ntfc', label: 'Notice & record sale' },
];

export interface HotspotProfile {
  id: string;
  name: string;
  sharedUsers: number;
  rateLimit: string;
  addressPool: string;
  parentQueue: string;
  isDefault: boolean;
  expiredMode: HotspotExpiredMode;
  priceBdt: number;
  sellingPriceBdt: number;
  validity: string;
  lockUser: boolean;
}

export interface HotspotProfilesData {
  profiles: HotspotProfile[];
  pools: string[];
  queues: string[];
}

export function mapProfile(raw: unknown): HotspotProfile {
  const p = obj(raw);
  const mode = str(p.expired_mode, '0');
  return {
    id: str(p.id ?? p['.id']),
    name: str(p.name),
    sharedUsers: num(p['shared-users'], 1),
    rateLimit: str(p['rate-limit']),
    addressPool: str(p['address-pool'], 'none'),
    parentQueue: str(p['parent-queue'], 'none'),
    isDefault: flag(p.default),
    expiredMode: (EXPIRED_MODES.some((m) => m.value === mode) ? mode : '0') as HotspotExpiredMode,
    priceBdt: num(p.price_bdt),
    sellingPriceBdt: num(p.selling_price_bdt),
    validity: str(p.validity),
    lockUser: str(p.lock_user) === 'Enable',
  };
}

export function mapProfilesData(raw: unknown): HotspotProfilesData {
  const d = obj(raw);
  const names = (rows: unknown) => list(rows).map((r) => str(r.name)).filter(Boolean);
  return { profiles: list(d.profiles).map(mapProfile), pools: names(d.pools), queues: names(d.queues) };
}

/* ───────── selling report (mikhmon sale scripts) ───────── */

export interface HotspotSale {
  no: number;
  date: string;
  time: string;
  username: string;
  profile: string;
  comment: string;
  price: number;
}

export function mapSale(raw: unknown): HotspotSale {
  const r = obj(raw);
  return {
    no: num(r.no),
    date: str(r.date),
    time: str(r.time),
    username: str(r.username),
    profile: str(r.profile),
    comment: str(r.comment),
    price: num(r.price),
  };
}

/* ───────── vouchers (generated hotspot users) ───────── */

export type VoucherStatus = 'unused' | 'used' | 'disabled';

export interface HotspotVoucher {
  id: string;
  code: string;
  mode: 'voucher' | 'user_password';
  profile: string;
  batch: string;
  generatedOn: string;
  status: VoucherStatus;
  uptime: string;
  limitUptime: string;
}

export interface VoucherSummary {
  total: number;
  unused: number;
  used: number;
  disabled: number;
}

export function mapVoucher(raw: unknown): HotspotVoucher {
  const v = obj(raw);
  const status = str(v.status);
  const limit = str(v.limit_uptime);
  return {
    id: str(v.id),
    code: str(v.code),
    mode: str(v.mode) === 'user_password' ? 'user_password' : 'voucher',
    profile: str(v.profile),
    batch: str(v.batch),
    generatedOn: str(v.generated_on),
    status: status === 'used' || status === 'disabled' ? status : 'unused',
    uptime: str(v.uptime),
    limitUptime: limit === '0' || limit === '0s' ? '' : limit,
  };
}

export function mapVoucherSummary(raw: unknown): VoucherSummary {
  const s = obj(raw);
  return { total: num(s.total), unused: num(s.unused), used: num(s.used), disabled: num(s.disabled) };
}

export interface GeneratedVoucher {
  code: string;
  success: boolean;
  error: string;
}

export interface GenerateVouchersResult {
  count: number;
  requested: number;
  vouchers: GeneratedVoucher[];
}

export function mapGenerateResult(raw: unknown): GenerateVouchersResult {
  const d = obj(raw);
  return {
    count: num(d.count),
    requested: num(d.total_requested),
    vouchers: list(d.generated_users).map((g) => ({ code: str(g.username), success: g.success === true, error: str(g.error) })),
  };
}

/* ───────── walled garden (/ip/hotspot/walled-garden) ───────── */

export interface WalledGardenRule {
  id: string;
  dstHost: string;
  action: 'allow' | 'deny';
  server: string;
  comment: string;
  enabled: boolean;
  /** Created by the router itself — read-only. */
  dynamic: boolean;
  hits: number;
}

export interface WalledGardenSummary {
  total: number;
  enabled: number;
  disabled: number;
  allow: number;
  deny: number;
}

export function mapWalledGardenRule(raw: unknown): WalledGardenRule {
  const r = obj(raw);
  return {
    id: str(r.id),
    dstHost: str(r.dst_host),
    action: str(r.action) === 'deny' ? 'deny' : 'allow',
    server: str(r.server),
    comment: str(r.comment),
    enabled: r.enabled === true,
    dynamic: r.dynamic === true,
    hits: num(r.hits),
  };
}

export function mapWalledGardenSummary(raw: unknown): WalledGardenSummary {
  const s = obj(raw);
  return { total: num(s.total), enabled: num(s.enabled), disabled: num(s.disabled), allow: num(s.allow), deny: num(s.deny) };
}
