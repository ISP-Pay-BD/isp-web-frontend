'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkTopology } from '../hooks/useNetwork';
import type { TopologyOnu, TopologyPort } from '../types';
import { useOltOptions, useSyncOlt } from '@/features/admin/olt/hooks/useOltDevices';
import { parseBackendDate, rxBand } from '@/features/admin/olt/types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Network, RefreshCw, ZoomIn, ZoomOut, Zap, Cpu, SignalHigh, ChevronRight, DownloadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/format/date';

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

export function NetworkDiagramPage() {
  const [selectedOltId, setSelectedOltId] = useState<string>('all');
  const [selectedPonPort, setSelectedPonPort] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<TopologyOnu | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const oltQuery = useOltOptions();
  const topoQuery = useNetworkTopology(selectedOltId, selectedPonPort);
  const sync = useSyncOlt();

  const olts = useMemo(() => oltQuery.data?.items ?? [], [oltQuery.data]);
  const selectedOlt = olts.find((o) => o.id === selectedOltId) ?? null;
  const allPorts = useMemo(() => topoQuery.data?.ponPorts ?? [], [topoQuery.data]);
  const leaves = useMemo(() => topoQuery.data?.items ?? [], [topoQuery.data]);

  const ports = useMemo(
    () => (selectedPonPort === 'all' ? allPorts : allPorts.filter((p) => p.ponPort === selectedPonPort)),
    [allPorts, selectedPonPort],
  );
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
    return map;
  }, [leaves]);

  const isRefreshing = (topoQuery.isFetching || oltQuery.isFetching) && !topoQuery.isLoading;
  const handleRefresh = () => {
    void oltQuery.refetch();
    void topoQuery.refetch();
  };

  const handleSync = () => {
    if (!selectedOlt) return;
    sync.mutate(selectedOlt.id, {
      onSuccess: (res) => toast.success(`Synchronized ${res?.synced ?? 0} ONUs from ${selectedOlt.name}.`),
    });
  };

  const focusPort = (port: TopologyPort) => {
    setSelectedOltId(port.oltId);
    setSelectedPonPort(port.ponPort);
  };

  if (topoQuery.isLoading || oltQuery.isLoading) {
    return <PageSkeleton variant="dashboard" rows={6} />;
  }
  if (topoQuery.isError || oltQuery.isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load network diagram"
          description="Could not fetch OLT topology."
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  const oltItems = [{ value: 'all', label: 'All OLT Headends' }, ...olts.map((o) => ({ value: o.id, label: `${o.name} (${o.brand})` }))];
  const portItems = [{ value: 'all', label: 'All PON Ports' }, ...portNames.map((p) => ({ value: p, label: p }))];
  const selectedLastSeen = parseBackendDate(selectedNode?.lastSeen ?? null);

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <div>
        <PageHeader
          title="Network Diagram & Optical Topology"
          subtitle="OLT → PON Port → Splitter → ONU, from the last synchronization of each OLT"
          breadcrumb={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Network' },
            { label: 'Diagram' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedOlt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={sync.isPending || !selectedOlt.syncSupported}
                  title={selectedOlt.syncSupported ? `Read every ONU from ${selectedOlt.name} now` : `No sync driver on this server for ${selectedOlt.brand}`}
                  className="gap-1.5 font-semibold shadow-sm"
                >
                  <DownloadCloud className={`h-4 w-4 ${sync.isPending ? 'animate-pulse' : ''}`} />
                  {sync.isPending ? 'Syncing… (up to a minute)' : 'Sync OLT'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5 font-semibold shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Stats Band */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{oltQuery.data?.total ?? olts.length}</span>{' '}
          <span className="text-muted-foreground">total olts</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{totalOnus}</span>{' '}
          <span className="text-muted-foreground">onus in view</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{onlineOnus}</span>{' '}
          <span className="text-muted-foreground">online onus</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{offlineOnus}</span>{' '}
          <span className="text-muted-foreground">offline onus / alarm</span>
        </p>
      </div>

      {/* Controls / Filter Toolbar */}
      <div>
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
          <CardContent className="pt-5 pb-5 px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-52">
                <Select
                  items={oltItems}
                  value={selectedOltId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setSelectedOltId(String(val));
                    setSelectedPonPort('all');
                  }}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All OLT Nodes" />
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

              <div className="w-44">
                <Select items={portItems} value={selectedPonPort} onValueChange={(v) => v && setSelectedPonPort(String(v))}>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All PON Ports" />
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md">
                {Math.round(zoomLevel * 100)}%
              </span>
              <div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shadow-sm"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shadow-sm"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium"
                  onClick={() => setZoomLevel(1)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topology tree */}
      <div>
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-4 w-4 text-primary" />
              </span>
              Optical Distribution Network (ODN) Tree
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20" />
                Online
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block ring-2 ring-red-500/20" />
                Offline / LOS
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-h-[480px] overflow-x-auto bg-muted/20 p-6">
            {topoQuery.data?.truncated && (
              <p className="mb-4 text-xs text-muted-foreground">
                Showing {leaves.length} of {topoQuery.data.total} ONUs — pick a PON port (or “Show all” on a port) to load every ONU on it.
              </p>
            )}
            <div
              className="transition-transform duration-300 origin-top-left space-y-8"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {ports.length > 0 ? (
                ports.map((port) => {
                  const splittersMap = groupedTree.get(portKey(port.oltId, port.ponPort)) ?? new Map<string, TopologyOnu[]>();
                  const loaded = Array.from(splittersMap.values()).reduce((s, list) => s + list.length, 0);
                  const isFocused = selectedOltId === port.oltId && selectedPonPort === port.ponPort;
                  return (
                    <div
                      key={portKey(port.oltId, port.ponPort)}
                      className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm space-y-6 ring-1 ring-border/60"
                    >
                      {/* Port Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="font-mono text-xs px-2.5 py-1 shadow-sm">
                            {port.ponPort}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground">{port.oltName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {loaded < port.total && !isFocused && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => focusPort(port)}>
                              Show all
                            </Button>
                          )}
                          <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md">
                            {port.online}/{port.total} online{loaded < port.total ? ` · ${loaded} shown` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Splitters Row */}
                      {splittersMap.size > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {Array.from(splittersMap.entries()).map(([splitterName, onus]) => (
                            <div
                              key={splitterName}
                              className="rounded-xl border border-border/50 bg-background/80 p-4 space-y-3 shadow-sm hover:shadow-md hover:border-primary/20 transition duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                                  </span>
                                  {splitterName}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
                                  {onus.length} drops
                                </Badge>
                              </div>

                              {/* ONUs under this splitter */}
                              <div className="space-y-2">
                                {onus.map((onu) => {
                                  const band = rxBand(onu.rxPowerDbm);
                                  const isNormal = onu.status === 'online' && band !== 'critical';
                                  return (
                                    <div
                                      key={onu.id}
                                      onClick={() => setSelectedNode(onu)}
                                      className={`group/onu flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition duration-200 ${
                                        onu.status === 'online'
                                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm'
                                          : 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40 hover:shadow-sm'
                                      }`}
                                    >
                                      <div className="min-w-0 pr-3">
                                        <div className="font-semibold text-foreground truncate group-hover/onu:text-primary transition-colors">
                                          {onu.customerName ?? <span className="italic text-muted-foreground">Unassigned</span>}
                                        </div>
                                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                                          {onu.onuId}
                                          {(onu.zone ?? onu.mac) ? ` • ${onu.zone ?? onu.mac}` : ''}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 flex-shrink-0">
                                        <div className="text-right">
                                          <div
                                            className={`font-mono font-bold text-[11px] ${
                                              isNormal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                                            }`}
                                          >
                                            {onu.rxPowerDbm !== null ? `${onu.rxPowerDbm} dBm` : '— dBm'}
                                          </div>
                                          {onu.txPowerDbm !== null && (
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                              Tx: {onu.txPowerDbm} dBm
                                            </div>
                                          )}
                                        </div>
                                        <span
                                          className={`h-2.5 w-2.5 rounded-full ${
                                            onu.status === 'online'
                                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40'
                                              : 'bg-red-500 shadow-sm shadow-red-500/40'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {port.total} ONUs on this port are not loaded in this view.
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  className="text-center py-16 text-muted-foreground"
                >
                  <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No synchronized ONUs for the current filter</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {olts.length === 0
                      ? 'Onboard an OLT first, then synchronize it.'
                      : selectedOlt
                        ? 'Use “Sync OLT” to read its ONUs.'
                        : 'Select an OLT and synchronize it to build the tree.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Node Detail Inspector Sheet */}
      <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent className="sm:max-w-md overflow-hidden p-0">
          {selectedNode && (
            <div
              className="flex flex-col h-full min-h-0"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
                <SheetHeader className="relative z-10 text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                      <SignalHigh className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <div className="font-bold">ONU Optical Diagnostic</div>
                      <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                        {selectedLastSeen ? `As of ${formatDateTime(selectedLastSeen)}` : 'From the last synchronization'}
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Connection Path Breadcrumb */}
                <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-mono bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50 shadow-xs">
                  {[selectedNode.oltName, selectedNode.ponPort, selectedNode.splitter ?? NO_SPLITTER, selectedNode.onuId].map(
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
                    <span className="text-[11px] font-bold tracking-wide text-muted-foreground">Customer</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: 'Name', value: selectedNode.customerName ?? 'Unassigned', bold: true },
                      { label: 'PPPoE ID', value: selectedNode.pppoeId ?? '—', mono: true },
                      { label: 'ONU ID', value: selectedNode.onuId, mono: true },
                      { label: 'MAC Address', value: selectedNode.mac ?? '—', code: true },
                      { label: 'Address', value: selectedNode.zone ?? '—' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        {item.code ? (
                          <code className="font-mono text-[11px] bg-muted/40 px-2 py-0.5 rounded-md border border-border/40 truncate min-w-0">{item.value}</code>
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
                    <span className="text-[11px] font-bold tracking-wide text-muted-foreground">Network</span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: 'Headend OLT', value: selectedNode.oltName },
                      { label: 'PON Port', value: selectedNode.ponPort },
                      { label: 'Splitter', value: selectedNode.splitter ?? '—' },
                      { label: 'Distance', value: selectedNode.distance !== null ? String(selectedNode.distance) : '—' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        <span className="text-xs font-mono font-semibold truncate min-w-0">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5">
                      <span className="text-xs text-muted-foreground truncate">Link State</span>
                      <div className="text-right">
                        <Badge
                          variant={selectedNode.status === 'online' ? 'default' : 'destructive'}
                          className="text-[10px] font-bold gap-1.5 capitalize px-2.5 py-1 shadow-sm"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${selectedNode.status === 'online' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                          {selectedNode.status}
                        </Badge>
                        {selectedNode.reason && (
                          <div className="mt-1 text-[10px] text-muted-foreground">{selectedNode.reason}</div>
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
                    <span className="text-[11px] font-bold tracking-wide text-muted-foreground">Optical Levels</span>
                  </div>
                  <div className="p-4 space-y-5">
                    {/* Rx Power */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <div>
                          <span className="text-xs font-semibold text-foreground">Rx Optical Power</span>
                        </div>
                        <span className={`font-mono font-bold text-sm shrink-0 ${RX_TEXT[rxBand(selectedNode.rxPowerDbm)]}`}>
                          {selectedNode.rxPowerDbm ?? '—'} <span className="text-[10px] font-bold opacity-70">dBm</span>
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
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-28)}%` }} title="-28 dBm LOS" />
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-27)}%` }} title="-27 dBm Weak" />
                            <div className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${rxPct(-25)}%` }} title="-25 dBm Good" />
                          </div>
                          <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                            <span>{RX_MIN} dBm (LOS)</span>
                            <span>{RX_MAX} dBm (Max)</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tx Power */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <span className="text-xs font-semibold text-foreground">Tx Optical Power</span>
                      <span className="font-mono font-bold text-sm text-blue-500 shrink-0">
                        {selectedNode.txPowerDbm ?? '—'} <span className="text-[10px] font-bold opacity-70">dBm</span>
                      </span>
                    </div>

                    {/* Threshold Legend */}
                    <div className="pt-3 border-t border-border/30">
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                          Good (&gt;-25)
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30" />
                          Weak (-25 to -27)
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500">
                          <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
                          Critical (&lt;-27)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
