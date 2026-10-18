import { num, str } from '@/lib/api/case';
import { optNum } from '@/features/admin/olt/types';

type Raw = Record<string, unknown>;
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const optStr = (value: unknown): string | null => {
  const s = str(value).trim();
  return s === '' ? null : s;
};

/** ONU leaf of GET /v1/olts/{id|all}/topology `items`. */
export interface TopologyOnu {
  id: string;
  onuId: string;
  oltId: string;
  oltName: string;
  ponPort: string;
  splitter: string | null;
  customerName: string | null;
  pppoeId: string | null;
  mac: string | null;
  zone: string | null;
  status: 'online' | 'offline';
  reason: string | null;
  rxPowerDbm: number | null;
  txPowerDbm: number | null;
  distance: number | null;
  lastSeen: string | null;
}

export function mapTopologyOnu(raw: unknown): TopologyOnu {
  const r = asRaw(raw);
  return {
    id: str(r.id),
    onuId: str(r.onuId),
    oltId: str(r.oltId),
    oltName: str(r.oltName),
    ponPort: str(r.ponPort, 'Unknown'),
    splitter: optStr(r.splitter),
    customerName: optStr(r.customerName),
    pppoeId: optStr(r.pppoeId),
    mac: optStr(r.mac),
    zone: optStr(r.zone),
    status: str(r.status) === 'online' ? 'online' : 'offline',
    reason: optStr(r.reason),
    rxPowerDbm: optNum(r.rxPowerDbm),
    txPowerDbm: optNum(r.txPowerDbm),
    distance: optNum(r.distance),
    lastSeen: optStr(r.lastSeen),
  };
}

/** Complete per-PON totals of the topology scope (`pon_ports`, never capped). */
export interface TopologyPort {
  oltId: string;
  oltName: string;
  ponPort: string;
  total: number;
  online: number;
  offline: number;
}

export function mapTopologyPort(raw: unknown): TopologyPort {
  const r = asRaw(raw);
  return {
    oltId: str(r.olt_id),
    oltName: str(r.olt_name),
    ponPort: str(r.pon_port, 'Unknown'),
    total: num(r.total),
    online: num(r.online),
    offline: num(r.offline),
  };
}

export type MapLevel = 'Root' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5+';
export const MAP_LEVELS: readonly MapLevel[] = ['Root', 'L1', 'L2', 'L3', 'L4', 'L5+'];

/** Node of GET /v1/network/nodes, with its depth in the parent tree. */
export interface MapNode {
  id: string;
  label: string;
  color: string | null;
  parentId: string | null;
  parentLabel: string | null;
  childCount: number;
  latitude: number | null;
  longitude: number | null;
  level: MapLevel;
}

const validCoords = (lat: number | null, lng: number | null) =>
  lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

/** Map the flat node list and derive each node's level from its parent chain. */
export function buildMapNodes(rawItems: unknown[]): MapNode[] {
  const base = rawItems.map((raw) => {
    const r = asRaw(raw);
    const latitude = optNum(r.latitude);
    const longitude = optNum(r.longitude);
    const placed = validCoords(latitude, longitude);
    return {
      id: str(r.id),
      label: str(r.label) || `Node ${str(r.id)}`,
      color: optStr(r.color),
      parentId: optStr(r.parent_id),
      latitude: placed ? latitude : null,
      longitude: placed ? longitude : null,
    };
  });
  const byId = new Map(base.map((n) => [n.id, n]));
  const children = new Map<string, number>();
  for (const n of base) if (n.parentId && byId.has(n.parentId)) children.set(n.parentId, (children.get(n.parentId) ?? 0) + 1);

  const depthOf = (id: string): number => {
    let depth = 0;
    const seen = new Set<string>([id]);
    let parent = byId.get(id)?.parentId ?? null;
    while (parent && byId.has(parent) && !seen.has(parent)) {
      seen.add(parent);
      depth += 1;
      parent = byId.get(parent)?.parentId ?? null;
    }
    return depth;
  };

  return base.map((n) => {
    const depth = depthOf(n.id);
    return {
      ...n,
      parentLabel: n.parentId ? (byId.get(n.parentId)?.label ?? null) : null,
      childCount: children.get(n.id) ?? 0,
      level: depth === 0 ? 'Root' : depth >= 5 ? 'L5+' : (`L${depth}` as MapLevel),
    };
  });
}
