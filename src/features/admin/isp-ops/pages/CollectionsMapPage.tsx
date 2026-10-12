'use client';

import { useMemo, useState } from 'react';
import { MapPin, Search, Users, Navigation, DollarSign, X, Receipt, MapPinOff, Info } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { MapboxMap } from '@/components/shared/MapboxMap';
import { TablePagination } from '@/components/shared/TablePagination';
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
import {
  fmtDay,
  fmtStamp,
  todayYmd,
  useCollectionPoints,
  useCollections,
  useDebouncedValue,
} from '../hooks/use-billing-config';

type Located = 'all' | 'yes' | 'no';
const LOCATED_ITEMS: Record<Located, string> = {
  all: 'All customers',
  yes: 'On the map',
  no: 'No coordinates',
};

/** First day of the current month, local calendar. */
function monthStartYmd(): string {
  return `${todayYmd().slice(0, 8)}01`;
}

export function CollectionsMapPage() {
  const [from, setFrom] = useState(monthStartYmd());
  const [to, setTo] = useState(todayYmd());
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const [located, setLocated] = useState<Located>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rangeOk = Boolean(from && to && from <= to);
  const range = { from, to };
  const list = useCollections({ page, perPage, search: debounced, from, to, located }, rangeOk);
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

  if (list.isLoading && !list.data) return <PageSkeleton variant="table" rows={6} />;
  if (list.isError && !list.data) {
    return (
      <EmptyState
        title="Failed to load the collections map"
        description={errorMessage(list.error, 'Could not load collections.')}
        actionLabel="Retry"
        onAction={() => list.refetch()}
      />
    );
  }

  const summary = list.data?.summary;
  const rows = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title="Collections Map"
        subtitle="Where received customer payments come from — each paying customer at their saved location. Customers without saved coordinates are listed but not placed on the map."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Reports' },
          { label: 'Collections Map' },
        ]}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Collected</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <CurrencyDisplay amount={summary?.collected ?? 0} className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {summary ? `${fmtDay(summary.from)} – ${fmtDay(summary.to)}` : ''}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payments</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">{summary?.paymentsCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">received</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paying Customers</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{summary?.customersCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">customers</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">On The Map</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{summary?.locatedCustomers ?? 0}</span>
            <span className="text-xs text-muted-foreground">mapped</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{summary?.unlocatedCustomers ?? 0} without coordinates</div>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Payment Locations</h3>
              <p className="text-[11px] text-muted-foreground">One marker per paying customer with saved coordinates.</p>
            </div>
          </div>

          {selectedPoint && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-semibold">
              <span>
                {selectedPoint.name} · {formatBdtWithSymbol(selectedPoint.collected)}
              </span>
              <button type="button" onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground text-[10px] ml-1 underline cursor-pointer">
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="p-2 space-y-2">
          {points.isError ? (
            <EmptyState
              title="Could not load map points"
              description={errorMessage(points.error)}
              actionLabel="Retry"
              onAction={() => points.refetch()}
            />
          ) : (
            <MapboxMap
              markers={markers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              height={440}
              emptyMessage={
                list.data && !list.data.coordinatesAvailable
                  ? 'Customer coordinates are not available.'
                  : 'No paying customer in this period has saved coordinates.'
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
                    <span className="mt-1.5 max-w-[180px] truncate rounded-md bg-popover px-2 py-1 text-[11px] font-bold text-popover-foreground shadow-md ring-1 ring-border">
                      {marker.label}
                    </span>
                  ) : null}
                </div>
              )}
            />
          )}
          {points.data?.truncated && (
            <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Showing the {markers.length} largest collections. Narrow the date range to see the rest.
            </p>
          )}
        </div>
      </Card>

      {/* Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by customer name or mobile…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              aria-label="From date"
              value={from}
              max={to || undefined}
              onChange={(e) => {
                setFrom(e.target.value);
                resetPage();
              }}
              className={cn('h-9 w-[150px] text-xs font-mono', !rangeOk && 'border-destructive')}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label="To date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                resetPage();
              }}
              className={cn('h-9 w-[150px] text-xs font-mono', !rangeOk && 'border-destructive')}
            />
            <Select
              items={LOCATED_ITEMS}
              value={located}
              onValueChange={(v) => {
                setLocated((v as Located) || 'all');
                resetPage();
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[150px] bg-background border-border/60">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LOCATED_ITEMS) as Located[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {LOCATED_ITEMS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!rangeOk && <p className="text-xs text-destructive">Choose a start date on or before the end date.</p>}
      {list.isError && <p className="text-xs text-destructive">{errorMessage(list.error)}</p>}

      {/* Table */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', list.isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Payments</th>
                <th className="py-3.5 px-4">Collected</th>
                <th className="py-3.5 px-4">Last Payment</th>
                <th className="py-3.5 px-4">Coordinates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No collections found</p>
                      <p className="text-xs text-muted-foreground">No received payments match this period and filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const id = String(r.customerId);
                  const isSelected = selectedId === id;
                  return (
                    <tr key={id} className={cn('transition-colors duration-150', isSelected ? 'bg-primary/[0.06]' : 'hover:bg-muted/30')}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold border',
                              isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border/60',
                            )}
                          >
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-foreground">{r.name || `Customer #${r.customerId}`}</span>
                            {r.mobile && <span className="block font-mono text-[10px] text-muted-foreground">{r.mobile}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="secondary" className="font-mono text-xs bg-muted/60">
                          {r.paymentsCount}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        <CurrencyDisplay amount={r.collected} />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">{fmtStamp(r.lastPaidAt)}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {r.located && r.latitude !== null && r.longitude !== null ? (
                          `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <MapPinOff className="h-3 w-3" /> No coordinates
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.located ? (
                          <Button
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-7 text-xs"
                            onClick={() => setSelectedId(isSelected ? null : id)}
                          >
                            {isSelected ? 'Focusing' : 'Locate on Map'}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="border-t border-border/60 px-4 py-2">
            <TablePagination
              currentPage={page}
              pageSize={perPage}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
