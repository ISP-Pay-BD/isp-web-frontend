'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useNetworkDiagram } from '../hooks/useNetwork';
import type { NetworkTopologyItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Server, Network, CheckCircle2, XCircle, RefreshCw, ZoomIn, ZoomOut, Zap, Cpu, SignalHigh } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkDiagramPage() {
  const { data, isLoading, refetch } = useNetworkDiagram();
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

  // Group by PON Port -> Splitter
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
    return <PageSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Diagram & Optical Topology"
        subtitle="Live OLT → PON Port → Splitter → ONU optical signal & telemetry"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network' },
          { label: 'Diagram' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        }
      />

      {/* KPI Stats Band */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total OLTs"
          value={totalOlts}
          description="Provisioned core optical nodes"
          icon={Server}
        />
        <StatCard
          title="Total Filtered ONUs"
          value={totalOnus}
          description="Subscribers on current tree"
          icon={Network}
        />
        <StatCard
          title="Online ONUs"
          value={onlineOnus}
          description="Transmitting optical signal"
          icon={CheckCircle2}
          trend={{ value: 'Normal', positive: true }}
        />
        <StatCard
          title="Offline ONUs / Alarm"
          value={offlineOnus}
          description="LOS (Loss of Signal) or power cut"
          icon={XCircle}
          trend={{ value: `${offlineOnus} alerts`, positive: false }}
        />
      </div>

      {/* Controls / Filter Toolbar */}
      <Card className="border-border/60">
        <CardContent className="pt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-52">
              <Select value={selectedOltId} onValueChange={(val) => {
                if (!val) return;
                setSelectedOltId(val);
                setSelectedPonPort('all');
              }}>
                <SelectTrigger>
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
                <SelectTrigger>
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
            <span className="text-xs text-muted-foreground font-mono">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setZoomLevel(1)}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Interactive SVG Topology Canvas */}
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-3 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Active Optical Distribution Network (ODN) Tree
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              Healthy (&gt; -25 dBm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
              Critical / LOS
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto min-h-[480px] bg-slate-950/5 dark:bg-slate-950/40">
          <div
            className="transition-transform duration-200 origin-top-left space-y-8"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {Array.from(groupedTree.entries()).map(([ponPort, splittersMap]) => (
              <div key={ponPort} className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-6">
                {/* Port Header */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="font-mono text-xs">
                      {ponPort}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">
                      OLT Optical Transceiver (1490nm Tx / 1310nm Rx)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {Array.from(splittersMap.values()).flat().length} connected ONUs
                  </span>
                </div>

                {/* Splitters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(splittersMap.entries()).map(([splitterName, onus]) => (
                    <div key={splitterName} className="rounded-lg border bg-background/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          {splitterName}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {onus.length} drops
                        </Badge>
                      </div>

                      {/* ONUs under this splitter */}
                      <div className="space-y-2">
                        {onus.map((onu) => {
                          const isNormal = onu.status === 'online' && onu.rxPowerDbm > -27;
                          return (
                            <div
                              key={onu.onuId}
                              onClick={() => setSelectedNode(onu)}
                              className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all hover:shadow-sm ${
                                onu.status === 'online'
                                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20'
                                  : 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-foreground truncate">
                                  {onu.customerName}
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  {onu.onuId} • {onu.zone}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <div
                                    className={`font-mono font-semibold ${
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
                                    onu.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Node Detail Inspector Sheet */}
      <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedNode && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SignalHigh className="h-5 w-5 text-primary" />
                  ONU Optical Diagnostic
                </SheetTitle>
                <SheetDescription>
                  Real-time optical transceiver power level and fiber connection diagnostics
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 py-5 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Customer Name</span>
                  <span className="font-semibold text-foreground">{selectedNode.customerName}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">ONU Identifier</span>
                  <span className="font-mono font-medium">{selectedNode.onuId}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">MAC Address</span>
                  <code className="font-mono text-xs">{selectedNode.mac}</code>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Headend OLT</span>
                  <span className="font-medium">{selectedNode.oltName}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">PON Port & Splitter</span>
                  <span>{selectedNode.ponPort} / {selectedNode.splitter}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Service Zone</span>
                  <span>{selectedNode.zone}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Link State</span>
                  <StatusBadge status={selectedNode.status} />
                </div>

                <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2">
                  <div className="text-xs font-semibold text-foreground">Optical Transceiver Levels:</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Rx Optical Power (1490nm)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedNode.rxPowerDbm} dBm
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tx Optical Power (1310nm)</span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedNode.txPowerDbm} dBm
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Standard GPON threshold: -8 dBm to -27 dBm. Loss of signal (LOS) below -28 dBm.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
