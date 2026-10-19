'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { Plus, Download, ArrowRightLeft, Boxes, Truck, Building2 } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INVENTORY_URL, mapStockTransaction, type StockTransaction } from '@/features/admin/inventory/api';
import { useStockTransactions } from '@/features/admin/inventory/hooks/use-stock';
import { useInventorySummary } from '@/features/admin/inventory/hooks/use-inventory-summary';
import { StockMovementDialog } from '@/features/admin/inventory/components/StockMovementDialog';
import { KpiTile } from '@/features/admin/inventory/shared/KpiTile';
import { ListState } from '@/features/admin/inventory/shared/ListState';
import { fmtDateTime } from '@/features/admin/inventory/shared/form-utils';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '@/features/admin/inventory/shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

/** Inter-location stock transfers = GET /v1/inventory/transactions?type=transfer (immediate, no transit state). */
export function StockTransfersPage() {
  const t = useTranslations();
  const table = useServerTable();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const query = useStockTransactions({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    type: 'transfer',
    fromDate,
    toDate,
  });
  const summary = useInventorySummary();
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const page = query.data;
  const s = summary.data;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(`${INVENTORY_URL}/transactions`, {
          type: 'transfer',
          search: table.search || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })
      ).map(mapStockTransaction);
      downloadCsv(
        `stock_transfers_${todayYmd()}.csv`,
        ['Date', 'Item', 'From Location', 'To Location', 'Quantity', 'Reference', 'Note', 'By'],
        rows.map((r) => [r.createdAt, r.itemName, r.locationName, r.toLocationName, Math.abs(r.quantity), r.reference, r.note, r.createdByName]),
      );
      toast.success(t('admin.ops.stockTransfers.exported', 'Exported {n} transfers', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.ops.stockTransfers.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<StockTransaction, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: t('admin.ops.stockTransfers.colItem', 'Stock Item'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground text-sm line-clamp-1">{row.original.itemName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'locationName',
        header: t('admin.ops.stockTransfers.colRoute', 'Transfer Route (Origin → Destination)'),
        size: 320,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground px-2 py-1 rounded bg-muted/80 border border-border/60">
                {r.locationName || '—'}
              </span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                {r.toLocationName || '—'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: t('admin.ops.stockTransfers.colQty', 'Quantity'),
        size: 100,
        cell: ({ row }) => (
          <span className="font-bold text-sm font-mono tabular-nums text-foreground">
            {formatCount(Math.abs(row.original.quantity))}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.ops.stockTransfers.colDate', 'Transfer Date'),
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'createdByName',
        header: t('admin.ops.stockTransfers.colBy', 'By'),
        size: 140,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdByName || '—'}</span>,
      },
      {
        accessorKey: 'reference',
        header: t('admin.ops.stockTransfers.colRef', 'Reference / Note'),
        size: 220,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="text-xs">
              <span className="text-foreground">{r.reference || '—'}</span>
              {r.note ? <p className="text-muted-foreground line-clamp-1">{r.note}</p> : null}
            </div>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.stockTransfers.title', 'Stock Transfers & Movement')}
        subtitle={t('admin.ops.stockTransfers.subtitle', 'Inter-warehouse dispatches and POP replenishment. Transfers move stock immediately.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.inventory', 'Inventory'), href: '/admin/inventory/items' },
          { label: t('admin.ops.stockTransfers.crumb', 'Stock Transfers') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.ops.stockTransfers.exporting', 'Exporting…') : t('admin.ops.stockTransfers.export', 'Export Manifest')}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.ops.stockTransfers.newTransfer', 'New Transfer')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label={t('admin.ops.stockTransfers.kpiTransfers', 'Total Transfers')}
          icon={<Truck className="h-4 w-4 text-primary" />}
          value={s ? formatCount(s.transfersCount) : '—'}
          hint={t('admin.ops.stockTransfers.kpiTransfersHint', 'Movements logged')}
        />
        <KpiTile
          label={t('admin.ops.stockTransfers.kpiUnits', 'Total Units Moved')}
          icon={<Boxes className="h-4 w-4 text-primary" />}
          value={s ? formatCount(s.transfersQty) : '—'}
          hint={t('admin.ops.stockTransfers.kpiUnitsHint', 'Units transferred')}
        />
        <KpiTile
          label={t('admin.ops.stockTransfers.kpiLocations', 'Store Locations')}
          icon={<Building2 className="h-4 w-4 text-emerald-500" />}
          value={s ? formatCount(s.locationsCount) : '—'}
          hint={t('admin.ops.stockTransfers.kpiLocationsHint', 'Possible origins / destinations')}
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && !fromDate && !toDate && page?.meta.total === 0}
        errorTitle={t('admin.ops.stockTransfers.loadFailed', 'Failed to load transfers')}
        emptyTitle={t('admin.ops.stockTransfers.emptyNone', 'No transfers yet')}
        emptyDescription={t('admin.ops.stockTransfers.emptyHint', 'Use New Transfer to move stock between store locations.')}
        icon={<Truck className="h-5 w-5" />}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.ops.stockTransfers.searchPlaceholder', 'Search by item, reference or note...')}
          emptyTitle={t('admin.ops.stockTransfers.emptyFiltered', 'No transfers match your filters')}
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
          toolbarActions={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                aria-label={t('admin.ops.stockTransfers.fromDate', 'From date')}
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  table.resetPage();
                }}
                className="h-9 w-36 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">{t('admin.ops.stockTransfers.dateTo', 'to')}</span>
              <Input
                type="date"
                aria-label={t('admin.ops.stockTransfers.toDate', 'To date')}
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  table.resetPage();
                }}
                className="h-9 w-36 text-xs font-mono"
              />
            </div>
          }
        />
      </ListState>

      <StockMovementDialog open={modalOpen} onOpenChange={setModalOpen} type="transfer" lockType />
    </div>
  );
}
