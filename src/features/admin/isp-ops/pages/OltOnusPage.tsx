'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAllOltOnus, useOltOnus } from '@/features/admin/olt/hooks/useOltOnus';
import { useSyncOlt } from '@/features/admin/olt/hooks/useOltDevices';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { onuHealth, parseBackendDate, rxBand, type OltOnu, type OnuHealth } from '@/features/admin/olt/types';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatDateTime } from '@/lib/format/date';
import { cn } from '@/lib/utils';
import {
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Signal,
  Router,
  User,
  Loader2,
  PowerOff,
} from 'lucide-react';
import { toast } from 'sonner';

const RX_STYLE: Record<ReturnType<typeof rxBand>, { icon: string; chip: string }> = {
  good: {
    icon: 'text-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  weak: {
    icon: 'text-amber-500',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  critical: {
    icon: 'text-rose-500',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
  unknown: { icon: 'text-muted-foreground', chip: 'bg-muted text-muted-foreground border border-border/70' },
};

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function OltOnusPage() {
  const params = useParams<{ id: string }>();
  const oltId = params?.id ?? '';
  const table = useServerTable();
  const { page, pageSize, search, resetPage } = table;
  const [status, setStatus] = useState<'all' | OnuHealth>('all');
  const { data, isLoading, isError, error, isFetching, refetch } = useOltOnus(oltId, { page, pageSize, search, status });
  const sync = useSyncOlt();
  const [exporting, setExporting] = useState(false);

  const olt = data?.olt;
  const oltLabel = olt?.name || oltId;
  const summary = data?.summary;
  const syncedAt = parseBackendDate(data?.lastSyncedAt ?? null);

  const handleSync = () => {
    sync.mutate(oltId, {
      onSuccess: (res) => toast.success(`Synchronized ${res?.synced ?? 0} ONUs from ${oltLabel}.`),
    });
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllOltOnus(oltId);
      const headers = ['ONU', 'PON Port', 'MAC', 'Customer', 'PPPoE ID', 'Rx Power (dBm)', 'Tx Power (dBm)', 'Distance', 'Status', 'Reason', 'Splitter', 'Last Seen'];
      const lines = rows.map((r) =>
        [r.onuId, r.ponPort, r.mac, r.customerName ?? r.description, r.pppoeId, r.rxPower, r.txPower, r.distance, r.status, r.reason, r.splitter, r.lastSeen]
          .map(csvCell)
          .join(','),
      );
      const blob = new Blob([[headers.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `onu_telemetry_${oltLabel.replace(/[^\w-]+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      toast.success(`${rows.length} ONUs exported to CSV`);
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed.'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<OltOnu, unknown>[]>(
    () => [
      {
        accessorKey: 'onuId',
        header: 'ONU (PON : Index)',
        enableHiding: false,
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Router className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
                {row.original.onuId}
              </span>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{row.original.mac ?? '—'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Subscriber / Client',
        size: 220,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm">
                  {r.customerName ?? r.description ?? <span className="italic text-muted-foreground">Unassigned</span>}
                </span>
                {r.pppoeId && <div className="font-mono text-[10px] text-muted-foreground">{r.pppoeId}</div>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rxPower',
        header: 'Rx Power (dBm)',
        size: 150,
        cell: ({ row }) => {
          const rx = row.original.rxPower;
          const style = RX_STYLE[rxBand(rx)];
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums">
              <Signal className={cn('h-3.5 w-3.5', style.icon)} />
              <span className={cn('px-2 py-0.5 rounded', style.chip)}>{rx !== null ? `${rx.toFixed(1)} dBm` : '—'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'txPower',
        header: 'Tx Power (dBm)',
        size: 120,
        cell: ({ row }) => (
          <span className="tabular-nums font-mono text-xs text-muted-foreground">
            {row.original.txPower !== null ? `${row.original.txPower.toFixed(1)} dBm` : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'distance',
        header: 'Distance',
        size: 100,
        cell: ({ row }) => (
          <span className="tabular-nums font-mono text-xs text-muted-foreground">
            {row.original.distance !== null ? row.original.distance : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Optical Link',
        size: 140,
        cell: ({ row }) => {
          const health = onuHealth(row.original);
          return (
            <div>
              {health === 'online' ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Online</Badge>
              ) : health === 'wire_down' ? (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">LOS / Wire down</Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">Offline</Badge>
              )}
              {row.original.reason && <div className="mt-0.5 text-[10px] text-muted-foreground">{row.original.reason}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: 'splitter',
        header: 'Splitter',
        size: 130,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.splitter ?? '—'}</span>,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load ONUs"
        description={errorMessage(error, 'Could not load the ONUs of this OLT.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const chips: { key: 'all' | OnuHealth; label: string; count: number }[] = [
    { key: 'all', label: 'All ONUs', count: summary?.total ?? 0 },
    { key: 'online', label: 'Online', count: summary?.online ?? 0 },
    { key: 'wire_down', label: 'Wire Down / LOS', count: summary?.wireDown ?? 0 },
    { key: 'power_off', label: 'Power Off', count: summary?.powerOff ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ONU Optical Power & Telemetry"
        subtitle={`Synchronized ONUs of ${oltLabel} — ${syncedAt ? `last sync ${formatDateTime(syncedAt)}` : 'never synchronized'}.`}
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'OLT', href: '/admin/olt' },
          { label: `ONUs (${oltLabel})` },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting || !summary?.total} className="h-9">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={sync.isPending || !olt?.syncSupported}
              title={olt?.syncSupported ? 'Read every ONU from the OLT now' : `No sync driver on this server for ${olt?.brand || 'this brand'}`}
              className="h-9"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', sync.isPending && 'animate-spin')} />
              {sync.isPending ? 'Syncing… (up to a minute)' : 'Sync from OLT'}
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon — whole OLT, independent of the filter below */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Mapped ONUs</span>
            <Router className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {summary?.total ?? 0}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{data.ponPorts.length} PON ports on this OLT</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Online</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summary?.online ?? 0}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Registered at last sync</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Wire Down / LOS</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {summary?.wireDown ?? 0}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">Fiber fault reported</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Power Off / Offline</span>
            <PowerOff className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {summary?.powerOff ?? 0}
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">Offline without fiber fault</p>
        </div>
      </div>

      {/* Status filter (server-side) */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setStatus(c.key);
              resetPage();
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition duration-150',
              status === c.key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30',
            )}
          >
            {c.label}
            <span className={cn('tabular-nums', status === c.key ? 'text-background/70' : 'text-muted-foreground')}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={data.items}
        isLoading={isFetching && !data.items.length}
        getRowId={(row) => row.id ?? row.onuId}
        searchPlaceholder="Search MAC, customer, PPPoE ID, port or splitter..."
        server={table.server(data.meta.total)}
        emptyTitle={summary?.total ? 'No ONUs match the current filter' : 'No ONUs synchronized yet'}
        emptyDescription={summary?.total ? 'Try a different search or status.' : 'Run “Sync from OLT” to read the ONUs of this OLT.'}
      />
    </div>
  );
}
