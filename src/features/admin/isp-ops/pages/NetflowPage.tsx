'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Eye,
  HardDrive,
  PowerOff,
  Radio,
  RefreshCw,
  Server,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useUrlParam } from '@/hooks/use-url-state';
import {
  useDisconnectSession,
  useNetOpsOptions,
  useTopTalkers,
  type TalkerSort,
  type TopTalker,
} from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect } from '../components/NetOpsControls';

import { formatCount } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';

const TALKER_SORTS: readonly TalkerSort[] = ['total', 'rx', 'tx'];
const gb = (mb: number) => (mb / 1024).toFixed(2);

function statusText(t: ReturnType<typeof useLocale>['t'], status: string): string {
  return t(`status.${status.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, status);
}

/**
 * Top talkers = customers ranked by recorded daily usage (user_data_usage,
 * written by the router usage poll). The platform has no flow collector, so
 * there are no live rates, packet counts or application breakdowns here.
 */
export function NetflowPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const [routerId, setRouterId] = useUrlParam('router');
  const [date, setDate] = useState('');
  const [rankParam, setRankParam] = useUrlParam('rank');
  const sort: TalkerSort = TALKER_SORTS.find((s) => s === rankParam) ?? 'total';
  const [selectedTalker, setSelectedTalker] = useState<TopTalker | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<TopTalker | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useTopTalkers({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    routerId,
    date,
    sort,
  });
  const options = useNetOpsOptions();
  const disconnect = useDisconnectSession();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;
  const maxRx = useMemo(() => Math.max(1, ...rows.map((r) => r.rxMb)), [rows]);
  const maxTx = useMemo(() => Math.max(1, ...rows.map((r) => r.txMb)), [rows]);

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
    link.download = `top_talkers_${data?.date ?? 'usage'}_p${table.page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<LegacyColumnDef<TopTalker, unknown>[]>(
    () => [
      {
        id: 'subscriber',
        header: t('admin.ops.netflow.colSubscriber', 'Subscriber / Host'),
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const talker = row.original;
          return (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                {(talker.customerName || talker.username).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => setSelectedTalker(talker)}
                  className="truncate text-left text-sm font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {talker.customerName || talker.username}
                </button>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-xs font-normal text-muted-foreground">
                  <span>{talker.username}</span>
                  {talker.ip && (
                    <>
                      <span aria-hidden>·</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(talker.ip as string);
                          setCopiedIp(talker.ip);
                        }}
                        className="inline-flex items-center gap-1 text-muted-foreground/90 hover:text-foreground hover:underline"
                        title={t('admin.ops.netflow.copyIp', 'Copy IP')}
                      >
                        {talker.ip}
                        {copiedIp === talker.ip ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 opacity-60" />}
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground/70">
                  {[talker.routerName, talker.interfaceName].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: t('admin.ops.netflow.colAccount', 'Account'),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" tone={row.original.status === 'active' ? 'success' : 'neutral'} className="capitalize">
            {row.original.status ? statusText(t, row.original.status) : '—'}
          </Badge>
        ),
      },
      {
        id: 'download',
        header: t('admin.ops.netflow.colDownload', 'Download (Rx)'),
        enableSorting: false,
        meta: { mobileLabel: t('admin.ops.netflow.colDownload', 'Download (Rx)') },
        cell: ({ row }) => {
          const pct = Math.round((row.original.rxMb / maxRx) * 100);
          return (
            <div className="min-w-[160px] space-y-1">
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                {gb(row.original.rxMb)} <span className="text-xs font-normal text-muted-foreground">GB</span>
              </span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="font-mono text-xs text-muted-foreground">{t('admin.ops.netflow.pctOfTop', '{pct}% of top on this page', { pct })}</div>
            </div>
          );
        },
      },
      {
        id: 'upload',
        header: t('admin.ops.netflow.colUpload', 'Upload (Tx)'),
        enableSorting: false,
        meta: { mobileLabel: t('admin.ops.netflow.colUpload', 'Upload (Tx)') },
        cell: ({ row }) => {
          const pct = Math.round((row.original.txMb / maxTx) * 100);
          return (
            <div className="min-w-[160px] space-y-1">
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                {gb(row.original.txMb)} <span className="text-xs font-normal text-muted-foreground">GB</span>
              </span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div className="h-full rounded-full bg-sky-500 transition-[width] duration-300" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="font-mono text-xs text-muted-foreground">{t('admin.ops.netflow.pctOfTop', '{pct}% of top on this page', { pct })}</div>
            </div>
          );
        },
      },
      {
        id: 'package',
        header: t('admin.customers.list.colPackage', 'Package'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{row.original.packageName ?? '—'}</span>
            {row.original.packageBandwidth && <span className="font-mono text-xs text-muted-foreground">{row.original.packageBandwidth}</span>}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTalker(row.original)} className="h-8 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10">
              <Eye className="h-3.5 w-3.5" /> {t('admin.ops.netflow.inspect', 'Inspect')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!row.original.routerId || disconnect.isPending}
              onClick={() => setDisconnectTarget(row.original)}
              className="h-8 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10"
              title={t('admin.ops.netflow.disconnectLive', 'Disconnect the live PPPoE session')}
              aria-label={t('admin.ops.netflow.disconnectLive', 'Disconnect the live PPPoE session')}
            >
              <PowerOff className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [maxRx, maxTx, copiedIp, disconnect.isPending, t],
  );

  const confirmDisconnect = () => {
    if (!disconnectTarget?.routerId) return;
    disconnect.mutate({ routerId: disconnectTarget.routerId, username: disconnectTarget.username });
    setDisconnectTarget(null);
  };

  if (isLoading && !data) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.netflow.loadFailed', 'Failed to load usage')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('common.crumb.top_talkers', 'Top Talkers')}
        subtitle={t('admin.ops.netflow.subtitle', 'Customers ranked by recorded daily download and upload volume.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.network', 'Network') },
          { label: t('common.crumb.top_talkers', 'Top Talkers') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-xs h-8 border-border/80 hover:bg-accent">
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} /> {t('admin.ops.netflow.refresh', 'Refresh')}
            </Button>
            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-8 gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> {t('admin.ops.netflow.exportCsv', 'Export page CSV')}
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.netflow.kpiCustomers', 'Customers With Usage')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{formatCount((summary?.customers ?? 0))}</span>
            <span className="text-xs text-muted-foreground font-medium">{t('admin.ops.netflow.onDate', 'on {date}', { date: data?.date ?? '—' })}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.netflow.colDownload', 'Download (Rx)')}</span>
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.netflow.colUpload', 'Upload (Tx)')}</span>
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.netflow.kpiTotal', 'Total Volume')}</span>
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

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => r.userId}
        searchPlaceholder={t('admin.ops.netflow.searchPlaceholder', 'Search by customer name or PPPoE username...')}
        emptyTitle={
          data?.date
            ? t('admin.ops.netflow.emptyFiltered', 'No usage matches these filters')
            : t('admin.ops.netflow.emptyNone', 'No usage has been recorded yet')
        }
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <>
            <OptionSelect
              value={routerId}
              onChange={(v) => {
                setRouterId(v);
                table.setPage(1);
              }}
              options={options.data?.routers ?? []}
              placeholder={t('admin.customers.list.allRouters', 'All routers')}
              noneLabel={t('admin.customers.list.allRouters', 'All routers')}
              className="h-9 w-[170px] border-border/60 bg-background text-xs"
            />
            <Input
              type="date"
              value={date || data?.date || ''}
              onChange={(e) => {
                setDate(e.target.value);
                table.setPage(1);
              }}
              className="h-9 w-[150px] border-border/60 bg-background text-xs"
              aria-label={t('admin.ops.netflow.usageDate', 'Usage date')}
            />
            <Select
              value={sort}
              onValueChange={(v) => {
                setRankParam(v && v !== 'total' ? v : '');
                table.setPage(1);
              }}
              items={{
                total: t('admin.ops.netflow.sortTotal', 'Sort: Total volume'),
                rx: t('admin.ops.netflow.sortRx', 'Sort: Download (Rx)'),
                tx: t('admin.ops.netflow.sortTx', 'Sort: Upload (Tx)'),
              }}
            >
              <SelectTrigger className="h-9 min-w-[170px] border-border/60 bg-background text-xs" aria-label={t('admin.ops.netflow.rankBy', 'Rank by')}>
                <Sliders className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder={t('admin.ops.netflow.sortBy', 'Sort By')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">{t('admin.ops.netflow.sortTotal', 'Sort: Total volume')}</SelectItem>
                <SelectItem value="rx">{t('admin.ops.netflow.sortRx', 'Sort: Download (Rx)')}</SelectItem>
                <SelectItem value="tx">{t('admin.ops.netflow.sortTx', 'Sort: Upload (Tx)')}</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Detail drawer */}
      <Sheet open={!!selectedTalker} onOpenChange={(open) => !open && setSelectedTalker(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-6">
          {selectedTalker && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold uppercase px-2 py-0.5">
                    {selectedTalker.status ? statusText(t, selectedTalker.status) : '—'}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {t('admin.ops.netflow.usageDay', 'Usage day: {date}', { date: selectedTalker.date })}
                  </span>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{selectedTalker.customerName || selectedTalker.username}</SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  {t('admin.ops.netflow.userLine', 'User: {user} · IP: {ip} · MAC: {mac}', {
                    user: selectedTalker.username,
                    ip: selectedTalker.ip ?? '—',
                    mac: selectedTalker.mac ?? '—',
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{t('admin.ops.netflow.download', 'Download')}</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{gb(selectedTalker.rxMb)}</span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </Card>
                <Card className="p-3.5 border-border/80 bg-muted/20">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{t('admin.ops.netflow.upload', 'Upload')}</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">{gb(selectedTalker.txMb)}</span>
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </Card>
              </div>

              <Card className="p-4 border-border/80 bg-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> {t('admin.ops.netflow.routingPlan', 'Routing & Plan')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-xs">{t('admin.ops.netflow.router', 'Router:')}</span>
                    <p className="font-semibold text-foreground">{selectedTalker.routerName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t('admin.ops.netflow.interface', 'Interface:')}</span>
                    <p className="font-semibold text-foreground">{selectedTalker.interfaceName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t('admin.ops.netflow.package', 'Package:')}</span>
                    <p className="font-semibold text-foreground">{selectedTalker.packageName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t('admin.ops.netflow.bandwidth', 'Bandwidth:')}</span>
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
                <PowerOff className="h-3.5 w-3.5 text-destructive" /> {t('admin.ops.netflow.disconnectCoa', 'Disconnect live session (CoA)')}
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        title={t('admin.ops.netflow.disconnectTitle', 'Disconnect session')}
        description={t(
          'admin.ops.netflow.disconnectDesc',
          'Drop the live PPPoE session of "{user}" on {router}? The customer reconnects automatically.',
          {
            user: disconnectTarget?.username ?? '',
            router: disconnectTarget?.routerName ?? t('admin.ops.netflow.itsRouter', 'its router'),
          },
        )}
        confirmLabel={t('admin.ops.netflow.disconnect', 'Disconnect')}
        destructive
        onConfirm={confirmDisconnect}
      />
    </div>
  );
}
