'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Search, PowerOff, Send, Download, MapPin, Activity, X, WifiOff, Unplug } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
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
import {
  useAreaOptions,
  useCustomerSummary,
  useCustomers,
  useExportCustomers,
} from '@/features/admin/customers/hooks/use-customers';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { SendSmsDialog } from '@/features/admin/customers/components/SendSmsDialog';
import type { CustomerListFilters } from '@/features/admin/customers/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';

/**
 * Inactive = still within the paid cycle but the account is switched off
 * (subscription / account inactive, or PPPoE disconnected) — backend
 * `status=inactive` filter on GET /v1/reseller/customers/{rid}.
 */
export function InactiveCustomersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [areaFilter, setAreaFilter] = useState('all');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [smsTargets, setSmsTargets] = useState<string[] | null>(null);

  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({ search: debouncedSearch || undefined, areaId: areaFilter !== 'all' ? areaFilter : undefined }),
    [debouncedSearch, areaFilter],
  );
  const listFilters = useMemo<CustomerListFilters>(() => ({ ...scopeFilters, status: 'inactive' }), [scopeFilters]);
  const pageKey = `${JSON.stringify(listFilters)}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const page = pageState.key === pageKey ? pageState.page : 1;

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page, perPage: pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const exportMutation = useExportCustomers();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load inactive subscribers"
        description="Could not query inactive customers from the backend."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header */}
      <PageHeader
        title="Inactive Customers"
        subtitle="Subscribers still inside their paid cycle whose account or PPPoE connection is switched off."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Inactive Customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(listFilters)}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {exportMutation.isPending ? 'Exporting…' : 'Export'}
            </Button>
            <Button
              size="sm"
              disabled={rows.length === 0}
              onClick={() => setSmsTargets(rows.map((r) => r.id))}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> SMS This Page
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { label: 'Total Inactive', value: kpi(summary?.inactive), unit: 'subscribers', icon: PowerOff, tone: 'bg-rose-500/10 text-rose-500', valueTone: 'text-foreground' },
            { label: 'Disconnected', value: kpi(summary?.disconnected), unit: 'PPPoE disabled', icon: Unplug, tone: 'bg-amber-500/10 text-amber-500', valueTone: 'text-amber-500' },
            { label: 'Offline Now', value: kpi(summary?.offline), unit: 'no live session', icon: WifiOff, tone: 'bg-primary/10 text-primary', valueTone: 'text-primary' },
            { label: 'All Customers', value: kpi(summary?.total), unit: 'in scope', icon: Users, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((k) => (
          <Card key={k.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
              <div className={cn('p-2 rounded-lg', k.tone)}>
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn('text-2xl font-bold tracking-tight tabular-nums', k.valueTone)}>{k.value}</span>
              <span className="text-xs text-muted-foreground">{k.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, mobile, email or PPPoE username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select
            value={areaFilter}
            onValueChange={(v) => setAreaFilter(v || 'all')}
            items={{ all: 'All Areas', ...Object.fromEntries(areaOptions.map((a) => [a.id, a.name])) }}
          >
            <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areaOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Area</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Activity className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No inactive subscribers</p>
                      <p className="text-xs text-muted-foreground">Every account in this scope is switched on.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-xs border border-border/60">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/customers/${r.id}`} className="font-bold text-foreground text-xs hover:text-primary hover:underline">
                            {r.name}
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {r.username || '—'} • {r.phone || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{r.packageName || '—'}</td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{r.areaName || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {r.connStatus === 'disconn' && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                            PPPoE disabled
                          </Badge>
                        )}
                        {r.accountStatus === 'inactive' && (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">
                            Account inactive
                          </Badge>
                        )}
                        {r.subscriptionStatus === 'inactive' && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60 text-[10px]">
                            Subscription inactive
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{r.expiryDate ? r.expiryDate.slice(0, 10) : '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-border/80 hover:bg-muted/80 gap-1"
                        onClick={() => setSmsTargets([r.id])}
                      >
                        <Send className="h-3 w-3 text-primary" /> Outreach
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(p) => setPageState({ key: pageKey, page: p })}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      <SendSmsDialog
        open={smsTargets !== null}
        onOpenChange={(o) => !o && setSmsTargets(null)}
        ids={smsTargets ?? []}
        title="Reconnect Inactive Customers"
      />
    </div>
  );
}
