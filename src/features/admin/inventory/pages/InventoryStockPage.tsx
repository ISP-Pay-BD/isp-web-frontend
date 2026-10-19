'use client';

import { Suspense, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  AlertOctagon,
  TrendingUp,
  Boxes,
  Layers,
  MapPin,
  MoreHorizontal,
  ArrowRightLeft,
  SlidersHorizontal,
  PackageMinus,
  PackagePlus,
  ChevronDown,
  History,
  Warehouse,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, PageSkeleton } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { cn } from '@/lib/utils';
import {
  INVENTORY_URL,
  idParam,
  mapStockRow,
  type StockMovementType,
  type StockRow,
  type StockTransaction,
  type StockTxnType,
} from '../api';
import { useStock, useStockTransactions } from '../hooks/use-stock';
import { useStoreLocationOptions } from '../hooks/use-store-locations';
import { useInventorySummary } from '../hooks/use-inventory-summary';
import { StockMovementDialog, type StockMovementPrefill } from '../components/StockMovementDialog';
import { KpiTile } from '../shared/KpiTile';
import { ListState } from '../shared/ListState';
import { OptionSelect, type SelectOption } from '../shared/OptionSelect';
import { fmtDateTime } from '../shared/form-utils';
import { useUrlParam } from '@/hooks/use-url-state';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '../shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

type Translate = ReturnType<typeof useTranslations>;

function txnTypeOptions(t: Translate): SelectOption[] {
  return [
    { value: 'in', label: t('admin.inventory.stock.type.in', 'Stock in') },
    { value: 'out', label: t('admin.inventory.stock.type.out', 'Stock out') },
    { value: 'adjust', label: t('admin.inventory.stock.type.adjust', 'Adjustment') },
    { value: 'transfer', label: t('admin.inventory.stock.type.transfer', 'Transfer') },
    { value: 'issue', label: t('admin.inventory.stock.type.issue', 'CPE issue') },
    { value: 'return', label: t('admin.inventory.stock.type.return', 'CPE return') },
  ];
}

const TXN_BADGE: Record<string, string> = {
  in: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  return: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  out: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  issue: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  adjust: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  transfer: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
};

/** Movement quantity as a signed change at `location` (transfer = units moved). */
function movementQty(t: StockTransaction): string {
  const q = Math.abs(t.quantity);
  if (t.type === 'in' || t.type === 'return') return `+${q}`;
  if (t.type === 'out' || t.type === 'issue') return `−${q}`;
  if (t.type === 'adjust') return t.quantity > 0 ? `+${t.quantity}` : t.quantity < 0 ? `−${q}` : '0';
  return String(q);
}

type MovementState = { type: StockMovementType; prefill?: StockMovementPrefill };

export function InventoryStockPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" rows={8} />}>
      <InventoryStockView />
    </Suspense>
  );
}

function InventoryStockView() {
  const t = useTranslations();
  const [locationId, setLocationId] = useUrlParam('location_id');
  const [tab, setTab] = useState('on-hand');
  const [movement, setMovement] = useState<MovementState | null>(null);
  const summary = useInventorySummary();
  const locationsQuery = useStoreLocationOptions();
  const locationOptions = useMemo(
    () => (locationsQuery.data ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locationsQuery.data],
  );
  const s = summary.data;

  const locationFilter = (onChange: () => void) => (
    <OptionSelect
      value={locationId}
      onChange={(v) => {
        setLocationId(v);
        onChange();
      }}
      options={locationOptions}
      noneLabel={t('admin.inventory.stock.allLocations', 'All locations')}
      className="h-9 w-48 text-xs"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.inventory.stock.title', 'Stock Levels & Warehouse Valuation')}
        subtitle={t('admin.inventory.stock.subtitle', 'On-hand quantity per store location, valuation and every stock movement.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.inventory', 'Inventory'), href: '/admin/inventory/items' },
          { label: t('admin.inventory.stock.crumb', 'Stock Levels') },
        ]}
        actions={
          <Can menu={MENU} action="create">
            <div className="flex items-center gap-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 text-sm font-medium hover:bg-accent/60 transition-colors">
                  {t('admin.inventory.stock.moreMovements', 'More Movements')}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setMovement({ type: 'out', prefill: { locationId } })}>
                    <PackageMinus className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuOut', 'Stock Out')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMovement({ type: 'adjust', prefill: { locationId } })}>
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuAdjust', 'Adjust / Audit Count')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMovement({ type: 'transfer', prefill: { locationId } })}>
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.type.transfer', 'Transfer')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => setMovement({ type: 'in', prefill: { locationId } })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.inventory.stock.menuIn', 'Stock In')}
              </Button>
            </div>
          </Can>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label={t('admin.inventory.stock.kpiValuation', 'Total Valuation')}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          value={s ? formatBdtWithSymbol(s.stockValue) : '—'}
          hint={t('admin.inventory.locations.kpiValueHint', 'On-hand quantity × unit price')}
        />
        <KpiTile
          label={t('admin.inventory.stock.kpiUnits', 'Physical Units')}
          icon={<Boxes className="h-4 w-4 text-primary" />}
          value={s ? formatCount(s.stockQuantity) : '—'}
          hint={t('admin.inventory.stock.kpiUnitsHint', 'Items across all locations')}
        />
        <KpiTile
          label={t('admin.inventory.stock.kpiLines', 'Stock Lines')}
          icon={<Layers className="h-4 w-4 text-emerald-500" />}
          value={s ? formatCount(s.stockRows) : '—'}
          hint={t('admin.inventory.stock.kpiLinesHint', 'Item × location records')}
        />
        <KpiTile
          label={t('admin.inventory.stock.kpiOut', 'Out of Stock')}
          icon={<AlertOctagon className="h-4 w-4 text-amber-500" />}
          value={s ? formatCount(s.outOfStockRows) : '—'}
          hint={t('admin.inventory.stock.kpiOutHint', 'Lines at zero or below')}
          hintClassName="text-amber-600 dark:text-amber-400 font-medium"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="space-y-4">
        <TabsList>
          <TabsTrigger value="on-hand" className="gap-1.5 text-xs">
            <Warehouse className="h-3.5 w-3.5" /> {t('admin.inventory.stock.tabOnHand', 'On Hand')}
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" /> {t('admin.inventory.stock.tabMovements', 'Movements')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="on-hand">
          <OnHandTable locationId={locationId} locationFilter={locationFilter} onMovement={setMovement} />
        </TabsContent>
        <TabsContent value="movements">
          <MovementsTable locationId={locationId} locationFilter={locationFilter} />
        </TabsContent>
      </Tabs>

      <StockMovementDialog
        open={movement !== null}
        onOpenChange={(o) => !o && setMovement(null)}
        type={movement?.type ?? 'in'}
        prefill={movement?.prefill}
      />
    </div>
  );
}

function OnHandTable({
  locationId,
  locationFilter,
  onMovement,
}: {
  locationId: string;
  locationFilter: (onChange: () => void) => React.ReactNode;
  onMovement: (m: MovementState) => void;
}) {
  const t = useTranslations();
  const table = useServerTable();
  const query = useStock({ page: table.page, pageSize: table.pageSize, search: table.search, locationId });
  const [exporting, setExporting] = useState(false);
  const page = query.data;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(`${INVENTORY_URL}/stock`, {
          search: table.search || undefined,
          location_id: idParam(locationId),
        })
      ).map(mapStockRow);
      downloadCsv(
        `inventory_stock_${todayYmd()}.csv`,
        [
          t('admin.inventory.items.colItem', 'Item'),
          t('admin.inventory.items.colCategory', 'Category'),
          t('admin.inventory.items.csvSub', 'Sub-category'),
          t('admin.inventory.stock.colLocation', 'Location'),
          t('admin.inventory.stock.csvQty', 'Quantity'),
          t('admin.inventory.items.csvPrice', 'Unit Price (BDT)'),
          t('admin.inventory.stock.csvValue', 'Value (BDT)'),
          t('admin.inventory.stock.colUpdated', 'Updated'),
        ],
        rows.map((r) => [r.itemName, r.category, r.subcategory, r.locationName, r.quantity, r.unitPrice, r.value, r.updatedAt]),
      );
      toast.success(t('admin.inventory.stock.exported', 'Exported {n} stock lines', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.inventory.categories.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<StockRow, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: t('admin.inventory.stock.colItem', 'Stock Item'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Boxes className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{r.itemName}</span>
                <span className="text-xs text-muted-foreground">
                  {r.itemId ? r.subcategory || '—' : t('admin.inventory.stock.removed', 'Removed from catalogue')}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: t('admin.inventory.items.colCategory', 'Category'),
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background/50 font-normal">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'locationName',
        header: t('admin.inventory.stock.colStoreLocation', 'Store Location'),
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{row.original.locationName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: t('admin.inventory.stock.colQty', 'On-Hand Qty'),
        size: 110,
        cell: ({ row }) => (
          <span className="font-bold text-base tabular-nums text-foreground">{formatCount(row.original.quantity)}</span>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: t('admin.inventory.items.colPrice', 'Unit Price'),
        size: 120,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">{formatBdtWithSymbol(row.original.unitPrice)}</span>
        ),
      },
      {
        accessorKey: 'value',
        header: t('admin.inventory.stock.colValuation', 'Valuation'),
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">{formatBdtWithSymbol(row.original.value)}</span>
        ),
      },
      {
        id: 'status',
        header: t('admin.inventory.stock.colHealth', 'Stock Health'),
        size: 120,
        cell: ({ row }) =>
          row.original.quantity <= 0 ? (
            <Badge variant="outline" tone="danger">
              {t('admin.inventory.stock.kpiOut', 'Out of Stock')}
            </Badge>
          ) : (
            <Badge variant="outline" tone="success">
              {t('admin.inventory.stock.inStock', 'In Stock')}
            </Badge>
          ),
      },
      {
        accessorKey: 'updatedAt',
        header: t('admin.inventory.stock.colUpdated', 'Updated'),
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.updatedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          const prefill = { itemId: r.itemId, locationId: r.locationId };
          return (
            <Can menu={MENU} action="create">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t('admin.inventory.common.rowActions', 'Row actions')}
                  disabled={!r.itemId}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors disabled:opacity-40"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{t('admin.inventory.stock.operations', 'Stock Operations')}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'in', prefill })}>
                    <PackagePlus className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuIn', 'Stock In')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'out', prefill })}>
                    <PackageMinus className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuOut', 'Stock Out')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'transfer', prefill })}>
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuTransfer', 'Transfer to Another Store')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onMovement({ type: 'adjust', prefill })}>
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.stock.menuAdjust', 'Adjust / Audit Count')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          );
        },
      },
    ],
    [onMovement, t],
  );

  return (
    <ListState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!table.search && !locationId && page?.meta.total === 0}
      errorTitle={t('admin.inventory.stock.loadFailed', 'Failed to load stock')}
      emptyTitle={t('admin.inventory.stock.emptyNone', 'No stock recorded yet')}
      emptyDescription={t('admin.inventory.stock.emptyNoneHint', 'Use Stock In to receive items into a store location.')}
      icon={<Warehouse className="h-5 w-5" />}
    >
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.inventory.stock.search', 'Search by item name...')}
        emptyTitle={t('admin.inventory.stock.emptyFiltered', 'No stock lines match your filters')}
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
            {locationFilter(table.resetPage)}
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.inventory.categories.exporting', 'Exporting…') : t('admin.inventory.categories.export', 'Export CSV')}
            </Button>
          </div>
        }
      />
    </ListState>
  );
}

function MovementsTable({
  locationId,
  locationFilter,
}: {
  locationId: string;
  locationFilter: (onChange: () => void) => React.ReactNode;
}) {
  const t = useTranslations();
  const typeOptions = useMemo(() => txnTypeOptions(t), [t]);
  const table = useServerTable();
  const [type, setType] = useState('');
  const query = useStockTransactions({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    locationId,
    type: type as StockTxnType | '',
  });
  const page = query.data;

  const columns = useMemo<LegacyColumnDef<StockTransaction, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('admin.inventory.stock.colDate', 'Date'),
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: t('admin.inventory.stock.colType', 'Type'),
        size: 110,
        cell: ({ row }) => {
          const kind = row.original.type;
          return (
            <Badge variant="outline" className={cn('capitalize', TXN_BADGE[kind] ?? 'bg-muted text-muted-foreground')}>
              {typeOptions.find((o) => o.value === kind)?.label ?? kind}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'itemName',
        header: t('admin.inventory.items.colItem', 'Item'),
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-sm line-clamp-1">{row.original.itemName}</span>
        ),
      },
      {
        accessorKey: 'locationName',
        header: t('admin.inventory.stock.colLocation', 'Location'),
        size: 220,
        cell: ({ row }) => {
          const txn = row.original;
          return (
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1.5 text-foreground">
                <span>{txn.locationName || '—'}</span>
                {txn.type === 'transfer' ? (
                  <>
                    <ArrowRightLeft className="h-3 w-3 text-primary shrink-0" />
                    <span>{txn.toLocationName || '—'}</span>
                  </>
                ) : null}
              </div>
              {txn.customerName ? (
                <p className="text-muted-foreground">
                  {txn.customerName}
                  {txn.serialNo ? ` · ${t('admin.inventory.stock.serial', 'SN {sn}', { sn: txn.serialNo })}` : ''}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: t('admin.inventory.stock.colQtyShort', 'Qty'),
        size: 90,
        cell: ({ row }) => (
          <span className="font-bold text-sm font-mono tabular-nums text-foreground">{movementQty(row.original)}</span>
        ),
      },
      {
        accessorKey: 'balanceAfter',
        header: t('admin.inventory.stock.colBalance', 'Balance After'),
        size: 110,
        cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.balanceAfter}</span>,
      },
      {
        accessorKey: 'unitCost',
        header: t('admin.inventory.stock.colCost', 'Unit Cost'),
        size: 110,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.unitCost === null ? '—' : formatBdtWithSymbol(row.original.unitCost)}
          </span>
        ),
      },
      {
        accessorKey: 'reference',
        header: t('admin.inventory.stock.colReference', 'Reference / Note'),
        size: 200,
        cell: ({ row }) => {
          const txn = row.original;
          return (
            <div className="text-xs">
              <span className="text-foreground">{txn.reference || '—'}</span>
              {txn.note ? <p className="text-muted-foreground line-clamp-1">{txn.note}</p> : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdByName',
        header: t('admin.inventory.stock.colBy', 'By'),
        size: 130,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdByName || '—'}</span>,
      },
    ],
    [t, typeOptions],
  );

  return (
    <ListState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!table.search && !locationId && !type && page?.meta.total === 0}
      errorTitle={t('admin.inventory.stock.movementsFailed', 'Failed to load stock movements')}
      emptyTitle={t('admin.inventory.stock.movementsEmpty', 'No stock movements yet')}
      emptyDescription={t('admin.inventory.stock.movementsEmptyHint', 'Stock in, out, adjustments, transfers and CPE issues appear here.')}
      icon={<History className="h-5 w-5" />}
    >
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.inventory.stock.searchMovements', 'Search item, reference, note...')}
        emptyTitle={t('admin.inventory.stock.movementsFiltered', 'No movements match your filters')}
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
            {locationFilter(table.resetPage)}
            <OptionSelect
              value={type}
              onChange={(v) => {
                setType(v);
                table.resetPage();
              }}
              options={typeOptions}
              noneLabel={t('admin.inventory.stock.allTypes', 'All types')}
              className="h-9 w-36 text-xs"
            />
          </div>
        }
      />
    </ListState>
  );
}
