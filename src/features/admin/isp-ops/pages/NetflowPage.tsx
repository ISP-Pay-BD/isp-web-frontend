'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Layers,
  Network,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Wifi,
  X,
  Zap,
  Check,
  Copy,
  SlidersHorizontal,
  Globe,
  HardDrive,
  Cpu,
  Flame,
  Clock,
  Eye,
  MoreVertical,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { NetflowTalker } from '@/data/admin/isp-ops.data';

type SortOption = 'rx' | 'tx' | 'total' | 'rate' | 'packets';
type FilterCategory = 'all' | 'bursting' | 'streaming' | 'gaming' | 'enterprise' | 'heavy';

export function NetflowPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  // State management
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedRouter, setSelectedRouter] = useState<string>('all');
  const [timeWindow, setTimeWindow] = useState<string>('live');
  const [sortBy, setSortBy] = useState<SortOption>('rx');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [liveJitter, setLiveJitter] = useState(0);
  const [selectedTalker, setSelectedTalker] = useState<NetflowTalker | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Live stream pulse simulator (fluctuates live Mbps subtly without jarring re-renders)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const timer = setInterval(() => {
      setLiveJitter((prev) => (prev + 1) % 1000);
    }, 3000);
    return () => clearInterval(timer);
  }, [isLiveStreaming]);

  const rawRows: NetflowTalker[] = useMemo(() => {
    return data?.netflowTopTalkers ?? [];
  }, [data?.netflowTopTalkers]);

  // Aggregate telemetry metrics
  const totalRxGb = useMemo(() => rawRows.reduce((s, r) => s + r.rxGb, 0), [rawRows]);
  const totalTxGb = useMemo(() => rawRows.reduce((s, r) => s + r.txGb, 0), [rawRows]);
  const burstingCount = useMemo(() => rawRows.filter((r) => r.status === 'bursting').length, [rawRows]);
  
  const currentTotalRxMbps = useMemo(
    () => rawRows.reduce((s, r) => s + (r.currentRxMbps ?? (r.rxGb * 0.8)), 0),
    [rawRows]
  );
  const currentTotalTxMbps = useMemo(
    () => rawRows.reduce((s, r) => s + (r.currentTxMbps ?? (r.txGb * 0.4)), 0),
    [rawRows]
  );
  const totalPacketsPerSec = useMemo(
    () => rawRows.reduce((s, r) => s + (r.packetsPerSec ?? 3500), 0),
    [rawRows]
  );

  const maxRx = useMemo(() => (rawRows.length ? Math.max(...rawRows.map((r) => r.rxGb)) : 1), [rawRows]);
  const maxTx = useMemo(() => (rawRows.length ? Math.max(...rawRows.map((r) => r.txGb)) : 1), [rawRows]);

  // Unique routers list
  const routerOptions = useMemo(() => {
    const list = Array.from(new Set(rawRows.map((r) => r.router).filter(Boolean))) as string[];
    return list;
  }, [rawRows]);

  // Filtered and sorted records
  const filteredRows = useMemo(() => {
    return rawRows
      .filter((r) => {
        // Search filter
        if (search) {
          const q = search.toLowerCase().trim();
          const match =
            r.username.toLowerCase().includes(q) ||
            (r.customerName && r.customerName.toLowerCase().includes(q)) ||
            r.ip.toLowerCase().includes(q) ||
            (r.mac && r.mac.toLowerCase().includes(q)) ||
            r.apps.toLowerCase().includes(q) ||
            (r.router && r.router.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Router filter
        if (selectedRouter !== 'all' && r.router !== selectedRouter) {
          return false;
        }

        // Category filter
        if (selectedCategory === 'bursting') {
          return r.status === 'bursting';
        }
        if (selectedCategory === 'streaming') {
          return r.apps.toLowerCase().includes('youtube') || r.apps.toLowerCase().includes('netflix') || r.apps.toLowerCase().includes('tiktok');
        }
        if (selectedCategory === 'gaming') {
          return r.apps.toLowerCase().includes('game') || r.apps.toLowerCase().includes('steam') || r.apps.toLowerCase().includes('valorant');
        }
        if (selectedCategory === 'enterprise') {
          return r.username.startsWith('corp.') || r.apps.toLowerCase().includes('zoom') || r.apps.toLowerCase().includes('vpn') || r.apps.toLowerCase().includes('aws');
        }
        if (selectedCategory === 'heavy') {
          return r.rxGb >= 80;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rx') return b.rxGb - a.rxGb;
        if (sortBy === 'tx') return b.txGb - a.txGb;
        if (sortBy === 'total') return (b.rxGb + b.txGb) - (a.rxGb + a.txGb);
        if (sortBy === 'rate') return (b.currentRxMbps ?? 0) - (a.currentRxMbps ?? 0);
        if (sortBy === 'packets') return (b.packetsPerSec ?? 0) - (a.packetsPerSec ?? 0);
        return 0;
      });
  }, [rawRows, search, selectedCategory, selectedRouter, sortBy]);

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`IP copied: ${ip}`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Subscriber / Host',
      'Username',
      'IP Address',
      'MAC Address',
      'Assigned Router',
      'Interface',
      'Download (GB)',
      'Upload (GB)',
      'Live Rx (Mbps)',
      'Live Tx (Mbps)',
      'Packets/s',
      'Active Flows',
      'Applications',
      'Status',
    ];
    const rows = filteredRows.map((r) => [
      `"${(r.customerName ?? r.username).replace(/"/g, '""')}"`,
      r.username,
      r.ip,
      r.mac ?? '—',
      r.router ?? 'Core-Router',
      r.interfaceName ?? 'vlan100',
      r.rxGb,
      r.txGb,
      r.currentRxMbps ?? (r.rxGb * 0.8).toFixed(1),
      r.currentTxMbps ?? (r.txGb * 0.4).toFixed(1),
      r.packetsPerSec ?? 3500,
      r.activeFlows ?? 120,
      `"${r.apps.replace(/"/g, '""')}"`,
      r.status ?? 'active',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `netflow_top_talkers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRows.length} NetFlow flow telemetry records to CSV`);
  };

  const handleApplyRateLimit = (username: string) => {
    toast.success(`Applied 10 Mbps QoS bandwidth cap to ${username} via CoA`);
  };

  const handleSendCoa = (username: string) => {
    toast.info(`RADIUS CoA session re-authorization sent for ${username}`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load NetFlow telemetry"
        description="Could not establish connection with IPFIX / NetFlow collector daemon."
        actionLabel="Reconnect Collector"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Top Header */}
      <PageHeader
        title="NetFlow Top Talkers"
        subtitle="Real-time IPFIX flow collector, high-bandwidth subscriber analysis, and network protocol breakdown."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Network' },
          { label: 'NetFlow Top Talkers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Live Streaming Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLiveStreaming((prev) => !prev);
                toast(isLiveStreaming ? 'Live telemetry stream paused' : 'Live telemetry stream resumed');
              }}
              className={cn(
                'text-xs h-8 gap-2 border-border/80 transition-all',
                isLiveStreaming
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              <span className="relative flex h-2 w-2">
                {isLiveStreaming && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    isLiveStreaming ? 'bg-emerald-500' : 'bg-slate-400'
                  )}
                />
              </span>
              {isLiveStreaming ? 'Live Telemetry' : 'Stream Paused'}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Polled latest flow buffers from edge gateways');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Poll Buffers
            </Button>

            {/* Export CSV */}
            <Button
              size="sm"
              onClick={handleExportCsv}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export NetFlow CSV
            </Button>
          </div>
        }
      />

      {/* KPI Telemetry Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monitored Talkers */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Flow Sessions
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rawRows.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">talkers monitored</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500">
              <Flame className="h-3 w-3 mr-0.5 inline" /> {burstingCount} bursting
            </span>
            <span>· 100% gateway flow capture</span>
          </div>
        </Card>

        {/* Aggregate Downlink */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aggregated Downlink (Rx)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalRxGb.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground font-medium">GB volume</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-emerald-500 font-semibold tabular-nums">
              ~{(currentTotalRxMbps / 1000).toFixed(2)} Gbps
            </span>
            <span>live ingress stream</span>
          </div>
        </Card>

        {/* Aggregate Uplink */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aggregated Uplink (Tx)
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {totalTxGb.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground font-medium">GB volume</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-sky-500 font-semibold tabular-nums">
              ~{currentTotalTxMbps.toFixed(1)} Mbps
            </span>
            <span>live egress stream</span>
          </div>
        </Card>

        {/* Packet Velocity */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Flow Packet Velocity
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {(totalPacketsPerSec / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-muted-foreground font-medium">pkts / sec</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-foreground/80 font-mono text-[10px]">
              TCP: 88% · UDP: 12%
            </span>
            <span className="text-xs text-amber-500/90 font-medium">Jitter: &lt;1.2ms</span>
          </div>
        </Card>
      </div>

      {/* Protocol & Application Distribution Banner */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Network Protocol & Application Mix
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/80">
                Layer 7 DPI
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Total Analyzed: <strong className="text-foreground">{(totalRxGb + totalTxGb).toFixed(1)} GB</strong> across all gateway interfaces
            </span>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted/40 p-0.5 gap-0.5">
            <div
              className="h-full rounded-l-full bg-red-500 transition-all duration-500"
              style={{ width: '42%' }}
              title="Streaming & Video: 42%"
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: '28%' }}
              title="HTTPS Web & CDN: 28%"
            />
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: '15%' }}
              title="Gaming & Real-time: 15%"
            />
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: '10%' }}
              title="Enterprise SaaS & VPN: 10%"
            />
            <div
              className="h-full rounded-r-full bg-amber-500 transition-all duration-500"
              style={{ width: '5%' }}
              title="P2P & Other: 5%"
            />
          </div>

          {/* Legend Items */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span className="truncate">Streaming (42%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">HTTPS / CDN (28%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Gaming / UDP (15%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
              <span className="truncate">Enterprise SaaS (10%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate">P2P & Torrents (5%)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter & Search Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by username, subscriber name, IP, MAC or app..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Selects: Router, Window, Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Router Selector */}
              <Select value={selectedRouter} onValueChange={(v) => setSelectedRouter(v || 'all')}>
                <SelectTrigger className="h-9 text-xs w-[170px] bg-background border-border/60">
                  <Server className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Routers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  {routerOptions.map((rtr) => (
                    <SelectItem key={rtr} value={rtr}>
                      {rtr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Time Window */}
              <Select value={timeWindow} onValueChange={(v) => setTimeWindow(v || 'live')}>
                <SelectTrigger className="h-9 text-xs w-[140px] bg-background border-border/60">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Time Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live Buffer</SelectItem>
                  <SelectItem value="1h">Last 1 Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Today (24h)</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v) => setSortBy((v as SortOption) || 'rx')}>
                <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                  <Sliders className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rx">Sort: Download (Rx)</SelectItem>
                  <SelectItem value="tx">Sort: Upload (Tx)</SelectItem>
                  <SelectItem value="total">Sort: Total Bandwidth</SelectItem>
                  <SelectItem value="rate">Sort: Live Mbps Rate</SelectItem>
                  <SelectItem value="packets">Sort: Packet Velocity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
              Filter:
            </span>

            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                selectedCategory === 'all' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              All Talkers ({rawRows.length})
            </Button>

            <Button
              variant={selectedCategory === 'bursting' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('bursting')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium gap-1',
                selectedCategory === 'bursting'
                  ? 'bg-rose-500 text-white'
                  : 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10'
              )}
            >
              <Flame className="h-3 w-3" /> Bursting Sessions ({burstingCount})
            </Button>

            <Button
              variant={selectedCategory === 'streaming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('streaming')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                selectedCategory === 'streaming' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              🎥 Video & Streaming
            </Button>

            <Button
              variant={selectedCategory === 'gaming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('gaming')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                selectedCategory === 'gaming' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              🎮 Gaming & UDP
            </Button>

            <Button
              variant={selectedCategory === 'enterprise' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('enterprise')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                selectedCategory === 'enterprise' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              🏢 Enterprise & VPN
            </Button>

            <Button
              variant={selectedCategory === 'heavy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('heavy')}
              className={cn(
                'h-7 text-xs px-2.5 rounded-full font-medium',
                selectedCategory === 'heavy' ? 'bg-primary text-primary-foreground shadow-2xs' : 'border-border/70 hover:bg-accent'
              )}
            >
              ⚡ Heavy (&gt;80 GB)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Flow Telemetry Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Subscriber / Host</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Download (Rx)</th>
                <th className="py-3 px-4 min-w-[200px]">Upload (Tx)</th>
                <th className="py-3 px-4 min-w-[180px]">Applications & DPI</th>
                <th className="py-3 px-3">Flow Rate</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Network className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No matching talkers found</p>
                      <p className="text-xs text-muted-foreground">Try clearing search filters or selecting another gateway router.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setSelectedCategory('all');
                          setSelectedRouter('all');
                        }}
                        className="mt-2 text-xs"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((talker) => {
                  const rxPct = maxRx > 0 ? Math.round((talker.rxGb / maxRx) * 100) : 0;
                  const txPct = maxTx > 0 ? Math.round((talker.txGb / maxTx) * 100) : 0;
                  const isBursting = talker.status === 'bursting';
                  const appList = talker.apps.split(',').map((a) => a.trim()).filter(Boolean);

                  return (
                    <tr
                      key={talker.id}
                      onClick={() => setSelectedTalker(talker)}
                      className={cn(
                        'hover:bg-muted/30 cursor-pointer transition-colors group',
                        isBursting && 'bg-rose-500/5'
                      )}
                    >
                      {/* Subscriber Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                              talker.username.startsWith('corp.')
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            )}
                          >
                            {talker.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground text-sm truncate">
                                {talker.customerName ?? talker.username}
                              </span>
                              {talker.username.startsWith('corp.') && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                  CORP
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-muted-foreground font-mono text-[11px]">
                              <span>{talker.username}</span>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyIp(talker.ip, e)}
                                className="inline-flex items-center gap-1 hover:text-foreground hover:underline text-muted-foreground/90"
                                title="Click to copy IP"
                              >
                                {talker.ip}
                                {copiedIp === talker.ip ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {talker.router ?? 'Core'} · {talker.interfaceName ?? 'vlan100'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isBursting ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                            <Flame className="h-3 w-3" /> Bursting
                          </span>
                        ) : talker.status === 'idle' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Idle
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        )}
                      </td>

                      {/* Download Usage */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground font-mono tabular-nums text-sm">
                              {talker.rxGb} <span className="text-[10px] font-normal text-muted-foreground">GB</span>
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              +{talker.currentRxMbps ?? (talker.rxGb * 0.8).toFixed(1)} Mbps
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${Math.min(rxPct, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{rxPct}% of max talker</span>
                            <span>Cap: {talker.fupLimitGb ?? 500} GB</span>
                          </div>
                        </div>
                      </td>

                      {/* Upload Usage */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground font-mono tabular-nums text-sm">
                              {talker.txGb} <span className="text-[10px] font-normal text-muted-foreground">GB</span>
                            </span>
                            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                              +{talker.currentTxMbps ?? (talker.txGb * 0.4).toFixed(1)} Mbps
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-300"
                              style={{ width: `${Math.min(txPct, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{txPct}% of max talker</span>
                            <span>Ratio: {(talker.rxGb / Math.max(talker.txGb, 0.1)).toFixed(1)}:1</span>
                          </div>
                        </div>
                      </td>

                      {/* Application Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {appList.map((app) => {
                            const isVideo = app.toLowerCase().includes('youtube') || app.toLowerCase().includes('netflix');
                            const isGame = app.toLowerCase().includes('steam') || app.toLowerCase().includes('game') || app.toLowerCase().includes('valorant');
                            const isCloud = app.toLowerCase().includes('aws') || app.toLowerCase().includes('docker') || app.toLowerCase().includes('github');

                            return (
                              <Badge
                                key={app}
                                variant="secondary"
                                className={cn(
                                  'px-1.5 py-0 text-[10px] font-medium border shadow-none',
                                  isVideo && 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                                  isGame && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                                  isCloud && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                                  !isVideo && !isGame && !isCloud && 'bg-muted/60 text-muted-foreground border-border/60'
                                )}
                              >
                                {app}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>

                      {/* Flow Packet Rate */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground font-mono tabular-nums text-xs">
                            {((talker.packetsPerSec ?? 3500) / 1000).toFixed(1)}k pps
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {talker.activeFlows ?? 120} active flows
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTalker(talker)}
                            className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 text-xs">
                              <DropdownMenuLabel>Session QoS Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleApplyRateLimit(talker.username)}>
                                <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                Limit Bandwidth to 10M
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendCoa(talker.username)}>
                                <Zap className="mr-2 h-3.5 w-3.5 text-primary" />
                                Send RADIUS CoA Disconnect
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.info(`Destination traceroute started for ${talker.ip}`)}>
                                <Activity className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                Trace Top Destination
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="p-3.5 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <div>
            Showing <strong className="text-foreground">{filteredRows.length}</strong> of{' '}
            <strong className="text-foreground">{rawRows.length}</strong> monitored talkers across{' '}
            <strong className="text-foreground">{routerOptions.length || 1}</strong> gateway routers.
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>NetFlow v9 / IPFIX</span>
            <span>·</span>
            <span>Sampling: 1:1 Full Capture</span>
            <span>·</span>
            <span className="text-emerald-500 font-medium">Daemon Status: Healthy</span>
          </div>
        </div>
      </Card>

      {/* Talker Deep Dive Drawer Sheet */}
      <Sheet open={!!selectedTalker} onOpenChange={(open) => !open && setSelectedTalker(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedTalker && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold uppercase px-2 py-0.5',
                      selectedTalker.status === 'bursting'
                        ? 'border-rose-500/40 text-rose-500 bg-rose-500/10'
                        : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                    )}
                  >
                    {selectedTalker.status === 'bursting' ? 'High Burst Traffic' : 'Active Flow Session'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Last Seen: {selectedTalker.lastSeen ?? 'Just now'}
                  </span>
                </div>

                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedTalker.customerName ?? selectedTalker.username}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  User: {selectedTalker.username} · IP: {selectedTalker.ip} · MAC: {selectedTalker.mac ?? 'N/A'}
                </SheetDescription>
              </SheetHeader>

              {/* Bandwidth Gauges */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                    Downlink Volume
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedTalker.rxGb}
                    </span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-500 font-semibold font-mono">
                    +{selectedTalker.currentRxMbps ?? (selectedTalker.rxGb * 0.8).toFixed(1)} Mbps live
                  </div>
                </Card>

                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                    Uplink Volume
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                      {selectedTalker.txGb}
                    </span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                  <div className="mt-1 text-[11px] text-sky-500 font-semibold font-mono">
                    +{selectedTalker.currentTxMbps ?? (selectedTalker.txGb * 0.4).toFixed(1)} Mbps live
                  </div>
                </Card>
              </div>

              {/* Network Origin & Router Telemetry */}
              <Card className="p-4 border-border/80 bg-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> Routing & Hardware Path
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Gateway Router:</span>
                    <p className="font-semibold text-foreground">{selectedTalker.router ?? 'MK-Core-01'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Ingress Port:</span>
                    <p className="font-semibold text-foreground">{selectedTalker.interfaceName ?? 'sfp-sfpplus1'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Active Flow Count:</span>
                    <p className="font-semibold text-foreground font-mono">{selectedTalker.activeFlows ?? 120} flows</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Packet Velocity:</span>
                    <p className="font-semibold text-foreground font-mono">{((selectedTalker.packetsPerSec ?? 3500) / 1000).toFixed(1)} kpps</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/60">
                    <span className="text-muted-foreground text-[11px]">Primary Destination CDN / Host:</span>
                    <p className="font-mono text-[11px] text-foreground font-medium mt-0.5 truncate">
                      {selectedTalker.topDestination ?? '142.250.190.46 (Google/YouTube BDIX Cache)'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Protocol Breakdown */}
              <Card className="p-4 border-border/80 bg-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Identified Applications & Protocols
                </h4>
                <div className="space-y-2">
                  {selectedTalker.apps.split(',').map((app, idx) => (
                    <div key={app} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">{app.trim()}</span>
                      </div>
                      <span className="text-muted-foreground font-mono">
                        {idx === 0 ? '65%' : idx === 1 ? '25%' : '10%'} bandwidth
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* FUP Limit Progress */}
              <Card className="p-4 border-border/80 bg-card space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Monthly Quota Consumption</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedTalker.rxGb} / {selectedTalker.fupLimitGb ?? 500} GB
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      (selectedTalker.rxGb / (selectedTalker.fupLimitGb ?? 500)) > 0.8
                        ? 'bg-rose-500'
                        : 'bg-primary'
                    )}
                    style={{
                      width: `${Math.min((selectedTalker.rxGb / (selectedTalker.fupLimitGb ?? 500)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </Card>

              {/* Session Control Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleApplyRateLimit(selectedTalker.username)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-medium gap-1.5"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Apply Emergency 10M Rate Limit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendCoa(selectedTalker.username)}
                  className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-primary" /> Send RADIUS CoA Disconnect / Re-auth
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
