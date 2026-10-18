'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Clock, Download, Network, RefreshCw, Radar, Server, Users } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/features/shared/data-table';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { useUrlParam } from '@/hooks/use-url-state';
import { useCaptureIpLogs, useExportIpLogs, useIpLogs, type IpLogEntry } from '../hooks/use-ip-logs';
import { useServerTable } from '../hooks/use-server-table';
import { OptionSelect, fmtDateTime } from '../components/NetOpsControls';

import { formatCount } from '@/lib/format';

/**
 * Compliance IP log: which subscriber held which IP, and when. Built from
 * live PPPoE sessions read off the routers ("Capture now") plus static IP
 * assignments. Port-level NAT translations are not recorded by the platform.
 */
export function IpLogsPage() {
  const t = useTranslations();
  const table = useServerTable();
  const { search } = table;
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [source, setSource] = useUrlParam('source');
  const filters = { search, from, to, source };

  const { data, isLoading, isError, error, refetch, isFetching } = useIpLogs({ page: table.page, pageSize: table.pageSize, ...filters });
  const capture = useCaptureIpLogs();
  const exportCsv = useExportIpLogs();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;
  const filtered = Boolean(search || from || to || source);
  const hasToolbarFilters = Boolean(from || to || source);

  const columns = useMemo<LegacyColumnDef<IpLogEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'firstSeenAt',
        header: t('admin.ops.ipLogs.colFirstSeen', 'First Seen'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.firstSeenAt)}</span>,
      },
      {
        accessorKey: 'lastSeenAt',
        header: t('admin.ops.ipLogs.colLastSeen', 'Last Seen'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.lastSeenAt)}</span>,
      },
      {
        accessorKey: 'username',
        header: t('admin.ops.ipLogs.colSubscriber', 'Subscriber'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-xs font-bold text-foreground">{row.original.username}</span>
            {row.original.customerName && <div className="text-xs font-normal text-muted-foreground">{row.original.customerName}</div>}
          </div>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: t('admin.ops.ipLogs.colIp', 'IP Address'),
        cell: ({ row }) => (
          <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">{row.original.ipAddress}</span>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: t('admin.ops.ipLogs.colMac', 'MAC'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.macAddress ?? '—'}</span>,
      },
      {
        accessorKey: 'routerName',
        header: t('admin.ops.ipLogs.colRouter', 'Router'),
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.routerName ?? '—'}</span>,
      },
      {
        accessorKey: 'source',
        header: t('admin.ops.ipLogs.colSource', 'Source'),
        meta: { mobile: 'status' },
        cell: ({ row }) => (
          <Badge variant="outline" tone={row.original.source === 'static' ? 'success' : 'info'} className="font-semibold uppercase">
            {row.original.source === 'static' ? t('admin.ops.ipLogs.sourceStatic', 'Static') : 'PPPoE'}
          </Badge>
        ),
      },
    ],
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.ipLogs.loadFailed', 'Failed to load IP logs')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const kpis = [
    { label: t('admin.ops.ipLogs.kpiEntries', 'Log Entries'), value: formatCount((summary?.entries ?? 0)), hint: t('admin.ops.ipLogs.kpiEntriesHint', 'IP holding periods recorded'), icon: Network, tone: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-foreground' },
    { label: t('admin.ops.ipLogs.kpiIps', 'Distinct IPs'), value: formatCount((summary?.distinctIps ?? 0)), hint: t('admin.ops.ipLogs.kpiIpsHint', 'Addresses seen'), icon: Server, tone: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-400' },
    { label: t('admin.ops.ipLogs.kpiUsers', 'Subscribers'), value: formatCount((summary?.users ?? 0)), hint: t('admin.ops.ipLogs.kpiUsersHint', 'Usernames logged'), icon: Users, tone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400' },
    { label: t('admin.ops.ipLogs.kpiCapture', 'Last Capture'), value: fmtDateTime(summary?.lastCapture), hint: t('admin.ops.ipLogs.kpiCaptureHint', 'Most recent session read'), icon: Clock, tone: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-400 text-lg' },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.ops.ipLogs.title', 'Compliance IP Assignment Logs')}
        subtitle={t('admin.ops.ipLogs.subtitle', 'Which subscriber held which IP address and when — searchable and exportable for lawful requests.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.compliance', 'Compliance') },
          { label: t('common.crumb.ip_logs', 'IP Logs') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              {t('admin.ops.ipLogs.refresh', 'Refresh')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => capture.mutate()} disabled={capture.isPending} className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5">
              <Radar className={cn('h-3.5 w-3.5', capture.isPending && 'animate-pulse')} />
              {capture.isPending ? t('admin.ops.ipLogs.capturing', 'Reading routers…') : t('admin.ops.ipLogs.capture', 'Capture Now')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv.mutate(filters)}
              disabled={exportCsv.isPending || rows.length === 0}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              {exportCsv.isPending ? t('admin.ops.ipLogs.exporting', 'Exporting…') : t('admin.ops.ipLogs.exportCsv', 'Export CSV')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={cn('p-2 rounded-lg border', k.tone)}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className={cn('mt-2 text-2xl font-black font-mono', k.text)}>{k.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">{k.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.ops.ipLogs.searchPlaceholder', 'Search by username, IP address or MAC...')}
        emptyTitle={filtered ? t('admin.ops.ipLogs.emptyFiltered', 'No log entries match these filters') : t('admin.ops.ipLogs.emptyNone', 'No IP assignments logged yet')}
        emptyDescription={
          filtered
            ? t('admin.ops.ipLogs.emptyFilteredHint', 'Try a wider date range or a different search.')
            : t('admin.ops.ipLogs.emptyNoneHint', 'Use "Capture Now" to read the live sessions from your routers.')
        }
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                table.setPage(1);
              }}
              className="h-9 w-[150px] bg-background/80 text-xs"
              aria-label={t('admin.ops.ipLogs.fromDate', 'From date')}
            />
            <span className="text-xs text-muted-foreground">{t('admin.ops.ipLogs.to', 'to')}</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                table.setPage(1);
              }}
              className="h-9 w-[150px] bg-background/80 text-xs"
              aria-label={t('admin.ops.ipLogs.toDate', 'To date')}
            />
            <OptionSelect
              value={source}
              onChange={(v) => {
                setSource(v);
                table.setPage(1);
              }}
              options={[
                { value: 'pppoe_session', label: t('admin.ops.ipLogs.srcPppoe', 'PPPoE sessions') },
                { value: 'static', label: t('admin.ops.ipLogs.srcStatic', 'Static IPs') },
              ]}
              placeholder={t('admin.ops.ipLogs.allSources', 'All sources')}
              noneLabel={t('admin.ops.ipLogs.allSources', 'All sources')}
              className="h-9 w-[150px] bg-background/80 text-xs"
            />
            {hasToolbarFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs"
                onClick={() => {
                  setFrom('');
                  setTo('');
                  setSource('');
                  table.setPage(1);
                }}
              >
                {t('admin.ops.ipLogs.clearFilters', 'Clear filters')}
              </Button>
            ) : null}
          </>
        }
      />
    </div>
  );
}
