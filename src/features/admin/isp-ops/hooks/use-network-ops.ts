'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * Per-screen network-ops reads (GET /v1/network-ops/*). Every list is server
 * paginated and tenant-scoped by the JWT. Fields the backend does not record
 * (live Mbps, pps, apps, PON capacity, IPv6, VLAN, uptime) do not exist here.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const nullableNum = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : num(v));
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);

export const networkOpsKeys = {
  all: ['admin', 'network-ops'] as const,
  list: (screen: string, params: Record<string, unknown>) => ['admin', 'network-ops', screen, params] as const,
  options: ['admin', 'network-ops', 'options'] as const,
  customers: (search: string) => ['admin', 'network-ops', 'customer-options', search] as const,
};

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
}

const pageParams = ({ page, pageSize, search }: ListParams) => ({ page, limit: pageSize, search: search || undefined });

// ---- outages ------------------------------------------------------------

export type OutageSeverity = 'minor' | 'major' | 'critical';

/** One PON with offline ONUs (GET /v1/network-ops/outages). */
export interface Outage {
  id: string;
  oltName: string;
  ponPort: string;
  affected: number;
  totalOnus: number;
  severity: OutageSeverity;
  reasons: string[];
  /** Earliest last-seen of the offline ONUs; null when never synced. */
  since: string | null;
  lastSync: string | null;
}

export interface OutageSummary {
  outages: number;
  affectedOnus: number;
  totalOnus: number;
}

function mapOutage(raw: unknown): Outage {
  const r = obj(raw);
  const severity = str(r.severity);
  return {
    id: str(r.id),
    oltName: str(r.olt_name),
    ponPort: str(r.pon_port),
    affected: num(r.affected),
    totalOnus: num(r.total_onus),
    severity: severity === 'critical' || severity === 'major' ? severity : 'minor',
    reasons: strList(r.reasons),
    since: str(r.since) || null,
    lastSync: str(r.last_sync) || null,
  };
}

export function useOutages(params: ListParams) {
  const query = pageParams(params);
  return useQuery({
    queryKey: networkOpsKeys.list('outages', query),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/outages', query, { signal });
      const s = obj(res.raw.summary);
      const summary: OutageSummary = { outages: num(s.outages), affectedOnus: num(s.affected_onus), totalOnus: num(s.total_onus) };
      return { items: res.items.map(mapOutage), meta: res.meta, summary };
    },
    placeholderData: keepPreviousData,
  });
}

// ---- PON ports ------------------------------------------------------------

export interface PonPort {
  id: string;
  oltName: string;
  ponPort: string;
  totalOnus: number;
  onlineOnus: number;
  splitters: string[];
  /** Average ONU Rx in dBm; null when no ONU reported a level. */
  avgRxDbm: number | null;
}

function mapPonPort(raw: unknown): PonPort {
  const r = obj(raw);
  return {
    id: str(r.id),
    oltName: str(r.olt_name),
    ponPort: str(r.pon_port),
    totalOnus: num(r.total_onus),
    onlineOnus: num(r.online_onus),
    splitters: strList(r.splitters),
    avgRxDbm: nullableNum(r.avg_rx_dbm),
  };
}

export function usePonPorts(params: ListParams) {
  const query = pageParams(params);
  return useQuery({
    queryKey: networkOpsKeys.list('pon-ports', query),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/pon-ports', query, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapPonPort),
        meta: res.meta,
        summary: { totalOnus: num(s.total_onus), onlineOnus: num(s.online_onus) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

// ---- top talkers ----------------------------------------------------------

export type TalkerSort = 'total' | 'rx' | 'tx';

/** One customer's usage for a day (GET /v1/network-ops/top-talkers). */
export interface TopTalker {
  userId: string;
  customerName: string;
  username: string;
  interfaceName: string | null;
  routerId: string | null;
  routerName: string | null;
  packageName: string | null;
  packageBandwidth: string | null;
  status: string;
  ip: string | null;
  mac: string | null;
  rxMb: number;
  txMb: number;
  totalMb: number;
  date: string;
}

export interface TopTalkerParams extends ListParams {
  date?: string;
  routerId?: string;
  sort?: TalkerSort;
}

function mapTalker(raw: unknown): TopTalker {
  const r = obj(raw);
  return {
    userId: str(r.user_id),
    customerName: str(r.customer_name),
    username: str(r.username),
    interfaceName: str(r.interface) || null,
    routerId: str(r.router_id) || null,
    routerName: str(r.router_name) || null,
    packageName: str(r.package_name) || null,
    packageBandwidth: str(r.package_bandwidth) || null,
    status: str(r.status),
    ip: str(r.ip) || null,
    mac: str(r.mac) || null,
    rxMb: num(r.rx_mb),
    txMb: num(r.tx_mb),
    totalMb: num(r.total_mb),
    date: str(r.date),
  };
}

export function useTopTalkers({ date, routerId, sort, ...list }: TopTalkerParams) {
  const query = { ...pageParams(list), date: date || undefined, router_id: routerId || undefined, sort: sort || undefined };
  return useQuery({
    queryKey: networkOpsKeys.list('top-talkers', query),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/top-talkers', query, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapTalker),
        meta: res.meta,
        date: str(res.raw.date) || null,
        summary: { customers: num(s.customers), rxMb: num(s.rx_mb), txMb: num(s.tx_mb) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

// ---- IPoE / static ----------------------------------------------------------

export interface IpoeCustomer {
  userId: string;
  name: string;
  mobile: string | null;
  status: string;
  routerName: string | null;
  ip: string | null;
  mac: string | null;
  gateway: string | null;
  maxLimit: string | null;
}

function mapIpoe(raw: unknown): IpoeCustomer {
  const r = obj(raw);
  return {
    userId: str(r.user_id),
    name: str(r.name),
    mobile: str(r.mobile) || null,
    status: str(r.status),
    routerName: str(r.router_name) || null,
    ip: str(r.ip) || null,
    mac: str(r.mac) || null,
    gateway: str(r.gateway) || null,
    maxLimit: str(r.max_limit) || null,
  };
}

export function useIpoeCustomers(params: ListParams & { status?: string }) {
  const query = { ...pageParams(params), status: params.status || undefined };
  return useQuery({
    queryKey: networkOpsKeys.list('ipoe', query),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/ipoe', query, { signal });
      const s = obj(res.raw.summary);
      return { items: res.items.map(mapIpoe), meta: res.meta, summary: { total: num(s.total), active: num(s.active) } };
    },
    placeholderData: keepPreviousData,
  });
}

// ---- form pickers -----------------------------------------------------------

export interface PickOption {
  value: string;
  label: string;
}

export interface PackageOption extends PickOption {
  bandwidth: string | null;
  price: number | null;
}

export interface NetOpsOptions {
  packages: PackageOption[];
  routers: PickOption[];
  employees: (PickOption & { mobile: string | null })[];
  areas: PickOption[];
}

/** Tenant packages / routers / employees / areas for the forms. */
export function useNetOpsOptions(enabled = true) {
  return useQuery({
    queryKey: networkOpsKeys.options,
    queryFn: async ({ signal }): Promise<NetOpsOptions> => {
      const d = obj(await http.get<unknown>('/v1/network-ops/options', undefined, signal));
      const list = (v: unknown) => (Array.isArray(v) ? v.map(obj) : []);
      return {
        packages: list(d.packages).map((p) => ({
          value: str(p.id),
          label: str(p.name),
          bandwidth: str(p.bandwidth) || null,
          price: nullableNum(p.price),
        })),
        routers: list(d.routers).map((r) => ({ value: str(r.id), label: str(r.name) })),
        employees: list(d.employees).map((e) => ({ value: str(e.id), label: str(e.name), mobile: str(e.mobile) || null })),
        areas: list(d.areas).map((a) => ({ value: str(a.id), label: str(a.name) })),
      };
    },
    staleTime: 5 * 60_000,
    enabled,
  });
}

export interface CustomerOption {
  id: string;
  name: string;
  mobile: string | null;
  pppoeId: string | null;
}

/** Customer search for pickers (first 20 matches). */
export function useCustomerOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: networkOpsKeys.customers(search),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/customers', { search: search || undefined, limit: 20 }, { signal });
      return res.items.map((raw): CustomerOption => {
        const r = obj(raw);
        return { id: str(r.id), name: str(r.name), mobile: str(r.mobile) || null, pppoeId: str(r.pppoe_id) || null };
      });
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

// ---- session control ----------------------------------------------------------

/**
 * Drop a customer's live PPPoE session — the existing router disconnect
 * endpoint (POST /v1/routers/{id}/disconnect), which is the CoA action.
 */
export function useDisconnectSession() {
  return useMutation({
    mutationFn: ({ routerId, username }: { routerId: string; username: string }) =>
      http.post<unknown>(`/v1/routers/${routerId}/disconnect`, { username }, { router_id: routerId }),
    onSuccess: (_data, { username }) => toast.success(`${username} disconnected`),
  });
}
