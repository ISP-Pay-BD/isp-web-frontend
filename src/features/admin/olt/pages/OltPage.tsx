'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { fetchAllOlts, useDeleteOlt, useOltDevices, useRebootOlt } from '../hooks/useOltDevices';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import type { OltRow } from '../types';
import { parseBackendDate } from '../types';
import { OltModal } from '../components/OltModal';
import { OltDiagnosticsModal } from '../components/OltDiagnosticsModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Zap,
  RotateCw,
  Download,
  Server,
  Activity,
  AlertTriangle,
  Radio,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format/date';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';

function OltHealthBar({ online, total }: { online: number; total: number }) {
  const pct = total > 0 ? Math.round((online / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500',
          )}
          style={{ width: `${pct}%`, transitionDelay: '300ms' }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-muted-foreground w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

type Translate = ReturnType<typeof useLocale>['t'];

function syncLabel(t: Translate, value: string | null): string {
  const d = parseBackendDate(value);
  return d ? t('admin.olt.page.synced', 'Synced {time}', { time: formatDateTime(d) }) : t('admin.olt.page.neverSynced', 'Never synced');
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const ALL_BRANDS = '__all__';

export function OltPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const { page, pageSize, search, resetPage } = table;
  const [brandFilter, setBrandFilter] = useState(ALL_BRANDS);
  const { data, isLoading, isError, isFetching, refetch } = useOltDevices({
    page,
    pageSize,
    search,
    brand: brandFilter === ALL_BRANDS ? undefined : brandFilter,
  });
  const deleteOlt = useDeleteOlt();
  const rebootOlt = useRebootOlt();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState<OltRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OltRow | null>(null);
  const [rebootTarget, setRebootTarget] = useState<OltRow | null>(null);
  const [diagnosticsOlt, setDiagnosticsOlt] = useState<OltRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const list = useMemo(() => data?.items ?? [], [data]);
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const brandLabel = useMemo(() => {
    const map = new Map(brands.map((b) => [b.value.toLowerCase(), b.label]));
    return (value: string) => map.get(value.toLowerCase()) ?? (value || '—');
  }, [brands]);
  const summary = data?.summary;
  const healthPct = summary && summary.onusTotal > 0 ? Math.round((summary.onusOnline / summary.onusTotal) * 100) : 0;

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    deleteOlt.mutate(target.id, {
      onSuccess: () => toast.success(t('admin.olt.page.removed', '{name} removed.', { name: target.name })),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleReboot = () => {
    if (!rebootTarget) return;
    const target = rebootTarget;
    setRebootTarget(null);
    const pending = toast.loading(t('admin.olt.page.resetting', 'Resetting {name} connection…', { name: target.name }));
    rebootOlt.mutate(target.id, {
      onSuccess: () => toast.success(t('admin.olt.page.resetDone', '{name} connection reset and refreshed.', { name: target.name }), { id: pending }),
      onError: (err) => toast.error(err.message, { id: pending }),
    });
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllOlts();
      const headers = ['OLT Name', 'Vendor Brand', 'IP Address', 'Port', 'Protocol', 'PON Ports', 'Online ONUs', 'Total ONUs', 'Last Sync', 'Status'];
      const lines = rows.map((o) =>
        [o.name, brandLabel(o.brand), o.ip, o.port ?? '', o.protocol, o.ponPorts ?? '', o.onuOnline, o.onuTotal, o.lastSyncedAt ?? '', o.enabled ? 'enabled' : 'disabled']
          .map(csvCell)
          .join(','),
      );
      const blob = new Blob([[headers.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `olt_nodes_directory_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      toast.success(t('admin.olt.page.exported', '{n} OLT nodes exported to CSV', { n: rows.length }));
    } catch (err) {
      toast.error(errorMessage(err, t('admin.olt.page.exportFailed', 'Export failed.')));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<OltRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.olt.page.colNode', 'OLT Node'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const olt = row.original;
          const onlinePct =
            olt.onuTotal > 0 ? Math.round((olt.onuOnline / olt.onuTotal) * 100) : 0;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold shrink-0',
                  olt.onuTotal === 0
                    ? 'bg-muted/40 text-muted-foreground border-border/60'
                    : onlinePct >= 90
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : onlinePct >= 70
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                )}
              >
                {olt.onuTotal === 0 ? '—' : `${onlinePct}%`}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-[13px] leading-tight truncate">
                  {olt.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{syncLabel(t, olt.lastSyncedAt)}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'brand',
        header: t('admin.olt.page.colVendor', 'Vendor'),
        size: 130,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium bg-muted/30 text-xs px-2 py-0.5">
            {brandLabel(row.original.brand)}
          </Badge>
        ),
      },
      {
        accessorKey: 'ip',
        header: t('admin.olt.page.colHost', 'Host IP & Port'),
        size: 170,
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-[12px] font-medium text-foreground">
              {row.original.ip}
              {row.original.port !== null && <span className="text-muted-foreground">:{row.original.port}</span>}
            </div>
            {row.original.username && (
              <div className="font-mono text-xs text-muted-foreground">
                {t('admin.olt.page.userLabel', 'user: {name}', { name: row.original.username })}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'protocol',
        header: t('admin.olt.page.colProtocol', 'Protocol'),
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="uppercase font-mono text-xs tracking-wider px-2 py-0.5"
          >
            {row.original.protocol || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'ponPorts',
        header: t('admin.olt.page.colPonPorts', 'PON Ports'),
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">
              {row.original.ponPorts ?? '—'}
            </span>
            {row.original.ponPorts !== null && <span className="text-xs text-muted-foreground">PON</span>}
          </div>
        ),
      },
      {
        id: 'onus',
        accessorKey: 'onuOnline',
        header: t('admin.olt.page.colOnus', 'Connected ONUs'),
        size: 180,
        cell: ({ row }) => (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {row.original.onuOnline}
                </span>
                <span className="text-xs text-muted-foreground">/ {row.original.onuTotal}</span>
              </div>
              <Link
                href={`/admin/olt/${row.original.id}/onus`}
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
              >
                ONUs <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
            <OltHealthBar online={row.original.onuOnline} total={row.original.onuTotal} />
          </div>
        ),
      },
      {
        accessorKey: 'enabled',
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 110,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.enabled ? 'active' : 'disabled'}
            label={row.original.enabled ? t('admin.olt.page.enabled', 'Enabled') : t('admin.olt.page.disabled', 'Disabled')}
          />
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 140,
        cell: ({ row }) => {
          const olt = row.original;
          const noDriver = t('admin.olt.page.noDriver', 'No {brand} driver on this server', { brand: brandLabel(olt.brand) });
          return (
            <div className="flex items-center justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-amber-500/10"
                title={olt.syncSupported ? t('admin.olt.page.diagnostics', 'Live ONU diagnostics') : noDriver}
                aria-label={olt.syncSupported ? t('admin.olt.page.diagnostics', 'Live ONU diagnostics') : noDriver}
                disabled={!olt.syncSupported}
                onClick={() => setDiagnosticsOlt(olt)}
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-orange-500/10"
                title={olt.syncSupported ? t('admin.olt.page.resetLine', 'Reset / refresh line') : noDriver}
                aria-label={olt.syncSupported ? t('admin.olt.page.resetLine', 'Reset / refresh line') : noDriver}
                disabled={!olt.syncSupported}
                onClick={() => setRebootTarget(olt)}
              >
                <RotateCw className="h-3.5 w-3.5 text-orange-500" />
              </Button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                title={t('admin.olt.page.edit', 'Edit OLT')}
                aria-label={t('admin.olt.page.edit', 'Edit OLT')}
                onClick={() => {
                  setSelectedOlt(olt);
                  setModalOpen(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10"
                title={t('admin.olt.page.delete', 'Delete OLT')}
                aria-label={t('admin.olt.page.delete', 'Delete OLT')}
                onClick={() => setDeleteTarget(olt)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [brandLabel, t],
  );

  if (isLoading) {
    return <PageSkeleton variant="table" rows={5} />;
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('admin.olt.page.loadFailed', 'Failed to load OLT nodes')}
          description={t('admin.olt.page.loadFailedHint', 'Could not load GPON/EPON headend inventory.')}
          actionLabel={t('admin.customers.list.retry', 'Retry')}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const brandItems = [{ value: ALL_BRANDS, label: t('admin.olt.page.allVendors', 'All vendors') }, ...brands.map((b) => ({ value: b.value, label: b.label }))];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.olt.page.title', 'OLT Nodes (GPON / EPON)')}
        subtitle={t('admin.olt.page.subtitle', 'Manage fiber terminal headends, PON ports and synchronized ONUs.')}
        breadcrumb={[
          { label: t('nav.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('admin.olt.page.breadcrumbNetwork', 'Network Ops'), href: '/admin/olt' },
          { label: t('admin.olt.page.breadcrumbNodes', 'OLT Nodes') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting || summary?.olts === 0} className="h-9">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {t('admin.olt.page.export', 'Export Directory')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedOlt(null);
                setModalOpen(true);
              }}
              className="h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('admin.olt.page.onboard', 'Onboard New OLT')}
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon — tenant-wide totals from the API, not just this page */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.olt.page.kpiNodes', 'OLT Nodes')}</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {summary?.olts ?? 0}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('admin.olt.page.kpiNodesHint', 'Registered headends')}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.olt.page.kpiTotal', 'Total ONUs')}</span>
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {summary?.onusTotal ?? 0}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('admin.olt.page.kpiTotalHint', 'From the last sync of each OLT')}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.olt.page.kpiOnline', 'Online ONUs')}</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summary?.onusOnline ?? 0}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('admin.olt.page.kpiOnlineHint', '{pct}% online', { pct: healthPct })}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.olt.page.kpiOffline', 'Offline / LOS')}</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {summary?.onusOffline ?? 0}
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{t('admin.olt.page.kpiOfflineHint', 'Not online at last sync')}</p>
        </div>
      </div>

      <DataTable urlState
        columns={columns}
        data={list}
        isLoading={isFetching && !list.length}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.olt.page.search', 'Search OLT name, vendor or IP...')}
        server={table.server(data.meta.total)}
        toolbarActions={
          <div className="w-44">
            <Select
              items={brandItems}
              value={brandFilter}
              onValueChange={(val) => {
                if (!val) return;
                setBrandFilter(String(val));
                resetPage();
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t('admin.olt.page.allVendors', 'All vendors')} />
              </SelectTrigger>
              <SelectContent>
                {brandItems.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle={t('admin.olt.page.emptyTitle', 'No OLT nodes found')}
        emptyDescription={
          search || brandFilter !== ALL_BRANDS
            ? t('admin.olt.page.emptyFiltered', 'No OLT matches the current search.')
            : t('admin.olt.page.emptyHint', 'Onboard an OLT to start synchronizing its ONUs.')
        }
      />

      <OltModal
        key={selectedOlt?.id ?? 'new'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        olt={selectedOlt}
        brands={brands}
      />

      {diagnosticsOlt && (
        <OltDiagnosticsModal
          open={!!diagnosticsOlt}
          onOpenChange={(open) => !open && setDiagnosticsOlt(null)}
          oltId={diagnosticsOlt.id}
          oltName={diagnosticsOlt.name}
        />
      )}

      <ConfirmDialog
        open={!!rebootTarget}
        onOpenChange={(open) => !open && setRebootTarget(null)}
        title={t('admin.olt.page.resetTitle', 'Reset {name} connection?', { name: rebootTarget?.name ?? 'OLT' })}
        description={t('admin.olt.page.resetDesc', 'Sends the vendor line-refresh command to the OLT and clears its cached session. Connected subscribers may see a short interruption.')}
        confirmLabel={t('admin.olt.page.resetConfirm', 'Reset connection')}
        onConfirm={handleReboot}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.olt.page.removeTitle', 'Remove OLT Node?')}
        description={t('admin.olt.page.removeDesc', 'Remove {name}? Its synchronized ONU records are deleted as well.', { name: deleteTarget?.name ?? t('admin.olt.page.thisOlt', 'this OLT') })}
        confirmLabel={t('admin.olt.page.delete', 'Delete OLT')}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
