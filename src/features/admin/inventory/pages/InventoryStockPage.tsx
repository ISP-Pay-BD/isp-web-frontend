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
import { useUrlParam } from '../shared/hooks';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '../shared/table-utils';

const MENU = 'inventory_purchess';

const TXN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'in', label: 'Stock in' },
  { value: 'out', label: 'Stock out' },
  { value: 'adjust', label: 'Adjustment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'issue', label: 'CPE issue' },
  { value: 'return', label: 'CPE return' },
];

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
      noneLabel="All locations"
      className="h-9 w-48 text-xs"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels & Warehouse Valuation"
        subtitle="On-hand quantity per store location, valuation and every stock movement."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Stock Levels' },
        ]}
        actions={
          <Can menu={MENU} action="create">
            <div className="flex items-center gap-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 text-sm font-medium hover:bg-accent/60 transition-colors">
                  More Movements
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setMovement({ type: 'out', prefill: { locationId } })}>
                    <PackageMinus className="h-3.5 w-3.5 mr-2" />
                    Stock Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMovement({ type: 'adjust', prefill: { locationId } })}>
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                    Adjust / Audit Count
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMovement({ type: 'transfer', prefill: { locationId } })}>
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                    Transfer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => setMovement({ type: 'in', prefill: { locationId } })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Stock In
              </Button>
            </div>
          </Can>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total Valuation"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          value={s ? formatBdtWithSymbol(s.stockValue) : '—'}
          hint="On-hand quantity × unit price"
        />
        <KpiTile
          label="Physical Units"
          icon={<Boxes className="h-4 w-4 text-primary" />}
          value={s ? s.stockQuantity.toLocaleString() : '—'}
          hint="Items across all locations"
        />
        <KpiTile
          label="Stock Lines"
          icon={<Layers className="h-4 w-4 text-emerald-500" />}
          value={s ? s.stockRows.toLocaleString() : '—'}
          hint="Item × location records"
        />
        <KpiTile
          label="Out of Stock"
          icon={<AlertOctagon className="h-4 w-4 text-amber-500" />}
          value={s ? s.outOfStockRows.toLocaleString() : '—'}
          hint="Lines at zero or below"
          hintClassName="text-amber-600 dark:text-amber-400 font-medium"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="space-y-4">
        <TabsList>
          <TabsTrigger value="on-hand" className="gap-1.5 text-xs">
            <Warehouse className="h-3.5 w-3.5" /> On Hand
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" /> Movements
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
        ['Item', 'Category', 'Sub-category', 'Location', 'Quantity', 'Unit Price (BDT)', 'Value (BDT)', 'Updated'],
        rows.map((r) => [r.itemName, r.category, r.subcategory, r.locationName, r.quantity, r.unitPrice, r.value, r.updatedAt]),
      );
      toast.success(`Exported ${rows.length} stock lines`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<StockRow, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: 'Stock Item',
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
                  {r.itemId ? r.subcategory || '—' : 'Removed from catalogue'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background/50 font-normal">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'locationName',
        header: 'Store Location',
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
        header: 'On-Hand Qty',
        size: 110,
        cell: ({ row }) => (
          <span className="font-bold text-base tabular-nums text-foreground">{row.original.quantity.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: 'Unit Price',
        size: 120,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">{formatBdtWithSymbol(row.original.unitPrice)}</span>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Valuation',
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">{formatBdtWithSymbol(row.original.value)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Stock Health',
        size: 120,
        cell: ({ row }) =>
          row.original.quantity <= 0 ? (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
              Out of Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              In Stock
            </Badge>
          ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
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
                  disabled={!r.itemId}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors disabled:opacity-40"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Stock Operations</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'in', prefill })}>
                    <PackagePlus className="h-3.5 w-3.5 mr-2" />
                    Stock In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'out', prefill })}>
                    <PackageMinus className="h-3.5 w-3.5 mr-2" />
                    Stock Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMovement({ type: 'transfer', prefill })}>
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                    Transfer to Another Store
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onMovement({ type: 'adjust', prefill })}>
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                    Adjust / Audit Count
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          );
        },
      },
    ],
    [onMovement],
  );

  return (
    <ListState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!table.search && !locationId && page?.meta.total === 0}
      errorTitle="Failed to load stock"
      emptyTitle="No stock recorded yet"
      emptyDescription="Use Stock In to receive items into a store location."
      icon={<Warehouse className="h-5 w-5" />}
    >
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowId={(r) => r.id}
        searchPlaceholder="Search by item name..."
        emptyTitle="No stock lines match your filters"
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
              {exporting ? 'Exporting…' : 'Export CSV'}
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
        header: 'Date',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 110,
        cell: ({ row }) => {
          const t = row.original.type;
          return (
            <Badge variant="outline" className={cn('capitalize', TXN_BADGE[t] ?? 'bg-muted text-muted-foreground')}>
              {TXN_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'itemName',
        header: 'Item',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-sm line-clamp-1">{row.original.itemName}</span>
        ),
      },
      {
        accessorKey: 'locationName',
        header: 'Location',
        size: 220,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1.5 text-foreground">
                <span>{t.locationName || '—'}</span>
                {t.type === 'transfer' ? (
                  <>
                    <ArrowRightLeft className="h-3 w-3 text-primary shrink-0" />
                    <span>{t.toLocationName || '—'}</span>
                  </>
                ) : null}
              </div>
              {t.customerName ? (
                <p className="text-muted-foreground">
                  {t.customerName}
                  {t.serialNo ? ` · SN ${t.serialNo}` : ''}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        size: 90,
        cell: ({ row }) => (
          <span className="font-bold text-sm font-mono tabular-nums text-foreground">{movementQty(row.original)}</span>
        ),
      },
      {
        accessorKey: 'balanceAfter',
        header: 'Balance After',
        size: 110,
        cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.balanceAfter}</span>,
      },
      {
        accessorKey: 'unitCost',
        header: 'Unit Cost',
        size: 110,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.unitCost === null ? '—' : formatBdtWithSymbol(row.original.unitCost)}
          </span>
        ),
      },
      {
        accessorKey: 'reference',
        header: 'Reference / Note',
        size: 200,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="text-xs">
              <span className="text-foreground">{t.reference || '—'}</span>
              {t.note ? <p className="text-muted-foreground line-clamp-1">{t.note}</p> : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdByName',
        header: 'By',
        size: 130,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdByName || '—'}</span>,
      },
    ],
    [],
  );

  return (
    <ListState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!table.search && !locationId && !type && page?.meta.total === 0}
      errorTitle="Failed to load stock movements"
      emptyTitle="No stock movements yet"
      emptyDescription="Stock in, out, adjustments, transfers and CPE issues appear here."
      icon={<History className="h-5 w-5" />}
    >
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowId={(r) => r.id}
        searchPlaceholder="Search item, reference, note..."
        emptyTitle="No movements match your filters"
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
              options={TXN_TYPE_OPTIONS}
              noneLabel="All types"
              className="h-9 w-36 text-xs"
            />
          </div>
        }
      />
    </ListState>
  );
}
