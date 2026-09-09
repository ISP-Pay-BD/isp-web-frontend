'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkDiagram } from '../hooks/useNetwork';
import type { NetworkTopologyItem } from '@/data/admin/network-ops.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Server, Network, CheckCircle2, XCircle, RefreshCw, ZoomIn, ZoomOut, Zap, Cpu, SignalHigh, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkDiagramPage() {
  const { data, isLoading, isError, refetch } = useNetworkDiagram();
  const [selectedOltId, setSelectedOltId] = useState<string>('all');
  const [selectedPonPort, setSelectedPonPort] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<NetworkTopologyItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const topology = data?.topology ?? [];
  const olts = data?.olts ?? [];

  const filtered = useMemo(() => {
    return topology.filter((item) => {
      if (selectedOltId !== 'all' && item.oltId !== selectedOltId) return false;
      if (selectedPonPort !== 'all' && item.ponPort !== selectedPonPort) return false;
      return true;
    });
  }, [topology, selectedOltId, selectedPonPort]);

  const ponPorts = useMemo(() => {
    const set = new Set<string>();
    for (const t of topology) {
      if (selectedOltId === 'all' || t.oltId === selectedOltId) {
        set.add(t.ponPort);
      }
    }
    return Array.from(set);
  }, [topology, selectedOltId]);

  const totalOlts = olts.length;
  const totalOnus = filtered.length;
  const onlineOnus = filtered.filter((t) => t.status === 'online').length;
  const offlineOnus = totalOnus - onlineOnus;

  const groupedTree = useMemo(() => {
    const map = new Map<string, Map<string, NetworkTopologyItem[]>>();
    for (const item of filtered) {
      if (!map.has(item.ponPort)) {
        map.set(item.ponPort, new Map());
      }
      const splitters = map.get(item.ponPort)!;
      if (!splitters.has(item.splitter)) {
        splitters.set(item.splitter, []);
      }
      splitters.get(item.splitter)!.push(item);
    }
    return map;
  }, [filtered]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
        toast.success('Optical power telemetry updated from OLTs.');
      }, 500);
    });
  };

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={6} />;
  }
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load network diagram"
          description="Could not fetch OLT topology and optical telemetry."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <div>
        <PageHeader
          title="Network Diagram & Optical Topology"
          subtitle="Live OLT → PON Port → Splitter → ONU optical signal & telemetry"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Network' },
            { label: 'Diagram' },
          ]}
          actions={
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5 font-semibold shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Telemetry
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Stats Band */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{totalOlts}</span>{' '}
          <span className="text-muted-foreground">total olts</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{totalOnus}</span>{' '}
          <span className="text-muted-foreground">total filtered onus</span>
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
                  value={selectedOltId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setSelectedOltId(val);
                    setSelectedPonPort('all');
                  }}
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All OLT Nodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All OLT Headends</SelectItem>
                    {olts.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name} ({o.brand})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-44">
                <Select value={selectedPonPort} onValueChange={(v) => v && setSelectedPonPort(v)}>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="All PON Ports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All PON Ports</SelectItem>
                    {ponPorts.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
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

      {/* Visual Interactive SVG Topology Canvas */}
      <div>
        <Card className="border-border/60 shadow-sm ring-1 ring-border/60 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-4 w-4 text-primary" />
              </span>
              Active Optical Distribution Network (ODN) Tree
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20" />
                Healthy (&gt; -25 dBm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block ring-2 ring-red-500/20" />
                Critical / LOS
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-h-[480px] overflow-x-auto bg-muted/20 p-6">
            <div
              className="transition-transform duration-300 origin-top-left space-y-8"
              style={{ transform: `scale(${zoomLevel})` }}
            >
                              {Array.from(groupedTree.entries()).length > 0 ? (
                  Array.from(groupedTree.entries()).map(([ponPort, splittersMap], portIdx) => (
                    <div
                      key={ponPort}
                      className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm space-y-6 ring-1 ring-border/60"
                    >
                      {/* Port Header */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="font-mono text-xs px-2.5 py-1 shadow-sm">
                            {ponPort}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground">
                            OLT Optical Transceiver (1490nm Tx / 1310nm Rx)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md">
                          {Array.from(splittersMap.values()).flat().length} ONUs
                        </span>
                      </div>

                      {/* Splitters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from(splittersMap.entries()).map(([splitterName, onus], splitterIdx) => (
                          <div
                            key={splitterName}
                            className="rounded-xl border border-border/50 bg-background/80 p-4 space-y-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
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
                              {onus.map((onu, onuIdx) => {
                                const isNormal = onu.status === 'online' && onu.rxPowerDbm > -27;
                                return (
                                  <div
                                    key={onu.onuId}
                                    onClick={() => setSelectedNode(onu)}
                                    className={`group/onu flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                                      onu.status === 'online'
                                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm'
                                        : 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="min-w-0 pr-3">
                                      <div className="font-semibold text-foreground truncate group-hover/onu:text-primary transition-colors">
                                        {onu.customerName}
                                      </div>
                                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                        {onu.onuId} • {onu.zone}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 flex-shrink-0">
                                      <div className="text-right">
                                        <div
                                          className={`font-mono font-bold text-[11px] ${
                                            isNormal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                                          }`}
                                        >
                                          {onu.rxPowerDbm} dBm
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                          Tx: {onu.txPowerDbm} dBm
                                        </div>
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
                    </div>
                  ))
                ) : (
                  <div
                    className="text-center py-16 text-muted-foreground"
                  >
                    <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No topology data for current filter</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try selecting a different OLT or PON port.</p>
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
              {/* Header with gradient background */}
              <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
                <SheetHeader className="relative z-10 text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-base">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                      <SignalHigh className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <div className="font-bold">ONU Optical Diagnostic</div>
                      <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                        Real-time transceiver power & fiber diagnostics
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Connection Path Breadcrumb */}
                <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-mono bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50 shadow-xs">
                  {[selectedNode.oltName, selectedNode.ponPort, selectedNode.splitter, selectedNode.onuId].map(
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
                      { label: 'Name', value: selectedNode.customerName, bold: true },
                      { label: 'ONU ID', value: selectedNode.onuId, mono: true },
                      { label: 'MAC Address', value: selectedNode.mac, code: true },
                      { label: 'Service Zone', value: selectedNode.zone },
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
                      { label: 'Splitter', value: selectedNode.splitter },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        <span className="text-xs font-mono font-semibold truncate min-w-0">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 min-w-0 px-4 py-2.5">
                      <span className="text-xs text-muted-foreground truncate">Link State</span>
                      <Badge
                        variant={selectedNode.status === 'online' ? 'default' : 'destructive'}
                        className="text-[10px] font-bold gap-1.5 capitalize px-2.5 py-1 shadow-sm"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedNode.status === 'online' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                        {selectedNode.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Optical Transceiver Levels Card */}
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
                          <span className="text-[10px] text-muted-foreground ml-1.5">(1490nm)</span>
                        </div>
                        <span className={`font-mono font-bold text-sm shrink-0 ${
                          selectedNode.rxPowerDbm > -25
                            ? 'text-emerald-500'
                            : selectedNode.rxPowerDbm > -27
                              ? 'text-amber-500'
                              : 'text-red-500'
                        }`}>
                          {selectedNode.rxPowerDbm} <span className="text-[10px] font-bold opacity-70">dBm</span>
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden border border-border/30">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full ${
                            selectedNode.rxPowerDbm > -25
                              ? 'bg-emerald-500'
                              : selectedNode.rxPowerDbm > -27
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                        {/* Threshold markers */}
                        <div className="absolute inset-y-0 left-[9%] w-px bg-foreground/20" title="-28 dBm LOS" />
                        <div className="absolute inset-y-0 left-[18%] w-px bg-foreground/20" title="-27 dBm Weak" />
                        <div className="absolute inset-y-0 left-[27%] w-px bg-foreground/20" title="-25 dBm Good" />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                        <span>-30 dBm (LOS)</span>
                        <span>-8 dBm (Max)</span>
                      </div>
                    </div>

                    {/* Tx Power */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <div>
                          <span className="text-xs font-semibold text-foreground">Tx Optical Power</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">(1310nm)</span>
                        </div>
                        <span className="font-mono font-bold text-sm text-blue-500 shrink-0">
                          {selectedNode.txPowerDbm} <span className="text-[10px] font-bold opacity-70">dBm</span>
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden border border-border/30">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-sky-500" />
                      </div>
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
                          LOS (&lt;-28)
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
