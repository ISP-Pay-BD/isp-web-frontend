'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Eye,
  HardDrive,
  Network,
  PowerOff,
  Radio,
  RefreshCw,
  Search,
  Server,
  Sliders,
  X,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import {
  useDisconnectSession,
  useNetOpsOptions,
  useTopTalkers,
  type TalkerSort,
  type TopTalker,
} from '../hooks/use-network-ops';
import { NetOpsPager, OptionSelect } from '../components/NetOpsControls';

const PAGE_SIZE = 25;
const gb = (mb: number) => (mb / 1024).toFixed(2);

/**
 * Top talkers = customers ranked by recorded daily usage (user_data_usage,
 * written by the router usage poll). The platform has no flow collector, so
 * there are no live rates, packet counts or application breakdowns here.
 */
export function NetflowPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [routerId, setRouterId] = useState('');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState<TalkerSort>('total');
  const [selectedTalker, setSelectedTalker] = useState<TopTalker | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<TopTalker | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useTopTalkers({ page, pageSize: PAGE_SIZE, search, routerId, date, sort });
  const options = useNetOpsOptions();
  const disconnect = useDisconnectSession();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;
  const maxRx = useMemo(() => Math.max(1, ...rows.map((r) => r.rxMb)), [rows]);
  const maxTx = useMemo(() => Math.max(1, ...rows.map((r) => r.txMb)), [rows]);

  const handleCopyIp = async (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
  };

  const handleExportCsv = () => {
    const headers = ['Customer', 'Username', 'IP Address', 'MAC Address', 'Router', 'Interface', 'Package', 'Download (MB)', 'Upload (MB)', 'Total (MB)', 'Date'];
    const cell = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [r.customerName, r.username, r.ip, r.mac, r.routerName, r.interfaceName, r.packageName, r.rxMb, r.txMb, r.totalMb, r.date].map(cell).join(','),
    );
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `top_talkers_${data?.date ?? 'usage'}_p${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const confirmDisconnect = () => {
    if (!disconnectTarget?.routerId) return;
    disconnect.mutate({ routerId: disconnectTarget.routerId, username: disconnectTarget.username });
    setDisconnectTarget(null);
  };

  if (isLoading && !data) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState title="Failed to load usage" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Top Talkers"
        subtitle="Customers ranked by recorded daily download and upload volume."
        breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'Top Talkers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export page CSV
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customers With Usage</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{(summary?.customers ?? 0).toLocaleString()}</span>
            <span className="text-xs text-muted-foreground font-medium">on {data?.date ?? '—'}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Download (Rx)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">{gb(summary?.rxMb ?? 0)}</span>
            <span className="text-xs text-muted-foreground font-medium">GB</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upload (Tx)</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">{gb(summary?.txMb ?? 0)}</span>
            <span className="text-xs text-muted-foreground font-medium">GB</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Volume</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">{gb((summary?.rxMb ?? 0) + (summary?.txMb ?? 0))}</span>
            <span className="text-xs text-muted-foreground font-medium">GB</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by customer name or PPPoE username..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OptionSelect
                value={routerId}
                onChange={(v) => {
                  setRouterId(v);
                  setPage(1);
                }}
                options={options.data?.routers ?? []}
                placeholder="All routers"
                noneLabel="All routers"
                className="h-9 text-xs w-[170px] bg-background border-border/60"
              />
              <Input
                type="date"
                value={date || data?.date || ''}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs w-[150px] bg-background border-border/60"
                aria-label="Usage date"
              />
              <Select
                value={sort}
                onValueChange={(v) => {
                  setSort((v as TalkerSort) || 'total');
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[170px] bg-background border-border/60">
                  <Sliders className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Sort: Total volume</SelectItem>
                  <SelectItem value="rx">Sort: Download (Rx)</SelectItem>
                  <SelectItem value="tx">Sort: Upload (Tx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Subscriber / Host</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-4 min-w-[200px]">Download (Rx)</th>
                <th className="py-3 px-4 min-w-[200px]">Upload (Tx)</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Network className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">{data?.date ? 'No usage matches these filters' : 'No usage has been recorded yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((talker) => {
                  const rxPct = Math.round((talker.rxMb / maxRx) * 100);
                  const txPct = Math.round((talker.txMb / maxTx) * 100);
                  return (
                    <tr key={talker.userId} onClick={() => setSelectedTalker(talker)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
                            {(talker.customerName || talker.username).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground text-sm truncate">{talker.customerName || talker.username}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-muted-foreground font-mono text-[11px]">
                              <span>{talker.username}</span>
                              {talker.ip && (
                                <>
                                  <span>·</span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyIp(talker.ip as string, e)}
                                    className="inline-flex items-center gap-1 hover:text-foreground hover:underline text-muted-foreground/90"
                                    title="Copy IP"
                                  >
                                    {talker.ip}
                                    {copiedIp === talker.ip ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {[talker.routerName, talker.interfaceName].filter(Boolean).join(' · ') || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px]',
                            talker.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                          )}
                        >
                          {talker.status || '—'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-foreground font-mono tabular-nums text-sm">
                            {gb(talker.rxMb)} <span className="text-[10px] font-normal text-muted-foreground">GB</span>
                          </span>
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(rxPct, 100)}%` }} />
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{rxPct}% of top on this page</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-foreground font-mono tabular-nums text-sm">
                            {gb(talker.txMb)} <span className="text-[10px] font-normal text-muted-foreground">GB</span>
                          </span>
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div className="h-full rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${Math.min(txPct, 100)}%` }} />
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{txPct}% of top on this page</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{talker.packageName ?? '—'}</span>
                          {talker.packageBandwidth && <span className="text-[10px] text-muted-foreground font-mono">{talker.packageBandwidth}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTalker(talker)} className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1">
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!talker.routerId || disconnect.isPending}
                            onClick={() => setDisconnectTarget(talker)}
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            title="Disconnect the live PPPoE session"
                          >
                            <PowerOff className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <NetOpsPager page={page} totalPages={data?.meta.totalPages ?? 1} total={data?.meta.total ?? 0} onPageChange={setPage} label="customers" />
      </Card>

      {/* Detail drawer */}
      <Sheet open={!!selectedTalker} onOpenChange={(open) => !open && setSelectedTalker(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedTalker && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase px-2 py-0.5">
                    {selectedTalker.status || '—'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">Usage day: {selectedTalker.date}</span>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selectedTalker.customerName || selectedTalker.username}</SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  User: {selectedTalker.username} · IP: {selectedTalker.ip ?? '—'} · MAC: {selectedTalker.mac ?? '—'}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Download</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{gb(selectedTalker.rxMb)}</span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </Card>
                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Upload</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">{gb(selectedTalker.txMb)}</span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </Card>
              </div>

              <Card className="p-4 border-border/80 bg-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> Routing & Plan
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Router:</span>
                    <p className="font-semibold text-foreground">{selectedTalker.routerName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Interface:</span>
                    <p className="font-semibold text-foreground">{selectedTalker.interfaceName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Package:</span>
                    <p className="font-semibold text-foreground">{selectedTalker.packageName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Bandwidth:</span>
                    <p className="font-semibold text-foreground font-mono">{selectedTalker.packageBandwidth ?? '—'}</p>
                  </div>
                </div>
              </Card>

              <Button
                variant="outline"
                disabled={!selectedTalker.routerId || disconnect.isPending}
                onClick={() => setDisconnectTarget(selectedTalker)}
                className="w-full text-xs h-9 border-border/80 hover:bg-accent gap-1.5"
              >
                <PowerOff className="h-3.5 w-3.5 text-destructive" /> Disconnect live session (CoA)
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title="Disconnect session"
        description={`Drop the live PPPoE session of "${disconnectTarget?.username ?? ''}" on ${disconnectTarget?.routerName ?? 'its router'}? The customer reconnects automatically.`}
        confirmLabel="Disconnect"
        destructive
        onConfirm={confirmDisconnect}
      />
    </div>
  );
}
