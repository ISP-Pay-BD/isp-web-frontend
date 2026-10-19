'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronRight, GitBranch, Maximize2, Minus, Network, Plus, RotateCcw, Router, SignalHigh, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { rxBand } from '@/features/admin/olt/types';
import type { TopologyOnu, TopologyPort } from '../types';

const NO_SPLITTER = 'No splitter assigned';
/** Per-splitter ONUs rendered as individual boxes beyond this just show a "+N more" tile — a splitter can carry 60+ drops, and drawing that many boxes makes the canvas unusable. */
const MAX_ONU_BOXES_PER_SPLITTER = 10;

const COL_WIDTH = 272;
const ROW_HEIGHT = 108;
const BOX_WIDTH = 212;
const BOX_HEIGHT = 92;

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1.8;
/** Pointer travel (px) before a press becomes a pan / card drag — below it the press is a click on whatever it landed on. */
const DRAG_THRESHOLD = 4;
const EASE = 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)';

type NodeKind = 'olt' | 'port' | 'splitter' | 'onu' | 'more';

/** What the page's inspector shows for a clicked card. */
export type CanvasSelection =
  | { id: string; kind: 'onu'; onu: TopologyOnu }
  | { id: string; kind: 'olt' | 'port' | 'splitter'; title: string; parentTitle?: string; online: number; offline: number; childCount: number };

export interface CanvasLabels {
  onu: string;
  direct: string;
  online: string;
  offline: string;
  olt: string;
  port: string;
  splitter: string;
  ponPorts: string;
  onus: string;
  users: string;
  rx: string;
}

const DEFAULT_LABELS: CanvasLabels = {
  onu: 'ONU',
  direct: 'Direct Port Connection',
  online: 'Online',
  offline: 'Offline',
  olt: 'OLT',
  port: 'Port',
  splitter: 'Splitter',
  ponPorts: 'PON Ports',
  onus: 'ONUs',
  users: 'Users',
  rx: 'Rx',
};

interface TreeNode {
  id: string;
  kind: NodeKind;
  title: string;
  /** Meta lines under the name. */
  meta: string[];
  online: number;
  offline: number;
  onu?: TopologyOnu;
  selection?: CanvasSelection;
  children: TreeNode[];
  /** Layout, assigned by layoutTree(). */
  x: number;
  y: number;
}

/** port → splitter → loaded ONU leaves, same grouping the list view uses. */
function buildTree(
  ports: TopologyPort[],
  groupedTree: Map<string, Map<string, TopologyOnu[]>>,
  portKey: (oltId: string, ponPort: string) => string,
  labels: CanvasLabels,
): TreeNode[] {
  const oltMap = new Map<string, TreeNode>();

  for (const port of ports) {
    let oltNode = oltMap.get(port.oltId);
    if (!oltNode) {
      oltNode = { id: `olt-${port.oltId}`, kind: 'olt', title: port.oltName, meta: [], online: 0, offline: 0, children: [], x: 0, y: 0 };
      oltMap.set(port.oltId, oltNode);
    }

    const splitters = groupedTree.get(portKey(port.oltId, port.ponPort)) ?? new Map<string, TopologyOnu[]>();
    const portNode: TreeNode = {
      id: `port-${port.oltId}-${port.ponPort}`,
      kind: 'port',
      title: port.ponPort,
      meta: [`${labels.onus}: ${formatCount(port.total)}`],
      online: port.online,
      offline: port.offline,
      children: [],
      x: 0,
      y: 0,
    };
    portNode.selection = {
      id: portNode.id,
      kind: 'port',
      title: port.ponPort,
      parentTitle: port.oltName,
      online: port.online,
      offline: port.offline,
      childCount: port.total,
    };

    for (const [splitterName, onus] of splitters) {
      const splitterOnline = onus.filter((o) => o.status === 'online').length;
      const onuChildren: TreeNode[] = onus.slice(0, MAX_ONU_BOXES_PER_SPLITTER).map((onu) => {
        const isOnline = onu.status === 'online';
        const rx = onu.rxPowerDbm !== null ? `${labels.rx}: ${onu.rxPowerDbm} dBm` : `${labels.rx}: —`;
        return {
          id: `onu-${onu.id}`,
          kind: 'onu' as const,
          title: onu.customerName ?? onu.mac ?? onu.onuId,
          meta: [
            `${labels.onu}: ${onu.onuIndex ?? onu.onuId}${onu.vendor ? ` · ${onu.vendor}` : ''}`,
            onu.distance !== null && onu.distance > 0 ? `${rx} · ${onu.distance} m` : rx,
          ],
          online: isOnline ? 1 : 0,
          offline: isOnline ? 0 : 1,
          onu,
          selection: { id: `onu-${onu.id}`, kind: 'onu' as const, onu },
          children: [],
          x: 0,
          y: 0,
        };
      });
      if (onus.length > MAX_ONU_BOXES_PER_SPLITTER) {
        onuChildren.push({
          id: `more-${port.oltId}-${port.ponPort}-${splitterName}`,
          kind: 'more',
          title: `+${formatCount(onus.length - MAX_ONU_BOXES_PER_SPLITTER)}`,
          meta: [],
          online: 0,
          offline: 0,
          children: [],
          x: 0,
          y: 0,
        });
      }

      // ONUs without a splitter hang off a "Direct Port Connection" card, as on the web page.
      const splitterTitle = splitterName === NO_SPLITTER ? labels.direct : splitterName;
      const splitterId = `splitter-${port.oltId}-${port.ponPort}-${splitterName}`;
      portNode.children.push({
        id: splitterId,
        kind: 'splitter',
        title: splitterTitle,
        meta: [`${labels.users}: ${formatCount(onus.length)}`],
        online: splitterOnline,
        offline: onus.length - splitterOnline,
        selection: {
          id: splitterId,
          kind: 'splitter',
          title: splitterTitle,
          parentTitle: `${port.oltName} · ${port.ponPort}`,
          online: splitterOnline,
          offline: onus.length - splitterOnline,
          childCount: onus.length,
        },
        children: onuChildren,
        x: 0,
        y: 0,
      });
    }

    oltNode.children.push(portNode);
    oltNode.online += port.online;
    oltNode.offline += port.offline;
  }

  const roots = Array.from(oltMap.values());
  for (const olt of roots) {
    olt.meta = [`${labels.ponPorts}: ${formatCount(olt.children.length)}`];
    olt.selection = {
      id: olt.id,
      kind: 'olt',
      title: olt.title,
      online: olt.online,
      offline: olt.offline,
      childCount: olt.children.length,
    };
  }
  return roots;
}

/** Assigns (x, y) over only the *visible* nodes (collapsed branches take no space): x by depth, y by an in-order leaf walk with parents centred over their children. */
function layoutTree(roots: TreeNode[], isExpanded: (n: TreeNode) => boolean): { width: number; height: number } {
  let cursor = 0;
  let maxX = 0;
  let maxY = 0;
  const place = (node: TreeNode, depth: number) => {
    node.x = depth * COL_WIDTH;
    const kids = isExpanded(node) ? node.children : [];
    if (kids.length === 0) {
      node.y = cursor * ROW_HEIGHT;
      cursor += 1;
    } else {
      for (const child of kids) place(child, depth + 1);
      node.y = (kids[0]!.y + kids[kids.length - 1]!.y) / 2;
    }
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  };
  for (const root of roots) place(root, 0);
  return { width: maxX + BOX_WIDTH, height: maxY + BOX_HEIGHT };
}

const KIND_STYLE: Record<NodeKind, { icon: typeof Router; chip: string; tag: string }> = {
  olt: { icon: Router, chip: 'bg-blue-500/12 text-blue-500', tag: 'bg-blue-500/12 text-blue-600 dark:text-blue-400' },
  port: { icon: GitBranch, chip: 'bg-violet-500/12 text-violet-500', tag: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
  splitter: { icon: Zap, chip: 'bg-amber-500/12 text-amber-500', tag: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  onu: { icon: SignalHigh, chip: 'bg-emerald-500/12 text-emerald-500', tag: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' },
  more: { icon: SignalHigh, chip: 'bg-muted text-muted-foreground', tag: 'bg-muted text-muted-foreground' },
};

const RX_TEXT: Record<ReturnType<typeof rxBand>, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  weak: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-500',
  unknown: 'text-muted-foreground',
};

function NodeCard({
  node,
  labels,
  selected,
  expandable,
  expanded,
  dx,
  dy,
  registerEl,
  onClick,
}: {
  node: TreeNode;
  labels: CanvasLabels;
  selected: boolean;
  expandable: boolean;
  expanded: boolean;
  dx: number;
  dy: number;
  registerEl: (id: string, el: HTMLElement | null) => void;
  onClick?: () => void;
}) {
  const isOnu = node.kind === 'onu' && node.onu;
  const isOnline = node.online > 0 && Boolean(isOnu);
  const style = KIND_STYLE[node.kind];
  const Icon = style.icon;
  const tag = isOnu ? (isOnline ? labels.online : labels.offline) : node.kind === 'olt' ? labels.olt : node.kind === 'port' ? labels.port : node.kind === 'splitter' ? labels.splitter : '';
  const band = isOnu && node.onu ? rxBand(node.onu.rxPowerDbm) : 'unknown';

  if (node.kind === 'more') {
    return (
      <div
        ref={(el) => registerEl(node.id, el)}
        data-node-id={node.id}
        className="absolute flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/40 text-sm font-semibold text-muted-foreground"
        style={{ left: node.x, top: node.y - BOX_HEIGHT / 2, width: BOX_WIDTH, height: BOX_HEIGHT * 0.55, transform: `translate(${dx}px, ${dy}px)` }}
      >
        {node.title}
      </div>
    );
  }

  return (
    <button
      ref={(el) => registerEl(node.id, el)}
      type="button"
      data-node-id={node.id}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'absolute flex cursor-grab flex-col justify-between rounded-2xl border bg-card p-2.5 text-left shadow-sm outline-none',
        'transition-[border-color,box-shadow] duration-150 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/60',
        'data-[dragging=true]:z-20 data-[dragging=true]:cursor-grabbing data-[dragging=true]:shadow-xl',
        isOnu && !isOnline ? 'border-red-500/40 bg-red-500/[0.04]' : 'border-border/70',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
      style={{ left: node.x, top: node.y - BOX_HEIGHT / 2, width: BOX_WIDTH, height: BOX_HEIGHT, transform: `translate(${dx}px, ${dy}px)` }}
    >
      <span className="flex items-center gap-2">
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', style.chip)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className={cn('rounded-md px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide', style.tag, isOnu && !isOnline && 'bg-red-500/12 text-red-500')}>{tag}</span>
        {expandable && (
          <ChevronRight className={cn('ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200', expanded && 'rotate-90')} aria-hidden />
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight text-foreground">{node.title}</span>
        {isOnu ? (
          <>
            <span className="block truncate font-mono text-xs leading-snug text-muted-foreground">{node.meta[0]}</span>
            <span className={cn('block truncate font-mono text-xs leading-snug', RX_TEXT[band])}>{node.meta[1]}</span>
          </>
        ) : (
          <>
            <span className="block truncate text-xs leading-snug text-muted-foreground">{node.meta[0]}</span>
            <span className="flex items-center gap-2.5 font-mono text-xs leading-snug tabular-nums">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {formatCount(node.online)}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {formatCount(node.offline)}
              </span>
            </span>
          </>
        )}
      </span>
    </button>
  );
}

interface Point {
  x: number;
  y: number;
}

const LEGEND = [
  { key: 'olt', dot: 'bg-blue-500' },
  { key: 'port', dot: 'bg-violet-500' },
  { key: 'splitter', dot: 'bg-amber-500' },
  { key: 'online', dot: 'bg-emerald-500' },
  { key: 'offline', dot: 'bg-red-500' },
] as const;

const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

interface View {
  x: number;
  y: number;
  k: number;
}

type Drag =
  | { mode: 'pan'; id: number; startX: number; startY: number; viewX: number; viewY: number; active: boolean }
  | { mode: 'node'; id: number; nodeId: string; startX: number; startY: number; originX: number; originY: number; active: boolean; liveX: number; liveY: number };

export function TopologyCanvas({
  ports,
  groupedTree,
  portKey,
  selectedId,
  onSelect,
  expandAll = false,
  emptyLabel,
  labels: labelOverrides,
}: {
  ports: TopologyPort[];
  groupedTree: Map<string, Map<string, TopologyOnu[]>>;
  portKey: (oltId: string, ponPort: string) => string;
  selectedId?: string | null;
  onSelect: (selection: CanvasSelection) => void;
  /** Open every branch (used while a search/zone filter is active so matches are visible). */
  expandAll?: boolean;
  emptyLabel: string;
  labels?: Partial<CanvasLabels>;
}) {
  const labels = useMemo<CanvasLabels>(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLElement>());
  const pathEls = useRef(new Map<string, SVGPathElement>());
  const dimsRef = useRef({ width: 0, height: 0 });
  // The view lives in a ref and is written straight to the DOM: panning and
  // wheel-zooming fire dozens of events a second, and re-rendering a few
  // hundred nodes for each one is what made the old canvas feel sticky.
  const viewRef = useRef<View>({ x: 24, y: 24, k: 1 });
  const dragRef = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const [zoomLabel, setZoomLabel] = useState(100);

  // Branch open/closed. Defaults mirror the web page: OLTs open, everything else closed
  // (or all open under `expandAll`); `toggled` holds the ids flipped away from their default.
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const [prevExpandAll, setPrevExpandAll] = useState(expandAll);
  if (prevExpandAll !== expandAll) {
    setPrevExpandAll(expandAll);
    setToggled(new Set());
  }
  // Dragged-away card positions (px offsets from the computed layout).
  const [offsets, setOffsets] = useState<Record<string, Point>>({});

  const roots = useMemo(() => buildTree(ports, groupedTree, portKey, labels), [ports, groupedTree, portKey, labels]);
  const isExpanded = useCallback(
    (n: TreeNode) => (n.kind === 'olt' || expandAll) !== toggled.has(n.id),
    [expandAll, toggled],
  );
  const { width, height } = useMemo(() => layoutTree(roots, isExpanded), [roots, isExpanded]);

  const { nodes, edges } = useMemo(() => {
    const nodeList: TreeNode[] = [];
    const edgeList: { id: string; parent: TreeNode; child: TreeNode }[] = [];
    const walk = (n: TreeNode) => {
      nodeList.push(n);
      if (!isExpanded(n)) return;
      for (const child of n.children) {
        edgeList.push({ id: `${n.id}->${child.id}`, parent: n, child });
        walk(child);
      }
    };
    roots.forEach(walk);
    return { nodes: nodeList, edges: edgeList };
  }, [roots, isExpanded]);

  /** Ids of the selected card and everything above it, so the active branch draws emphasised. */
  const activePath = useMemo(() => {
    const found = new Set<string>();
    if (!selectedId) return found;
    const visit = (n: TreeNode): boolean => {
      const hit = n.id === selectedId || n.children.some(visit);
      if (hit) found.add(n.id);
      return hit;
    };
    roots.some(visit);
    return found;
  }, [roots, selectedId]);

  const branchIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (n: TreeNode) => {
      if (n.kind !== 'olt' && n.children.length > 0) ids.push(n.id);
      n.children.forEach(walk);
    };
    roots.forEach(walk);
    return ids;
  }, [roots]);

  const edgePath = (parent: TreeNode, child: TreeNode, offsetOf: (id: string) => Point): string => {
    const p = offsetOf(parent.id);
    const c = offsetOf(child.id);
    const x1 = parent.x + p.x + BOX_WIDTH;
    const y1 = parent.y + p.y;
    const x2 = child.x + c.x;
    const y2 = child.y + c.y;
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };
  const committedOffset = (id: string): Point => offsets[id] ?? { x: 0, y: 0 };

  const applyView = useCallback((view: View, animate = false) => {
    viewRef.current = view;
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = animate ? EASE : 'none';
    // Whole-pixel translate: a fractional offset makes the browser resample card text, which reads as blur.
    el.style.transform = `translate(${Math.round(view.x)}px, ${Math.round(view.y)}px) scale(${view.k})`;
    const pct = Math.round(view.k * 100);
    setZoomLabel((prev) => (prev === pct ? prev : pct));
  }, []);

  /** Scale so the whole tree is visible, centred; never zoom in past 100%. */
  const fit = useCallback(
    (animate = true) => {
      const surface = surfaceRef.current;
      const { width: w, height: h } = dimsRef.current;
      if (!surface || w === 0) return;
      const pad = 48;
      const rect = surface.getBoundingClientRect();
      const k = clampZoom(Math.min((rect.width - pad * 2) / w, (rect.height - pad * 2) / h, 1));
      applyView({ k, x: (rect.width - w * k) / 2, y: Math.max(pad / 2, (rect.height - h * k) / 2) }, animate);
    },
    [applyView],
  );

  useLayoutEffect(() => {
    dimsRef.current = { width, height };
  }, [width, height]);

  // Re-fit when the data itself changes (OLT / filter / splitter layout), before paint so there's no jump —
  // but not on every expand/collapse, which would yank the view around under the cursor.
  useLayoutEffect(() => {
    fit(false);
  }, [fit, roots]);

  /** Zoom by a factor around a point in surface coordinates (the cursor, or the centre for the buttons). */
  const zoomAt = useCallback(
    (factor: number, px: number, py: number, animate = false) => {
      const { x, y, k } = viewRef.current;
      const next = clampZoom(k * factor);
      if (next === k) return;
      const ratio = next / k;
      applyView({ k: next, x: px - (px - x) * ratio, y: py - (py - y) * ratio }, animate);
    },
    [applyView],
  );

  const zoomFromCentre = (factor: number) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (rect) zoomAt(factor, rect.width / 2, rect.height / 2, true);
  };

  // Wheel needs a native, non-passive listener: React's onWheel is passive,
  // so preventDefault() there is ignored and the whole page scrolls while
  // you try to zoom. Ctrl/⌘ + wheel (and trackpad pinch) zooms toward the
  // cursor; a plain wheel / two-finger swipe pans.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - rect.left, e.clientY - rect.top);
      } else {
        const { x, y, k } = viewRef.current;
        applyView({ k, x: x - e.deltaX, y: y - e.deltaY });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyView, zoomAt]);

  // Pointer capture is taken only once a press has moved past DRAG_THRESHOLD.
  // Capturing on pointerdown retargets the eventual `click` to the surface,
  // so node buttons never received it and the inspector never opened.
  // A press that starts on a card drags that card; anywhere else pans the canvas.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const nodeId = (e.target as HTMLElement).closest<HTMLElement>('[data-node-id]')?.dataset.nodeId;
    if (nodeId) {
      const origin = committedOffset(nodeId);
      dragRef.current = { mode: 'node', id: e.pointerId, nodeId, startX: e.clientX, startY: e.clientY, originX: origin.x, originY: origin.y, active: false, liveX: origin.x, liveY: origin.y };
    } else {
      const { x, y } = viewRef.current;
      dragRef.current = { mode: 'pan', id: e.pointerId, startX: e.clientX, startY: e.clientY, viewX: x, viewY: y, active: false };
    }
  };

  const redrawEdges = (liveId: string, live: Point) => {
    const offsetOf = (id: string) => (id === liveId ? live : committedOffset(id));
    for (const edge of edges) {
      pathEls.current.get(edge.id)?.setAttribute('d', edgePath(edge.parent, edge.child, offsetOf));
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.panning = 'true';
      if (drag.mode === 'node') nodeEls.current.get(drag.nodeId)?.setAttribute('data-dragging', 'true');
    }
    if (drag.mode === 'pan') {
      applyView({ k: viewRef.current.k, x: drag.viewX + dx, y: drag.viewY + dy });
      return;
    }
    const k = viewRef.current.k;
    drag.liveX = drag.originX + dx / k;
    drag.liveY = drag.originY + dy / k;
    const el = nodeEls.current.get(drag.nodeId);
    if (el) el.style.transform = `translate(${drag.liveX}px, ${drag.liveY}px)`;
    redrawEdges(drag.nodeId, { x: drag.liveX, y: drag.liveY });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const surface = e.currentTarget;
    if (drag.active && surface.hasPointerCapture(e.pointerId)) surface.releasePointerCapture(e.pointerId);
    delete surface.dataset.panning;
    dragRef.current = null;
    if (!drag.active) return;
    if (drag.mode === 'node') {
      nodeEls.current.get(drag.nodeId)?.removeAttribute('data-dragging');
      setOffsets((prev) => ({ ...prev, [drag.nodeId]: { x: drag.liveX, y: drag.liveY } }));
    }
    // A drag that ended over a card must not also count as a click on it.
    suppressClick.current = true;
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const registerEl = useCallback((id: string, el: HTMLElement | null) => {
    if (el) nodeEls.current.set(id, el);
    else nodeEls.current.delete(id);
  }, []);

  const handleCardClick = (node: TreeNode) => {
    if (suppressClick.current) return;
    if (node.children.length > 0) {
      setToggled((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    }
    if (node.selection) onSelect(node.selection);
  };

  const expandEverything = () => {
    // Flip every branch that is currently closed by default; `expandAll` mode is already fully open.
    setToggled(new Set(expandAll ? [] : branchIds));
  };

  if (roots.length === 0) {
    return <div className="flex h-[640px] items-center justify-center text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  const controlBtn = 'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';

  return (
    <div className="relative h-[640px] overflow-hidden bg-muted/20">
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-0.5 rounded-lg border border-border/60 bg-card/95 p-1 shadow-sm backdrop-blur-sm">
        <button type="button" onClick={() => zoomFromCentre(1.25)} className={controlBtn} aria-label="Zoom in" title="Zoom in">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => zoomFromCentre(0.8)} className={controlBtn} aria-label="Zoom out" title="Zoom out">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => fit(true)} className={controlBtn} aria-label="Fit to screen" title="Fit to screen">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={expandEverything} className={controlBtn} aria-label="Expand all" title="Expand all">
          <Network className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setOffsets({})} className={controlBtn} aria-label="Reset card positions" title="Reset card positions">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          {LEGEND.map((item) => (
            <span key={item.key} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', item.dot)} />
              {item.key === 'online' ? labels.online : item.key === 'offline' ? labels.offline : item.key === 'olt' ? labels.olt : item.key === 'port' ? labels.port : labels.splitter}
            </span>
          ))}
          <span className="font-mono tabular-nums text-foreground">{zoomLabel}%</span>
        </span>
        <span className="hidden rounded-lg bg-card/80 px-2 py-1 backdrop-blur-sm sm:inline">Drag to pan · drag a card to move it · Ctrl + scroll to zoom</span>
      </div>

      <div
        ref={surfaceRef}
        className="h-full w-full cursor-grab touch-none select-none data-[panning=true]:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={contentRef} className="relative origin-top-left" style={{ width, height }}>
          <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={width} height={height}>
            {edges.map((edge) => {
              const active = activePath.has(edge.child.id);
              return (
                <path
                  key={edge.id}
                  ref={(el) => {
                    if (el) pathEls.current.set(edge.id, el);
                    else pathEls.current.delete(edge.id);
                  }}
                  d={edgePath(edge.parent, edge.child, committedOffset)}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth={active ? 2.25 : 1.5}
                  className={cn('transition-[stroke] duration-150', active ? 'stroke-primary' : 'stroke-border')}
                />
              );
            })}
          </svg>
          {nodes.map((node) => {
            const offset = committedOffset(node.id);
            return (
              <NodeCard
                key={node.id}
                node={node}
                labels={labels}
                selected={node.id === selectedId}
                expandable={node.children.length > 0}
                expanded={isExpanded(node)}
                dx={offset.x}
                dy={offset.y}
                registerEl={registerEl}
                onClick={() => handleCardClick(node)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
