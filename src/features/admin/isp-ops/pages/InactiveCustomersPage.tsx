'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Users, PowerOff, Send, Download, MapPin, WifiOff, Unplug } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { useUrlParam } from '@/hooks/use-url-state';
import { SendSmsDialog } from '@/features/admin/customers/components/SendSmsDialog';
import type { Customer, CustomerListFilters } from '@/features/admin/customers/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useTranslations } from '@/i18n/locale-context';
import { useServerTable } from '../hooks/use-server-table';

/**
 * Inactive = still within the paid cycle but the account is switched off
 * (subscription / account inactive, or PPPoE disconnected) — backend
 * `status=inactive` filter on GET /v1/reseller/customers/{rid}.
 */
export function InactiveCustomersPage() {
  const t = useTranslations();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const [areaParam, setAreaParam] = useUrlParam('area');
  const areaFilter = areaParam || 'all';
  const [smsTargets, setSmsTargets] = useState<string[] | null>(null);

  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({ search: table.search || undefined, areaId: areaFilter !== 'all' ? areaFilter : undefined }),
    [table.search, areaFilter],
  );
  const listFilters = useMemo<CustomerListFilters>(() => ({ ...scopeFilters, status: 'inactive' }), [scopeFilters]);

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page: table.page, perPage: table.pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const exportMutation = useExportCustomers();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

  const columns = useMemo<LegacyColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: 'customer',
        accessorFn: (r) => r.name,
        header: t('admin.ops.inactive.colCustomer', 'Customer'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted text-xs font-bold text-muted-foreground">
                {r.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/customers/${r.id}`} className="text-xs font-bold text-foreground hover:text-primary hover:underline">
                  {r.name}
                </Link>
                <div className="font-mono text-xs font-normal text-muted-foreground">
                  {r.username || '—'} • {r.phone || '—'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'package',
        accessorFn: (r) => r.packageName,
        header: t('admin.customers.list.colPackage', 'Package'),
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.packageName || '—'}</span>,
      },
      {
        id: 'area',
        accessorFn: (r) => r.areaName,
        header: t('admin.ops.inactive.colArea', 'Area'),
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.areaName || '—'}</span>,
      },
      {
        id: 'account',
        header: t('admin.ops.inactive.colAccount', 'Account'),
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              {r.connStatus === 'disconn' && (
                <Badge variant="outline" tone="warning">
                  {t('admin.ops.inactive.pppoeDisabled', 'PPPoE disabled')}
                </Badge>
              )}
              {r.accountStatus === 'inactive' && (
                <Badge variant="outline" tone="danger">
                  {t('admin.ops.inactive.accountInactive', 'Account inactive')}
                </Badge>
              )}
              {r.subscriptionStatus === 'inactive' && (
                <Badge variant="outline" tone="neutral">
                  {t('admin.ops.inactive.subscriptionInactive', 'Subscription inactive')}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: 'validUntil',
        accessorFn: (r) => r.expiryDate ?? '',
        header: t('admin.ops.inactive.colValidUntil', 'Valid Until'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.expiryDate ? row.original.expiryDate.slice(0, 10) : '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 border-border/80 text-xs hover:bg-muted/80"
              onClick={() => setSmsTargets([row.original.id])}
            >
              <Send className="h-3 w-3 text-primary" /> {t('admin.ops.inactive.outreach', 'Outreach')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.inactive.loadFailed', 'Failed to load inactive subscribers')}
        description={t('admin.ops.inactive.loadFailedHint', 'Could not query inactive customers from the backend.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header */}
      <PageHeader
        title={t('admin.ops.inactive.title', 'Inactive Customers')}
        subtitle={t('admin.ops.inactive.subtitle', 'Subscribers still inside their paid cycle whose account or PPPoE connection is switched off.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.customers.list.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: t('admin.ops.inactive.title', 'Inactive Customers') },
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
              {exportMutation.isPending ? t('admin.customers.list.exporting', 'Exporting…') : t('admin.customers.list.export', 'Export')}
            </Button>
            <Button
              size="sm"
              disabled={rows.length === 0}
              onClick={() => setSmsTargets(rows.map((r) => r.id))}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> {t('admin.customers.expiredPage.smsPage', 'SMS This Page')}
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { key: 'inactive', label: t('admin.ops.inactive.kpiTotal', 'Total Inactive'), value: kpi(summary?.inactive), unit: t('admin.customers.expiredPage.unitSubscribers', 'subscribers'), icon: PowerOff, tone: 'bg-rose-500/10 text-rose-500', valueTone: 'text-foreground' },
            { key: 'disconnected', label: t('admin.customers.status.disconnected', 'Disconnected'), value: kpi(summary?.disconnected), unit: t('admin.ops.inactive.pppoeDisabled', 'PPPoE disabled'), icon: Unplug, tone: 'bg-amber-500/10 text-amber-500', valueTone: 'text-amber-500' },
            { key: 'offline', label: t('admin.ops.inactive.kpiOffline', 'Offline Now'), value: kpi(summary?.offline), unit: t('admin.ops.inactive.unitNoSession', 'no live session'), icon: WifiOff, tone: 'bg-primary/10 text-primary', valueTone: 'text-primary' },
            { key: 'total', label: t('admin.ops.inactive.kpiAll', 'All Customers'), value: kpi(summary?.total), unit: t('admin.ops.inactive.unitInScope', 'in scope'), icon: Users, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((k) => (
          <Card key={k.key} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
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

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.customers.expiredPage.searchPlaceholder', 'Search by name, mobile, email or PPPoE username...')}
        emptyTitle={t('admin.ops.inactive.emptyTitle', 'No inactive subscribers')}
        emptyDescription={t('admin.ops.inactive.emptyHint', 'Every account in this scope is switched on.')}
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <Select
            value={areaFilter}
            onValueChange={(v) => {
              setAreaParam(!v || v === 'all' ? '' : v);
              table.setPage(1);
            }}
            items={{ all: t('admin.customers.expiredPage.allAreas', 'All Areas'), ...Object.fromEntries(areaOptions.map((a) => [a.id, a.name])) }}
          >
            <SelectTrigger
              className="h-9 w-[160px] border-border/60 bg-background text-xs"
              aria-label={t('admin.ops.inactive.filterArea', 'Filter by area')}
            >
              <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder={t('admin.customers.expiredPage.allAreas', 'All Areas')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.customers.expiredPage.allAreas', 'All Areas')}</SelectItem>
              {areaOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <SendSmsDialog
        open={smsTargets !== null}
        onOpenChange={(o) => !o && setSmsTargets(null)}
        ids={smsTargets ?? []}
        title={t('admin.ops.inactive.smsTitle', 'Reconnect Inactive Customers')}
      />
    </div>
  );
}
