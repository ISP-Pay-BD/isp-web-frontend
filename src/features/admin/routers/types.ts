import { num, str } from '@/lib/api/case';

/** One row of GET /v1/routers (credentials are never sent by the backend). */
export interface RouterRow {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  /** DB flag: 'active' routers are polled and offered in pickers. */
  status: 'active' | 'inactive';
  hotspotName: string;
  dnsName: string;
  /** Customers assigned to this router in the billing DB. */
  customers: number;
  /** PPPoE secrets / active sessions from the cached router stats (null = never polled). */
  cachedTotal: number | null;
  cachedActive: number | null;
  /** Last known reachability from the stats cache ('online' | 'offline' | ''). */
  cachedStatus: string;
  cachedUpdatedAt: string;
}

export function mapRouter(raw: unknown): RouterRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  const hasStats = r.cached_total !== undefined && r.cached_total !== null;
  return {
    id: str(r.id),
    name: str(r.name),
    host: str(r.host),
    port: num(r.port),
    username: str(r.username),
    status: str(r.status) === 'inactive' ? 'inactive' : 'active',
    hotspotName: str(r.hotspot_name),
    dnsName: str(r.dns_name),
    customers: num(r.customers_count),
    cachedTotal: hasStats ? num(r.cached_total) : null,
    cachedActive: hasStats ? num(r.cached_active) : null,
    cachedStatus: str(r.cached_status),
    cachedUpdatedAt: str(r.cached_last_updated),
  };
}
