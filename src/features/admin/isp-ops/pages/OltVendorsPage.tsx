'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOltCatalog } from '@/features/admin/olt/hooks/useOltDevices';
import { parseBackendDate, type OltBrandOption, type OltBrandUsage } from '@/features/admin/olt/types';
import { formatDateTime } from '@/lib/format/date';
import { Download, Server, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '@/i18n/locale-context';

/** One vendor: the form's brand catalogue joined with this tenant's usage. */
interface VendorRow {
  id: string;
  name: string;
  code: string;
  inCatalog: boolean;
  syncSupported: boolean;
  olts: number;
  onusTotal: number;
  onusOnline: number;
  lastSyncedAt: string | null;
}

function buildRows(brands: OltBrandOption[], usage: OltBrandUsage[]): VendorRow[] {
  const used = new Map(usage.map((u) => [u.brand.toLowerCase(), u]));
  const rows: VendorRow[] = brands.map((b) => {
    const u = used.get(b.value.toLowerCase());
    used.delete(b.value.toLowerCase());
    return {
      id: b.value,
      name: b.label,
      code: b.value,
      inCatalog: true,
      syncSupported: b.syncSupported,
      olts: u?.olts ?? 0,
      onusTotal: u?.onusTotal ?? 0,
      onusOnline: u?.onusOnline ?? 0,
      lastSyncedAt: u?.lastSyncedAt ?? null,
    };
  });
  // Brands stored on older OLT rows that the current form no longer offers.
  for (const u of used.values()) {
    rows.push({
      id: `legacy:${u.brand}`,
      name: u.label,
      code: u.brand,
      inCatalog: false,
      syncSupported: u.syncSupported,
      olts: u.olts,
      onusTotal: u.onusTotal,
      onusOnline: u.onusOnline,
      lastSyncedAt: u.lastSyncedAt,
    });
  }
  return rows.sort((a, b) => b.olts - a.olts || a.name.localeCompare(b.name));
}

const searchFilter = (row: LegacyRow<VendorRow>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  return row.original.name.toLowerCase().includes(q) || row.original.code.toLowerCase().includes(q);
};

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function syncedLabel(value: string | null): string {
  const d = parseBackendDate(value);
  return d ? formatDateTime(d) : '—';
}

export function OltVendorsPage() {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = useOltCatalog();
  const rows = useMemo(() => (data ? buildRows(data.brands, data.usage) : []), [data]);

  const catalogCount = rows.filter((r) => r.inCatalog).length;
  const vendorsInUse = rows.filter((r) => r.olts > 0).length;
  const driverCount = rows.filter((r) => r.inCatalog && r.syncSupported).length;

  const handleExportCsv = () => {
    const headers = ['Vendor', 'Code', 'Sync Driver', 'OLTs', 'Online ONUs', 'Total ONUs', 'Last Sync'];
    const lines = rows.map((r) =>
      [r.name, r.code, r.syncSupported ? 'installed' : 'missing', r.olts, r.onusOnline, r.onusTotal, r.lastSyncedAt ?? '']
        .map(csvCell)
        .join(','),
    );
    const blob = new Blob([[headers.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `olt_vendors_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    toast.success(t('admin.ops.oltVendors.exported', 'OLT vendors exported to CSV'));
  };

  const columns = useMemo<LegacyColumnDef<VendorRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.oltVendors.colVendor', 'Vendor / Brand'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
              <span className="text-xs text-muted-foreground block font-mono">
                {row.original.code}
                {!row.original.inCatalog && ` · ${t('admin.ops.oltVendors.notInForm', 'not in the OLT form')}`}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'syncSupported',
        header: t('admin.ops.oltVendors.colDriver', 'Sync / Diagnostics Driver'),
        size: 200,
        cell: ({ row }) =>
          row.original.syncSupported ? (
            <Badge variant="outline" tone="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {t('admin.ops.oltVendors.installed', 'Installed')}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground">
              <XCircle className="h-3 w-3" />
              {t('admin.ops.oltVendors.notAvailable', 'Not available')}
            </Badge>
          ),
      },
      {
        accessorKey: 'olts',
        header: t('admin.ops.oltVendors.colOlts', 'OLTs'),
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-mono tabular-nums font-semibold">
            {row.original.olts}
          </Badge>
        ),
      },
      {
        accessorKey: 'onusTotal',
        header: t('admin.ops.oltVendors.colOnus', 'ONUs (online / total)'),
        size: 170,
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.original.onusOnline}</span>
            <span className="text-muted-foreground"> / {row.original.onusTotal}</span>
          </span>
        ),
      },
      {
        accessorKey: 'lastSyncedAt',
        header: t('admin.ops.oltVendors.colLastSync', 'Last Sync'),
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{syncedLabel(row.original.lastSyncedAt)}</span>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.ops.oltVendors.loadFailed', 'Failed to load vendors')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.oltVendors.title', 'OLT Multi-Vendor Drivers')}
        subtitle={t('admin.ops.oltVendors.subtitle', 'Brands the OLT form supports, which have a sync / diagnostics driver on this server, and how many of your OLTs use each.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('nav.olt', 'OLT'), href: '/admin/olt' },
          { label: t('nav.olt-vendors', 'Vendors') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!rows.length} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {t('admin.ops.oltVendors.exportDirectory', 'Export Directory')}
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.ops.oltVendors.kpiSupported', 'Supported Vendors')}</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {catalogCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('admin.ops.oltVendors.hintSupported', 'Brands the OLT form accepts')}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.ops.oltVendors.kpiInUse', 'Vendors In Use')}</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {vendorsInUse}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {t('admin.ops.oltVendors.acrossOlts', 'Across {n} OLTs', { n: data.summary.olts })}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">{t('admin.ops.oltVendors.kpiDrivers', 'Sync Drivers')}</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {driverCount}
            <span className="text-sm font-medium text-muted-foreground"> / {catalogCount}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('admin.ops.oltVendors.hintDrivers', 'Installed on this server')}</p>
        </div>
      </div>

      {/* Main Data Table — the catalogue is a fixed, small list */}
      <DataTable urlState
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder={t('admin.ops.oltVendors.searchPlaceholder', 'Search vendor by name or code...')}
        emptyTitle={t('admin.ops.oltVendors.emptyTitle', 'No OLT vendors')}
        emptyDescription={t('admin.ops.oltVendors.emptyHint', 'The server returned no OLT brand catalogue.')}
      />
    </div>
  );
}
