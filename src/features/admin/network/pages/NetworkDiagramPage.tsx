'use client';

import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useAreaOptions } from '@/features/admin/customers/hooks/use-customers';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkTopology, useNetworkNodes } from '../hooks/useNetwork';
import { TopologyCanvas, type CanvasSelection } from '../components/TopologyCanvas';
import type { TopologyOnu, MapNode } from '../types';
import { useOltOptions, useSyncOlt } from '@/features/admin/olt/hooks/useOltDevices';
import { parseBackendDate, rxBand } from '@/features/admin/olt/types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, RefreshCw, Zap, Cpu, SignalHigh, ChevronRight, GitFork, MapIcon, Server, CheckCircle2, XCircle, Clock, Search, X, GitBranch, Router } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/format/date';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import Link from 'next/link';

// leaflet is browser-only (touches window/document): load the shared map on the client only.
const GeoMap = dynamic(() => import('@/components/shared/GeoMap').then((m) => m.GeoMap), {
  ssr: false,
  loading: () => <div className="h-[480px] animate-pulse rounded-xl bg-muted/60" />,
});

const isPlaced = (n: MapNode) => n.latitude !== null && n.longitude !== null;

const NO_SPLITTER = 'No splitter assigned';

/** Rx bar scale (dBm): LOS floor → strongest expected level. */
const RX_MIN = -30;
const RX_MAX = -8;
const rxPct = (dbm: number) => Math.min(100, Math.max(0, ((dbm - RX_MIN) / (RX_MAX - RX_MIN)) * 100));

const RX_TEXT: Record<ReturnType<typeof rxBand>, string> = {
  good: 'text-emerald-500',
  weak: 'text-amber-500',
  critical: 'text-red-500',
  unknown: 'text-muted-foreground',
};
const RX_BAR: Record<ReturnType<typeof rxBand>, string> = {
  good: 'bg-emerald-500',
  weak: 'bg-amber-500',
  critical: 'bg-red-500',
  unknown: 'bg-muted-foreground/40',
};

const portKey = (oltId: string, ponPort: string) => `${oltId}|${ponPort}`;

/** Legacy "Splitter Layout" picker: keep the DB splitters, or auto-group each port's ONUs into 1×N splitters by ONU index. */
const SPLITTER_LAYOUTS = ['direct', '1x2', '1x4', '1x8', '1x16'] as const;
type SplitterLayout = (typeof SPLITTER_LAYOUTS)[number];
const onuIndex = (onu: TopologyOnu) => Number.parseInt(onu.onuId.replace(/\D/g, ''), 10) || 1;

/** Same rule as the web's renderTopology(): ONU n goes to Splitter-ceil(n / N). */
function regroupSplitters(onus: TopologyOnu[], layout: Exclude<SplitterLayout, 'direct'>): Map<string, TopologyOnu[]> {
  const size = Number(layout.split('x')[1]);
  const groups = new Map<string, TopologyOnu[]>();
  for (const onu of [...onus].sort((a, b) => onuIndex(a) - onuIndex(b))) {
    const name = `Splitter-${String(Math.ceil(onuIndex(onu) / size)).padStart(2, '0')} (${layout})`;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(onu);
  }
  return groups;
}

/** Auto Refresh re-syncs the selected OLT on this cadence, like the web (60 s). */
const AUTO_REFRESH_MS = 60_000;

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Inspector for OLT / PON port / splitter cards — counts and the online ratio, like the web page's sidebar. */
function GroupDetails({ selection }: { selection: Exclude<CanvasSelection, { kind: 'onu' }> }) {
  const t = useTranslations();
  const total = selection.online + selection.offline;
  const pct = total > 0 ? Math.round((selection.online / total) * 100) : 0;
  const kindLabel =
    selection.kind === 'olt'
      ? t('admin.network.diagram.cardOlt', 'OLT')
      : selection.kind === 'port'
        ? t('admin.network.diagram.ponInterface', 'PON Interface')
        : t('admin.network.diagram.splitter', 'Splitter');
  const childLabel =
    selection.kind === 'olt'
      ? t('admin.network.diagram.cardPonPorts', 'PON Ports')
      : selection.kind === 'port'
        ? t('admin.network.diagram.cardOnus', 'ONUs')
        : t('admin.network.diagram.cardUsers', 'Users');
  const Icon = selection.kind === 'olt' ? Router : selection.kind === 'port' ? GitBranch : Zap;
  const rows: { label: string; value: string; tone?: string }[] = [
    ...(selection.parentTitle ? [{ label: t('admin.network.diagram.under', 'Under'), value: selection.parentTitle }] : []),
    { label: childLabel, value: formatCount(selection.childCount) },
    { label: t('status.online', 'Online'), value: formatCount(selection.online), tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('status.offline', 'Offline'), value: formatCount(selection.offline), tone: 'text-red-500' },
    { label: t('admin.network.diagram.onlineRatio', 'Online ratio'), value: `${pct}%` },
  ];
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-5 py-4 pr-12">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{selection.title}</p>
          <p className="text-xs text-muted-foreground">{kindLabel}</p>
        </div>
      </div>
      <div className="divide-y divide-border/30 overflow-y-auto">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className={`truncate font-mono text-xs font-semibold ${row.tone ?? 'text-foreground'}`}>{row.value}</span>
          </div>
        ))}
        <div className="space-y-1.5 px-5 py-4">
          <p className="text-xs text-muted-foreground">{t('admin.network.diagram.health', 'Network health')}</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NetworkDiagramPage() {
  const t = useTranslations();
  const splitterLabel = (name: string) => (name === NO_SPLITTER ? t('admin.network.diagram.noSplitter', 'No splitter assigned') : name);
  const statusText = (status: string) => t(`status.${status.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, status);
  const [selectedOltId, setSelectedOltId] = useState<string>('all');
  const [selectedPonPort, setSelectedPonPort] = useState<string>('all');
  const [selection, setSelection] = useState<CanvasSelection | null>(null);
  const selectedNode: TopologyOnu | null = selection?.kind === 'onu' ? selection.onu : null;
  const [viewMode, setViewMode] = useState<'diagram' | 'map'>('diagram');
  const [zone, setZone] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput);
  const [splitterLayout, setSplitterLayout] = useState<SplitterLayout>('direct');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const oltQuery = useOltOptions();
  const areasQuery = useAreaOptions();
  const topoQuery = useNetworkTopology(selectedOltId, selectedPonPort, zone, search);
  const sync = useSyncOlt();
  const nodesQuery = useNetworkNodes({ enabled: viewMode === 'map' });
  const mapNodes = useMemo(() => (nodesQuery.data?.nodes ?? []).filter(isPlaced), [nodesQuery.data]);
  const mapNodesById = useMemo(() => new Map(mapNodes.map((n) => [n.id, n])), [mapNodes]);
  const mapMarkers = useMemo(
    () =>
      mapNodes.map((n) => ({
        id: n.id,
        latitude: n.latitude as number,
        longitude: n.longitude as number,
        color: n.color ?? '#e85a1a',
        label: n.label,
      })),
    [mapNodes],
  );
  // Parent→child wiring edges, same idea as the dedicated Network Map page.
  const mapLines = useMemo(
    () =>
      mapNodes
        .filter((n) => n.parentId && mapNodesById.has(n.parentId))
        .map((n) => {
          const parent = mapNodesById.get(n.parentId as string)!;
          return {
            id: `${parent.id}-${n.id}`,
            from: [parent.latitude as number, parent.longitude as number] as [number, number],
            to: [n.latitude as number, n.longitude as number] as [number, number],
            color: n.color ?? '#e85a1a',
          };
        }),
    [mapNodes, mapNodesById],
  );

  const olts = useMemo(() => oltQuery.data?.items ?? [], [oltQuery.data]);
  const selectedOlt = olts.find((o) => o.id === selectedOltId) ?? null;
  const allPorts = useMemo(() => topoQuery.data?.ponPorts ?? [], [topoQuery.data]);
  const leaves = useMemo(() => topoQuery.data?.items ?? [], [topoQuery.data]);

  const isFiltered = zone !== 'all' || search.trim() !== '';
  const ports = useMemo(() => {
    const byPort = selectedPonPort === 'all' ? allPorts : allPorts.filter((p) => p.ponPort === selectedPonPort);
    if (!isFiltered) return byPort;
    // Zone/search narrow the ONU leaves server-side; drop ports left with none.
    const hit = new Set(leaves.map((l) => portKey(l.oltId, l.ponPort)));
    return byPort.filter((p) => hit.has(portKey(p.oltId, p.ponPort)));
  }, [allPorts, selectedPonPort, isFiltered, leaves]);
  const portNames = useMemo(() => Array.from(new Set(allPorts.map((p) => p.ponPort))), [allPorts]);

  const totalOnus = ports.reduce((s, p) => s + p.total, 0);
  const onlineOnus = ports.reduce((s, p) => s + p.online, 0);
  const offlineOnus = totalOnus - onlineOnus;

  /** port → splitter → loaded ONU leaves. */
  const groupedTree = useMemo(() => {
    const map = new Map<string, Map<string, TopologyOnu[]>>();
    for (const item of leaves) {
      const key = portKey(item.oltId, item.ponPort);
      if (!map.has(key)) map.set(key, new Map());
      const splitters = map.get(key)!;
      const splitter = item.splitter ?? NO_SPLITTER;
      if (!splitters.has(splitter)) splitters.set(splitter, []);
      splitters.get(splitter)!.push(item);
    }
    if (splitterLayout === 'direct') return map;
    for (const [key, splitters] of map) {
      map.set(key, regroupSplitters(Array.from(splitters.values()).flat(), splitterLayout));
    }
    return map;
  }, [leaves, splitterLayout]);

  const isRefreshing = (topoQuery.isFetching || oltQuery.isFetching) && !topoQuery.isLoading;
  const handleRefresh = () => {
    void oltQuery.refetch();
    void topoQuery.refetch();
  };

  // "Refresh Sync": pull fresh ONUs from the selected OLT; with "All OLTs" there's nothing to sync, so just reload.
  const canSync = Boolean(selectedOlt?.syncSupported);
  const handleSync = (quiet = false) => {
    if (!selectedOlt || !canSync) {
      handleRefresh();
      return;
    }
    sync.mutate(selectedOlt.id, {
      onSuccess: (res) => {
        if (!quiet) {
          toast.success(t('admin.network.diagram.synced', 'Synchronized {n} ONUs from {olt}.', { n: formatCount(res?.synced ?? 0), olt: selectedOlt.name }));
        }
      },
    });
  };

  // Auto Refresh: sync once on enable, then every 60 s until toggled off or the page closes.
  const syncRef = useRef(handleSync);
  useEffect(() => {
    syncRef.current = handleSync;
  });
  useEffect(() => {
    if (!autoRefresh) return;
    syncRef.current(true);
    const id = setInterval(() => syncRef.current(true), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, selectedOltId]);

  if (topoQuery.isLoading || oltQuery.isLoading) {
    return <PageSkeleton variant="dashboard" rows={6} />;
  }
  if (topoQuery.isError || oltQuery.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('admin.network.diagram.loadFailed', 'Failed to load network diagram')}
          description={t('admin.network.diagram.loadFailedDesc', 'Could not fetch OLT topology.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={handleRefresh}
        />
      </div>
    );
  }

  const canvasLabels = {
    onu: 'ONU',
    direct: t('admin.network.diagram.directConn', 'Direct Port Connection'),
    online: t('status.online', 'Online'),
    offline: t('status.offline', 'Offline'),
    olt: t('admin.network.diagram.cardOlt', 'OLT'),
    port: t('admin.network.diagram.cardPort', 'Port'),
    splitter: t('admin.network.diagram.splitter', 'Splitter'),
    ponPorts: t('admin.network.diagram.cardPonPorts', 'PON Ports'),
    onus: t('admin.network.diagram.cardOnus', 'ONUs'),
    users: t('admin.network.diagram.cardUsers', 'Users'),
    rx: 'Rx',
  };
  const oltItems = [{ value: 'all', label: t('admin.network.diagram.allOlts', 'All OLT Headends') }, ...olts.map((o) => ({ value: o.id, label: `${o.name} (${o.brand})` }))];
  const portItems = [{ value: 'all', label: t('admin.network.diagram.allPorts', 'All PON Ports') }, ...portNames.map((p) => ({ value: p, label: p }))];
  const zoneItems = [
    { value: 'all', label: t('admin.network.diagram.allZones', 'All Zones') },
    ...(areasQuery.data ?? []).map((a) => ({ value: a.id, label: a.name })),
  ];
  const layoutItems = SPLITTER_LAYOUTS.map((l) => ({
    value: l,
    label: l === 'direct' ? t('admin.network.diagram.layoutDirect', 'Direct / Custom DB') : t('admin.network.diagram.layoutAuto', 'Auto {n} Splitters', { n: l }),
  }));
  const selectedLastSeen = parseBackendDate(selectedNode?.lastSeen ?? null);

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <div>
        <PageHeader
          title={t('admin.network.diagram.title', 'Network Diagram & Optical Topology')}
          subtitle={t('admin.network.diagram.subtitle', 'OLT → PON Port → Splitter → ONU, from the last synchronization of each OLT')}
          breadcrumb={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Network' },
            { label: t('admin.network.diagram.crumb', 'Diagram') },
          ]}
        />
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Server className="h-5 w-5 text-blue-500" />}
          tone="bg-blue-500/10"
          label={t('admin.network.diagram.kpiOlts', 'Total OLT')}
          value={formatCount(oltQuery.data?.total ?? olts.length)}
        />
        <StatCard
          icon={<Network className="h-5 w-5 text-violet-500" />}
          tone="bg-violet-500/10"
          label={t('admin.network.diagram.kpiOnus', 'Total ONU')}
          value={formatCount(totalOnus)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          tone="bg-emerald-500/10"
          label={t('admin.network.diagram.kpiOnline', 'Online ONU')}
          value={formatCount(onlineOnus)}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          tone="bg-red-500/10"
          label={t('admin.network.diagram.kpiOffline', 'Offline ONU')}
          value={formatCount(offlineOnus)}
        />
      </div>

      {/* Controls / Filter Toolbar — same fields as the web page: OLT, PON, Zone, Splitter Layout, Search, Sync, Auto Refresh, view. */}
      <div>
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">OLT</span>
                <Select
                  items={oltItems}
                  value={selectedOltId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setSelectedOltId(String(val));
                    setSelectedPonPort('all');
                  }}
                >
                  <SelectTrigger className="w-full shadow-sm">
                    <SelectValue placeholder={t('admin.network.diagram.allOltNodes', 'All OLT Nodes')} />
                  </SelectTrigger>
                  <SelectContent>
                    {oltItems.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.network.diagram.ponPort', 'PON Port')}</span>
                <Select items={portItems} value={selectedPonPort} onValueChange={(v) => v && setSelectedPonPort(String(v))}>
                  <SelectTrigger className="w-full shadow-sm">
                    <SelectValue placeholder={t('admin.network.diagram.allPorts', 'All PON Ports')} />
                  </SelectTrigger>
                  <SelectContent>
                    {portItems.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.network.diagram.zone', 'Zone')}</span>
                <Select items={zoneItems} value={zone} onValueChange={(v) => v && setZone(String(v))}>
                  <SelectTrigger className="w-full shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneItems.map((z) => (
                      <SelectItem key={z.value} value={z.value}>
                        {z.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.network.diagram.splitterLayout', 'Splitter Layout')}</span>
                <Select items={layoutItems} value={splitterLayout} onValueChange={(v) => v && setSplitterLayout(v as SplitterLayout)}>
                  <SelectTrigger className="w-full shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutItems.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.network.diagram.searchOnu', 'Search ONU')}</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('admin.network.diagram.searchPlaceholder', 'MAC, name, PPPoE…')}
                    aria-label={t('admin.network.diagram.searchOnu', 'Search ONU')}
                    className="pl-8 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
                <Button
                  size="sm"
                  onClick={() => handleSync()}
                  disabled={sync.isPending || isRefreshing}
                  title={
                    selectedOlt && !canSync
                      ? t('admin.network.diagram.syncUnsupported', 'No sync driver on this server for {brand}', { brand: selectedOlt.brand })
                      : undefined
                  }
                  className="gap-1.5 font-semibold"
                >
                  <RefreshCw className={`h-4 w-4 ${sync.isPending || isRefreshing ? 'animate-spin' : ''}`} />
                  {sync.isPending ? t('admin.network.diagram.syncing', 'Syncing…') : t('admin.network.diagram.refreshSync', 'Refresh Sync')}
                </Button>
                <Button
                  size="sm"
                  variant={autoRefresh ? 'secondary' : 'outline'}
                  onClick={() => setAutoRefresh((v) => !v)}
                  aria-pressed={autoRefresh}
                  className={`gap-1.5 font-semibold ${autoRefresh ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                  <Clock className="h-4 w-4" />
                  {autoRefresh ? t('admin.network.diagram.autoOn', 'Auto: ON') : t('admin.network.diagram.autoRefresh', 'Auto Refresh')}
                </Button>
                <div className="flex items-center rounded-lg border border-border/60 p-0.5 shadow-sm">
                  <Button
                    variant={viewMode === 'diagram' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs font-medium"
                    onClick={() => setViewMode('diagram')}
                  >
                    <GitFork className="h-3.5 w-3.5" /> {t('admin.network.diagram.viewDiagram', 'Diagram')}
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs font-medium"
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon className="h-3.5 w-3.5" /> {t('admin.network.diagram.viewMap', 'Map View')}
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Map view: real OLT/ONU coordinates from /v1/network/nodes — see Network Map for the full filterable version. */}
      {viewMode === 'map' && (
        <div>
          <Card className="border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <MapIcon className="h-4 w-4 text-primary" />
                </span>
                {t('admin.network.diagram.mapTitle', 'Node Locations')}
              </CardTitle>
              <Link href="/admin/network/map" className="text-xs font-medium text-primary hover:underline">
                {t('admin.network.diagram.openFullMap', 'Open full Network Map →')}
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {nodesQuery.isLoading ? (
                <div className="h-[480px] animate-pulse bg-muted/40" />
              ) : nodesQuery.isError ? (
                <EmptyState variant="error"
                  title={t('admin.network.diagram.mapLoadFailed', 'Could not load node locations')}
                  actionLabel={t('common.retry', 'Retry')}
                  onAction={() => nodesQuery.refetch()}
                />
              ) : (
                <GeoMap
                  markers={mapMarkers}
                  lines={mapLines}
                  height={480}
                  className="rounded-none border-0"
                  emptyMessage={t('admin.network.diagram.mapEmpty', 'None of these nodes have coordinates yet.')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Topology tree */}
      {viewMode === 'diagram' && (
      <div className={`grid gap-4 ${selection ? 'xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start' : ''}`}>
        <Card className="min-w-0 border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-4 w-4 text-primary" />
              </span>
              {t('admin.network.diagram.odnTitle', 'Optical Distribution Network (ODN) Tree')}
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20" />
                {t('status.online', 'Online')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block ring-2 ring-red-500/20" />
                {t('admin.network.diagram.offlineLos', 'Offline / LOS')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topoQuery.data?.truncated && (
              <p className="px-6 pt-4 text-xs text-muted-foreground">
                {t('admin.network.diagram.truncated', 'Showing {shown} of {total} ONUs — pick a PON port (or “Show all” on a port) to load every ONU on it.', {
                  shown: formatCount(leaves.length),
                  total: formatCount(topoQuery.data.total),
                })}
              </p>
            )}
            <TopologyCanvas
              ports={ports}
              groupedTree={groupedTree}
              portKey={portKey}
              selectedId={selection?.id ?? null}
              onSelect={setSelection}
              expandAll={isFiltered}
              labels={canvasLabels}
              emptyLabel={
                olts.length === 0
                  ? t('admin.network.diagram.emptyNoOlt', 'Onboard an OLT first, then synchronize it.')
                  : selectedOlt
                    ? t('admin.network.diagram.emptySync', 'Use “Sync OLT” to read its ONUs.')
                    : t('admin.network.diagram.emptySelect', 'Select an OLT and synchronize it to build the tree.')
              }
            />
          </CardContent>
        </Card>
        {selection && (
          <aside
            aria-live="polite"
            className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/60 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)]"
          >
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={t('common.close', 'Close')}
              className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <X className="h-4 w-4" />
            </button>
            {selection.kind === 'onu' ? (
              <>
                {selectedNode && (
            <div
              className="flex flex-col h-full min-h-0"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-2.5 text-base pr-8">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                      <SignalHigh className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <div className="font-bold">{t('admin.network.diagram.diagTitle', 'ONU Optical Diagnostic')}</div>
                      <div className="text-xs font-normal text-muted-foreground mt-0.5">
                        {selectedLastSeen
                          ? t('admin.network.diagram.asOf', 'As of {date}', { date: formatDateTime(selectedLastSeen) })
                          : t('admin.network.diagram.lastSync', 'From the last synchronization')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Path Breadcrumb */}
                <div className="relative z-10 mt-4 flex items-center gap-1 text-xs font-mono bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50 shadow-xs">
                  {[selectedNode.oltName, selectedNode.ponPort, splitterLabel(selectedNode.splitter ?? NO_SPLITTER), selectedNode.onuId].map(
                    (part, i, arr) => (
                      <span key={i} className="flex items-center gap-1 min-w-0">
                        <span className={`truncate ${i === arr.length - 1 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {part}
                        </span>
                        {i < arr.length - 1 && (
                          <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-40" />
                        )}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-6 py-5 space-y-5">
                {/* Customer Info Card */}
                <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/20 border-b border-border/40 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <span className="text-xs font-bold tracking-wide text-muted-foreground">{t('admin.network.diagram.customer', 'Customer')}</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: t('admin.network.diagram.name', 'Name'), value: selectedNode.customerName ?? t('admin.network.diagram.unassigned', 'Unassigned'), bold: true },
                      { label: 'PPPoE ID', value: selectedNode.pppoeId ?? '—', mono: true },
                      { label: 'ONU ID', value: selectedNode.onuId, mono: true },
                      { label: t('admin.network.diagram.mac', 'MAC Address'), value: selectedNode.mac ?? '—', code: true },
                      { label: t('admin.network.diagram.address', 'Address'), value: selectedNode.zone ?? '—' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        {item.code ? (
                          <code className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded-md border border-border/40 truncate min-w-0">{item.value}</code>
                        ) : (
                          <span className={`text-xs truncate min-w-0 ${item.bold ? 'font-bold text-foreground' : item.mono ? 'font-mono font-semibold' : 'font-medium text-foreground'}`}>
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network Info Card */}
                <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/20 border-b border-border/40 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <Network className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-muted-foreground">{t('admin.network.diagram.network', 'Network')}</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: t('admin.network.diagram.headend', 'Headend OLT'), value: selectedNode.oltName },
                      { label: 'PON Port', value: selectedNode.ponPort },
                      { label: t('admin.network.diagram.splitter', 'Splitter'), value: selectedNode.splitter ?? '—' },
                      { label: t('admin.network.diagram.distance', 'Distance'), value: selectedNode.distance !== null ? String(selectedNode.distance) : '—' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        <span className="text-xs font-mono font-semibold truncate min-w-0">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5">
                      <span className="text-xs text-muted-foreground truncate">{t('admin.network.diagram.linkState', 'Link State')}</span>
                      <div className="text-right">
                        <Badge
                          variant={selectedNode.status === 'online' ? 'default' : 'destructive'}
                          className="text-xs font-bold gap-1.5 capitalize px-2.5 py-1 shadow-sm"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${selectedNode.status === 'online' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                          {statusText(selectedNode.status)}
                        </Badge>
                        {selectedNode.reason && (
                          <div className="mt-1 text-xs text-muted-foreground">{selectedNode.reason}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optical Levels Card */}
                <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/20 border-b border-border/40 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-muted-foreground">{t('admin.network.diagram.optical', 'Optical Levels')}</span>
                  </div>
                  <div className="p-4 space-y-5">
                    {/* Rx Power */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <div>
                          <span className="text-xs font-semibold text-foreground">{t('admin.network.diagram.rxPower', 'Rx Optical Power')}</span>
                        </div>
                        <span className={`font-mono font-bold text-sm shrink-0 ${RX_TEXT[rxBand(selectedNode.rxPowerDbm)]}`}>
                          {selectedNode.rxPowerDbm ?? '—'} <span className="text-xs font-bold opacity-70">dBm</span>
                        </span>
                      </div>
                      {selectedNode.rxPowerDbm !== null && (
                        <>
                          <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden border border-border/30">
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full ${RX_BAR[rxBand(selectedNode.rxPowerDbm)]}`}
                              style={{ width: `${rxPct(selectedNode.rxPowerDbm)}%` }}
                            />
                            {/* Threshold markers */}
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-28)}%` }} title={t('admin.network.diagram.markerLos', '-28 dBm LOS')} />
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-27)}%` }} title={t('admin.network.diagram.markerWeak', '-27 dBm Weak')} />
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-25)}%` }} title={t('admin.network.diagram.markerGood', '-25 dBm Good')} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground/50 font-mono">
                            <span>{RX_MIN} dBm (LOS)</span>
                            <span>{t('admin.network.diagram.maxLabel', '{value} dBm (Max)', { value: RX_MAX })}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tx Power */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <span className="text-xs font-semibold text-foreground">{t('admin.network.diagram.txPower', 'Tx Optical Power')}</span>
                      <span className="font-mono font-bold text-sm text-blue-500 shrink-0">
                        {selectedNode.txPowerDbm ?? '—'} <span className="text-xs font-bold opacity-70">dBm</span>
                      </span>
                    </div>

                    {/* Threshold Legend */}
                    <div className="pt-3 border-t border-border/30">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                          {t('admin.network.diagram.legendGood', 'Good (>-25)')}
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30" />
                          {t('admin.network.diagram.legendWeak', 'Weak (-25 to -27)')}
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500">
                          <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
                          {t('admin.network.diagram.legendCritical', 'Critical (<-27)')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
              </>
            ) : (
              <GroupDetails selection={selection} />
            )}
          </aside>
        )}
      </div>
      )}

    </div>
  );
}
