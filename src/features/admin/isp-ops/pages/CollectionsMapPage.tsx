'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { MapPin, Users, Navigation, DollarSign, Receipt, MapPinOff, Info } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { GeoMap } from '@/components/shared/GeoMap';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useUrlParam } from '@/hooks/use-url-state';
import { useLocale } from '@/i18n/locale-context';
import {
  fmtDay,
  fmtStamp,
  todayYmd,
  useCollectionPoints,
  useCollections,
  type CollectionRow,
} from '../hooks/use-billing-config';
import { useServerTable } from '../hooks/use-server-table';

type Located = 'all' | 'yes' | 'no';
type Translate = ReturnType<typeof useLocale>['t'];
const locatedItems = (t: Translate): Record<Located, string> => ({
  all: t('admin.ops.collectionsMap.locatedAll', 'All customers'),
  yes: t('admin.ops.collectionsMap.locatedYes', 'On the map'),
  no: t('admin.ops.collectionsMap.noCoords', 'No coordinates'),
});

/** First day of the current month, local calendar. */
function monthStartYmd(): string {
  return `${todayYmd().slice(0, 8)}01`;
}

export function CollectionsMapPage() {
  const { t } = useLocale();
  const locatedLabels = locatedItems(t);
  const [from, setFrom] = useState(monthStartYmd());
  const [to, setTo] = useState(todayYmd());
  const table = useServerTable();
  const [locatedParam, setLocatedParam] = useUrlParam('located');
  const located: Located = locatedParam === 'yes' || locatedParam === 'no' ? locatedParam : 'all';
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rangeOk = Boolean(from && to && from <= to);
  const range = { from, to };
  const list = useCollections({ page: table.page, perPage: table.pageSize, search: table.search, from, to, located }, rangeOk);
  const points = useCollectionPoints(range, rangeOk);

  const markers = useMemo(
    () =>
      (points.data?.items ?? []).map((r) => ({
        id: String(r.customerId),
        latitude: r.latitude as number,
        longitude: r.longitude as number,
        color: selectedId === String(r.customerId) ? '#f75803' : '#2E8BFF',
        label: `${r.name} — ${formatBdtWithSymbol(r.collected)}`,
      })),
    [points.data, selectedId],
  );
  const selectedPoint = useMemo(
    () => (points.data?.items ?? []).find((r) => String(r.customerId) === selectedId) ?? null,
    [points.data, selectedId],
  );

  const rows = useMemo(() => list.data?.items ?? [], [list.data?.items]);

  const columns = useMemo<LegacyColumnDef<CollectionRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.collectionsMap.colCustomer', 'Customer'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const r = row.original;
          const isSelected = selectedId === String(r.customerId);
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border/60 bg-muted text-muted-foreground',
                )}
              >
                {r.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-foreground">{r.name || t('admin.ops.collectionsMap.customerFallback', 'Customer #{id}', { id: r.customerId })}</span>
                {r.mobile && <span className="block font-mono text-xs font-normal text-muted-foreground">{r.mobile}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'paymentsCount',
        header: t('admin.ops.collectionsMap.colPayments', 'Payments'),
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-muted/60 font-mono text-xs">
            {row.original.paymentsCount}
          </Badge>
        ),
      },
      {
        accessorKey: 'collected',
        header: t('admin.ops.collectionsMap.colCollected', 'Collected'),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={row.original.collected} />
          </span>
        ),
      },
      {
        accessorKey: 'lastPaidAt',
        header: t('admin.ops.collectionsMap.colLastPayment', 'Last Payment'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtStamp(row.original.lastPaidAt)}</span>,
      },
      {
        id: 'coordinates',
        header: t('admin.ops.collectionsMap.colCoords', 'Coordinates'),
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {r.located && r.latitude !== null && r.longitude !== null ? (
                `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <MapPinOff className="h-3 w-3" /> {t('admin.ops.collectionsMap.noCoords', 'No coordinates')}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const r = row.original;
          const id = String(r.customerId);
          const isSelected = selectedId === id;
          return (
            <div className="flex justify-end">
              {r.located ? (
                <Button size="sm" variant={isSelected ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setSelectedId(isSelected ? null : id)}>
                  {isSelected ? t('admin.ops.collectionsMap.focusing', 'Focusing') : t('admin.ops.collectionsMap.locate', 'Locate on Map')}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          );
        },
      },
    ],
    [selectedId, t],
  );

  if (list.isLoading && !list.data) return <PageSkeleton variant="table" rows={6} />;
  if (list.isError && !list.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.collectionsMap.loadFailed', 'Failed to load the collections map')}
        description={errorMessage(list.error, t('admin.ops.collectionsMap.loadFailedHint', 'Could not load collections.'))}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => list.refetch()}
      />
    );
  }

  const summary = list.data?.summary;
  const total = list.data?.meta.total ?? 0;

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title={t('admin.ops.collectionsMap.title', 'Collections Map')}
        subtitle={t('admin.ops.collectionsMap.subtitle', 'Where received customer payments come from — each paying customer at their saved location. Customers without saved coordinates are listed but not placed on the map.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.reports', 'Reports') },
          { label: t('nav.reports-collections-map', 'Collections Map') },
        ]}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.collectionsMap.kpiCollected', 'Total Collected')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={summary?.collected ?? 0} className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {summary ? `${fmtDay(summary.from)} – ${fmtDay(summary.to)}` : ''}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.collectionsMap.colPayments', 'Payments')}</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">{summary?.paymentsCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.collectionsMap.kpiReceived', 'received')}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.collectionsMap.kpiPaying', 'Paying Customers')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{summary?.customersCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.collectionsMap.kpiCustomersUnit', 'customers')}</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.collectionsMap.kpiMap', 'On The Map')}</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{summary?.locatedCustomers ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.collectionsMap.kpiMapped', 'mapped')}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{t('admin.ops.collectionsMap.kpiUnlocated', '{n} without coordinates', { n: summary?.unlocatedCustomers ?? 0 })}</div>
        </Card>
      </div>

      {/* Map */}
      <Card className="border-border/70 shadow-md bg-card overflow-hidden ring-1 ring-border/50">
        <div className="p-3.5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('admin.ops.collectionsMap.mapTitle', 'Payment Locations')}</h3>
              <p className="text-xs text-muted-foreground">{t('admin.ops.collectionsMap.mapHint', 'One marker per paying customer with saved coordinates.')}</p>
            </div>
          </div>

          {selectedPoint && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-semibold">
              <span>
                {selectedPoint.name} · {formatBdtWithSymbol(selectedPoint.collected)}
              </span>
              <button type="button" onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground text-xs ml-1 underline cursor-pointer">
                {t('admin.ops.collectionsMap.clear', 'Clear')}
              </button>
            </div>
          )}
        </div>

        <div className="p-2 space-y-2">
          {points.isError ? (
            <EmptyState variant="error"
              title={t('admin.ops.collectionsMap.pointsFailed', 'Could not load map points')}
              description={errorMessage(points.error)}
              actionLabel={t('admin.customers.list.retry', 'Retry')}
              onAction={() => points.refetch()}
            />
          ) : (
            <GeoMap
              markers={markers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              height={440}
              emptyMessage={
                list.data && !list.data.coordinatesAvailable
                  ? t('admin.ops.collectionsMap.coordsUnavailable', 'Customer coordinates are not available.')
                  : t('admin.ops.collectionsMap.noMarkers', 'No paying customer in this period has saved coordinates.')
              }
              className="rounded-lg overflow-hidden border border-border/60"
              renderMarker={(marker, selected) => (
                <div className="relative flex flex-col items-center cursor-pointer group">
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full border-2 border-white shadow-lg transition-transform duration-200',
                      selected ? 'scale-125 ring-4 ring-primary/40' : 'group-hover:scale-110',
                    )}
                    style={{ backgroundColor: marker.color }}
                  />
                  {selected ? (
                    <span className="mt-1.5 max-w-[180px] truncate rounded-md bg-popover px-2 py-1 text-xs font-bold text-popover-foreground shadow-md ring-1 ring-border">
                      {marker.label}
                    </span>
                  ) : null}
                </div>
              )}
            />
          )}
          {points.data?.truncated && (
            <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> {t('admin.ops.collectionsMap.truncated', 'Showing the {n} largest collections. Narrow the date range to see the rest.', { n: markers.length })}
            </p>
          )}
        </div>
      </Card>

      {/* Period */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">{t('admin.ops.collectionsMap.period', 'Period')}</span>
          <Input
            type="date"
            aria-label={t('admin.ops.collectionsMap.fromDate', 'From date')}
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              table.setPage(1);
            }}
            className={cn('h-9 w-[150px] text-xs font-mono', !rangeOk && 'border-destructive')}
          />
          <span className="text-xs text-muted-foreground">{t('admin.ops.collectionsMap.rangeTo', 'to')}</span>
          <Input
            type="date"
            aria-label={t('admin.ops.collectionsMap.toDate', 'To date')}
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value);
              table.setPage(1);
            }}
            className={cn('h-9 w-[150px] text-xs font-mono', !rangeOk && 'border-destructive')}
          />
        </CardContent>
      </Card>

      {!rangeOk && <p className="text-xs text-destructive">{t('admin.ops.collectionsMap.rangeInvalid', 'Choose a start date on or before the end date.')}</p>}
      {list.isError && <p className="text-xs text-destructive">{errorMessage(list.error)}</p>}

      <DataTable
        urlState
        className={cn(list.isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => String(r.customerId)}
        searchPlaceholder={t('admin.ops.collectionsMap.search', 'Search by customer name or mobile…')}
        emptyTitle={t('admin.ops.collectionsMap.emptyTitle', 'No collections found')}
        emptyDescription={t('admin.ops.collectionsMap.emptyHint', 'No received payments match this period and filter.')}
        server={table.server(total)}
        toolbarActions={
          <Select
            items={locatedLabels}
            value={located}
            onValueChange={(v) => {
              setLocatedParam(v === 'yes' || v === 'no' ? v : '');
              table.setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[150px] border-border/60 bg-background text-xs" aria-label={t('admin.ops.collectionsMap.filterCoords', 'Filter by map coordinates')}>
              <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(locatedLabels) as Located[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {locatedLabels[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
