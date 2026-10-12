import { num, str } from '@/lib/api/case';

/**
 * Shapes of the zapi OLT endpoints (OltApiController). Credentials are never
 * returned; anything the backend cannot measure is simply absent here.
 */

type Raw = Record<string, unknown>;

const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
export const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Number or null — keeps "not measured" apart from 0. */
export function optNum(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const optStr = (value: unknown): string | null => {
  const s = str(value).trim();
  return s === '' ? null : s;
};

export type OltProtocol = 'telnet' | 'http' | 'https' | 'snmp';
export const OLT_PROTOCOLS: readonly OltProtocol[] = ['telnet', 'http', 'https', 'snmp'];

/** Brand option of the OLT form — GET /v1/olts → `brands`. */
export interface OltBrandOption {
  value: string;
  label: string;
  /** A sync/diagnostics driver for this brand is installed on the server. */
  syncSupported: boolean;
}

export function mapBrandOption(raw: unknown): OltBrandOption {
  const r = asRaw(raw);
  return { value: str(r.value), label: str(r.label, str(r.value)), syncSupported: r.sync_supported === true };
}

/** Vendor usage across this tenant's OLTs — GET /v1/olts → `brand_counts`. */
export interface OltBrandUsage {
  brand: string;
  label: string;
  inCatalog: boolean;
  syncSupported: boolean;
  olts: number;
  onusTotal: number;
  onusOnline: number;
  lastSyncedAt: string | null;
}

export function mapBrandUsage(raw: unknown): OltBrandUsage {
  const r = asRaw(raw);
  return {
    brand: str(r.brand),
    label: str(r.label, str(r.brand)),
    inCatalog: r.in_catalog === true,
    syncSupported: r.sync_supported === true,
    olts: num(r.olts),
    onusTotal: num(r.onus_total),
    onusOnline: num(r.onus_online),
    lastSyncedAt: optStr(r.last_synced_at),
  };
}

/** Tenant-wide totals — GET /v1/olts → `summary` (independent of the page shown). */
export interface OltSummary {
  olts: number;
  onusTotal: number;
  onusOnline: number;
  onusOffline: number;
}

export function mapOltSummary(raw: unknown): OltSummary {
  const r = asRaw(raw);
  return { olts: num(r.olts), onusTotal: num(r.onus_total), onusOnline: num(r.onus_online), onusOffline: num(r.onus_offline) };
}

/** One row of GET /v1/olts `items`. */
export interface OltRow {
  id: string;
  name: string;
  brand: string;
  ip: string;
  port: number | null;
  protocol: string;
  username: string;
  snmpOid: string;
  hasLoginKey: boolean;
  syncSupported: boolean;
  lastSyncedAt: string | null;
  /** Distinct PON ports seen in the last sync (null = never synced). */
  ponPorts: number | null;
  onuTotal: number;
  onuOnline: number;
  onuOffline: number;
  /** DB enable flag (`olts.status`), not live reachability. */
  enabled: boolean;
}

export function mapOlt(raw: unknown): OltRow {
  const r = asRaw(raw);
  const onuTotal = num(r.onuTotal);
  const onuOnline = num(r.onuOnline);
  return {
    id: str(r.id),
    name: str(r.name),
    brand: str(r.brand),
    ip: str(r.ip),
    port: optNum(r.port),
    protocol: str(r.protocol).toLowerCase(),
    username: str(r.username),
    snmpOid: str(r.snmp_oid),
    hasLoginKey: r.has_login_key === true,
    syncSupported: r.sync_supported === true,
    lastSyncedAt: optStr(r.last_synced_at),
    ponPorts: optNum(r.totalPonPorts),
    onuTotal,
    onuOnline,
    onuOffline: num(r.offlineOnus, onuTotal - onuOnline),
    enabled: str(r.status) === 'online',
  };
}

/** ONU row of GET /v1/olts/{id}/onus and POST /v1/olts/{id}/diagnostics. */
export interface OltOnu {
  /** Cached row id (null for a live row the cache does not have yet). */
  id: string | null;
  onuId: string;
  ponPort: string;
  onuIndex: string;
  status: 'online' | 'offline';
  mac: string | null;
  description: string | null;
  customerName: string | null;
  pppoeId: string | null;
  rxPower: number | null;
  txPower: number | null;
  distance: number | null;
  vendor: string | null;
  reason: string | null;
  splitter: string | null;
  lastSeen: string | null;
}

export function mapOnu(raw: unknown): OltOnu {
  const r = asRaw(raw);
  return {
    id: optStr(r.id),
    onuId: str(r.onu_id),
    ponPort: str(r.pon_port),
    onuIndex: str(r.onu_index),
    status: str(r.status) === 'online' ? 'online' : 'offline',
    mac: optStr(r.mac),
    description: optStr(r.description),
    customerName: optStr(r.customer_name),
    pppoeId: optStr(r.pppoe_id),
    rxPower: optNum(r.rx_power),
    txPower: optNum(r.tx_power),
    distance: optNum(r.distance),
    vendor: optStr(r.vendor),
    reason: optStr(r.reason),
    splitter: optStr(r.splitter),
    lastSeen: optStr(r.last_seen),
  };
}

export type OnuHealth = 'online' | 'wire_down' | 'power_off';

/** Same split the backend summary uses: offline + "wire"/"los" reason = fibre fault. */
export function onuHealth(onu: Pick<OltOnu, 'status' | 'reason'>): OnuHealth {
  if (onu.status === 'online') return 'online';
  return /wire|los/i.test(onu.reason ?? '') ? 'wire_down' : 'power_off';
}

export interface OnuSummary {
  total: number;
  online: number;
  wireDown: number;
  powerOff: number;
}

export function mapOnuSummary(raw: unknown): OnuSummary {
  const r = asRaw(raw);
  return {
    total: num(r.total),
    online: num(r.online),
    wireDown: num(r.offline_wire_down),
    powerOff: num(r.offline_power_off),
  };
}

export interface PonPortStat {
  port: string;
  total: number;
  online: number;
  offline: number;
}

export function mapPonPortStat(raw: unknown): PonPortStat {
  const r = asRaw(raw);
  return { port: str(r.port), total: num(r.total), online: num(r.online), offline: num(r.offline) };
}

/** `olt` block of GET /v1/olts/{id}/onus. */
export interface OnuListOlt {
  id: string;
  name: string;
  brand: string;
  syncSupported: boolean;
}

export function mapOnuListOlt(raw: unknown): OnuListOlt {
  const r = asRaw(raw);
  return { id: str(r.id), name: str(r.name), brand: str(r.brand), syncSupported: r.sync_supported === true };
}

/** POST /v1/olts/{id}/diagnostics — live ONU table (or the cache when the device did not answer). */
export interface OltDiagnostics {
  oltId: string;
  oltName: string;
  isCached: boolean;
  liveError: string | null;
  lastSyncedAt: string | null;
  summary: OnuSummary;
  ponPorts: PonPortStat[];
  items: OltOnu[];
}

export function mapDiagnostics(raw: unknown): OltDiagnostics {
  const r = asRaw(raw);
  return {
    oltId: str(r.olt_id),
    oltName: str(r.olt_name),
    isCached: r.is_cached === true,
    liveError: optStr(r.live_error),
    lastSyncedAt: optStr(r.last_synced_at),
    summary: mapOnuSummary(r.summary),
    ponPorts: asList(r.pon_ports).map(mapPonPortStat),
    items: asList(r.items).map(mapOnu),
  };
}

/** Backend timestamps are "Y-m-d H:i:s"; make them parseable everywhere. */
export function parseBackendDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Rx optical level band used for colouring (dBm). */
export function rxBand(rx: number | null): 'good' | 'weak' | 'critical' | 'unknown' {
  if (rx === null) return 'unknown';
  if (rx > -25) return 'good';
  if (rx > -27) return 'weak';
  return 'critical';
}
