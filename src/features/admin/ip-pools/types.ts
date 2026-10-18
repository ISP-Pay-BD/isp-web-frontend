import { num, str } from '@/lib/api/case';

export type IpPoolType = 'public' | 'private';
export type IpPoolStatus = 'active' | 'inactive';

/** One row of GET /v1/ip-pools (`data.pools[]`). */
export interface IpPool {
  id: string;
  name: string;
  routerId: string;
  /** Empty when the router no longer exists. */
  routerName: string;
  startIp: string;
  endIp: string;
  /** Empty when the pool is defined by a start/end range. */
  cidr: string;
  gateway: string;
  type: IpPoolType;
  status: IpPoolStatus;
  notes: string;
  /** Addresses in the range; null when the stored range is invalid. */
  size: number | null;
  /** Active + reserved static-IP assignments in this pool. */
  used: number;
}

/** `data.summary` of GET /v1/ip-pools — totals across ALL of the tenant's pools. */
export interface IpPoolSummary {
  pools: number;
  totalIps: number;
  usedIps: number;
  publicIps: number;
  privatePools: number;
}

/** GET /v1/ip-pools/{id}/available */
export interface IpPoolAvailability {
  poolId: string;
  /** Next address the backend would hand out (empty when the pool is full). */
  nextIp: string;
  available: string[];
}

export function mapIpPool(raw: unknown): IpPool {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(r.id),
    name: str(r.name),
    routerId: str(r.router_id),
    routerName: str(r.router_name),
    startIp: str(r.start_ip),
    endIp: str(r.end_ip),
    cidr: str(r.cidr),
    gateway: str(r.gateway),
    type: str(r.pool_type) === 'private' ? 'private' : 'public',
    status: str(r.status) === 'inactive' ? 'inactive' : 'active',
    notes: str(r.notes),
    size: r.size === null || r.size === undefined ? null : num(r.size),
    used: num(r.used_count),
  };
}

export function mapIpPoolSummary(raw: unknown): IpPoolSummary {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    pools: num(r.pools),
    totalIps: num(r.total_ips),
    usedIps: num(r.used_ips),
    publicIps: num(r.public_ips),
    privatePools: num(r.private_pools),
  };
}

export function mapIpPoolAvailability(raw: unknown): IpPoolAvailability {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    poolId: str(r.pool_id),
    nextIp: str(r.next_ip),
    available: Array.isArray(r.available) ? r.available.map((ip) => str(ip)) : [],
  };
}

/** Whole-number utilisation %, 0 when the size is unknown. */
export function utilisationPct(used: number, size: number | null): number {
  return size && size > 0 ? Math.min(100, Math.round((used / size) * 100)) : 0;
}
