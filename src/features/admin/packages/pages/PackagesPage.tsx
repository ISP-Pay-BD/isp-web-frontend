'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Package as PackageIcon,
  Plus,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  Users,
  TrendingUp,
  Layers,
  Clock,
  Search,
  X,
  Router,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackageMutations, usePackageSummary, usePackages } from '../hooks/use-packages';
import { packageSchema, type PackageFormValues } from '../schemas/package.schema';
import type { IspPackage } from '../types';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { TablePagination } from '@/components/shared/TablePagination';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { handleApiError, errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { formatCount } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';

type StatusFilter = 'all' | 'active' | 'inactive';

const EMPTY_FORM: PackageFormValues = {
  package_name: '',
  bandwidth: '',
  price: '',
  selling_price: '',
  pricing_type: 'monthly',
  status: 'active',
  mikrotik_profile: '',
  preview: '',
};

const priceOf = (pkg: IspPackage) => pkg.sellingPrice ?? pkg.price;

export function PackagesPage() {
  const { t, te } = useLocale();
  const cycleLabel = useMemo<Record<IspPackage['pricingType'], string>>(
    () => ({
      weekly: t('admin.packages.page.cycle.weekly', 'Weekly'),
      monthly: t('admin.packages.page.cycle.monthly', 'Monthly'),
      yearly: t('admin.packages.page.cycle.yearly', 'Yearly'),
    }),
    [t],
  );
  const statusLabel = (status: IspPackage['status']) => t(`status.${status}`, status);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [pageSize, setPageSize] = useState(20);
  const pageKey = `${statusFilter}|${debouncedSearch}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const page = pageState.key === pageKey ? pageState.page : 1;

  const { data, isLoading, isError, error, isFetching, refetch } = usePackages({
    page,
    perPage: pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });
  const summaryQuery = usePackageSummary();
  const m = usePackageMutations();

  const [selectedPkg, setSelectedPkg] = useState<IspPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<IspPackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IspPackage | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as Resolver<PackageFormValues>,
    defaultValues: EMPTY_FORM,
  });

  const items = data?.items ?? [];
  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? (n ?? 0) : '…');

  const openCreate = () => {
    setEditPkg(null);
    reset(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = useCallback(
    (pkg: IspPackage) => {
      setEditPkg(pkg);
      reset({
        package_name: pkg.name,
        bandwidth: pkg.bandwidth,
        price: String(pkg.price),
        selling_price: pkg.sellingPrice !== null ? String(pkg.sellingPrice) : '',
        pricing_type: pkg.pricingType,
        status: pkg.status,
        mikrotik_profile: pkg.mikrotikProfile ?? '',
        preview: pkg.preview !== null ? String(pkg.preview) : '',
      });
      setDialogOpen(true);
    },
    [reset],
  );

  const columns = useMemo<LegacyColumnDef<IspPackage, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.packages.page.colName', 'Plan Name & ID'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const pkg = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold">
                <PackageIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <button
                  type="button"
                  onClick={() => setSelectedPkg(pkg)}
                  className="text-foreground hover:text-primary block text-left text-sm font-semibold transition-colors"
                >
                  {pkg.name}
                </button>
                <div className="text-muted-foreground font-mono text-xs font-normal">#{pkg.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'bandwidth',
        header: t('admin.packages.page.bandwidth', 'Bandwidth'),
        cell: ({ row }) => (
          <span className="text-foreground font-mono text-sm font-bold">
            {row.original.bandwidth || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'mikrotikProfile',
        header: t('admin.packages.page.mikrotikProfile', 'MikroTik Profile'),
        cell: ({ row }) => (
          <div className="text-muted-foreground max-w-[160px] truncate font-mono text-xs">
            {row.original.mikrotikProfile ?? '—'}
          </div>
        ),
      },
      {
        id: 'price',
        header: t('admin.packages.page.price', 'Price'),
        accessorFn: priceOf,
        cell: ({ row }) => {
          const pkg = row.original;
          return (
            <div className="font-mono">
              <div className="text-primary text-sm font-bold">
                <CurrencyDisplay amount={priceOf(pkg)} />
              </div>
              {pkg.sellingPrice !== null && pkg.sellingPrice !== pkg.price && (
                <div className="text-muted-foreground text-xs font-normal">
                  {t('admin.packages.page.base', 'base')} <CurrencyDisplay amount={pkg.price} />
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'pricingType',
        header: t('admin.packages.page.colCycle', 'Cycle'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{cycleLabel[row.original.pricingType]}</span>
        ),
      },
      {
        accessorKey: 'subscriberCount',
        header: t('admin.packages.page.subscribers', 'Subscribers'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-foreground font-mono font-semibold">
              {formatCount(row.original.subscriberCount)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customers.list.statusLabel', 'Status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: t('admin.customers.list.colActions', 'Actions'),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Can menu="packages" action="update">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('admin.packages.page.editAria', 'Edit package')}
                className="hover:bg-primary/10 hover:text-primary h-7 w-7"
                onClick={() => openEdit(row.original)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="packages" action="delete">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('admin.packages.page.deleteAria', 'Delete package')}
                className="text-destructive hover:bg-destructive/10 h-7 w-7"
                onClick={() => setDeleteTarget(row.original)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [openEdit, t, cycleLabel],
  );

  const onSubmit = async (values: PackageFormValues) => {
    try {
      if (editPkg) await m.update.mutateAsync({ id: editPkg.id, values });
      else await m.create.mutateAsync(values);
      setDialogOpen(false);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        variant="error"
        title={t('admin.packages.page.loadFailed', 'Failed to load packages')}
        description={errorMessage(
          error,
          t('admin.packages.page.loadFailedHint', 'Could not fetch package catalog from backend.'),
        )}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title={t('admin.packages.page.title', 'Internet Packages & Bandwidth Tiers')}
        subtitle={t(
          'admin.packages.page.subtitle',
          'Manage subscriber broadband packages, MikroTik profiles and prices',
        )}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.billing', 'Billing') },
          { label: t('nav.packages', 'Packages') },
        ]}
        actions={
          <Can menu="packages" action="create">
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.packages.page.add', 'Add Package')}
            </Button>
          </Can>
        }
      />

      {/* KPI Ribbon (backend summary over every package) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            {
              label: t('nav.packages', 'Packages'),
              value: kpi(summary?.total),
              sub: t(
                'admin.packages.page.kpiActiveInactive',
                '{active} active · {inactive} inactive',
                { active: kpi(summary?.active), inactive: kpi(summary?.inactive) },
              ),
              icon: Layers,
              tone: 'bg-primary/10 text-primary',
            },
            {
              label: t('admin.packages.page.kpiActive', 'Active Packages'),
              value: kpi(summary?.active),
              sub: t('admin.packages.page.kpiActiveHint', 'Available for new customers'),
              icon: CheckCircle2,
              tone: 'bg-emerald-500/10 text-emerald-400',
            },
            {
              label: t('admin.packages.page.subscribers', 'Subscribers'),
              value: summary ? formatCount(summary.subscribers) : '…',
              sub: t('admin.packages.page.kpiSubscribersHint', 'Customers on these packages'),
              icon: Users,
              tone: 'bg-purple-500/10 text-purple-400',
            },
            {
              label: t('admin.packages.page.kpiAvgPrice', 'Average Price'),
              value: summary ? <CurrencyDisplay amount={summary.avgPrice} /> : '…',
              sub: t('admin.packages.page.kpiAvgPriceHint', 'Mean base price across packages'),
              icon: TrendingUp,
              tone: 'bg-blue-500/10 text-blue-400',
            },
          ] as const
        ).map((k) => (
          <Card
            key={k.label}
            className="border-border/70 bg-card/60 relative overflow-hidden border shadow-sm backdrop-blur-md"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {k.label}
                </span>
                <div className={cn('rounded-lg p-2', k.tone)}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-foreground mt-2 font-mono text-2xl font-black tracking-tight">
                {k.value}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar: Search + Status Pills + View Toggle */}
      <div className="border-border/60 bg-card/60 flex flex-col justify-between gap-3 rounded-xl border p-3.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('admin.packages.page.searchPlaceholder', 'Search by package name...')}
            aria-label={t('admin.packages.page.searchPlaceholder', 'Search by package name...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background/80 h-9 pl-9 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label={t('admin.packages.page.clearSearch', 'Clear search')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-xl border p-1">
            {(
              [
                {
                  key: 'all',
                  label: t('admin.packages.page.pillAll', 'All ({n})', { n: kpi(summary?.total) }),
                },
                {
                  key: 'active',
                  label: t('admin.packages.page.pillActive', 'Active ({n})', {
                    n: kpi(summary?.active),
                  }),
                },
                {
                  key: 'inactive',
                  label: t('admin.packages.page.pillInactive', 'Inactive ({n})', {
                    n: kpi(summary?.inactive),
                  }),
                },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={statusFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  'h-7 px-2.5 text-xs font-medium transition',
                  statusFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          <div className="bg-muted/40 border-border/60 flex items-center rounded-xl border p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title={t('admin.packages.page.tableView', 'Table View')}
              aria-label={t('admin.packages.page.tableView', 'Table View')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title={t('admin.packages.page.gridView', 'Grid View')}
              aria-label={t('admin.packages.page.gridView', 'Grid View')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {items.length === 0 ? (
        <EmptyState
          title={
            debouncedSearch || statusFilter !== 'all'
              ? t('admin.packages.page.emptyFiltered', 'No packages found')
              : t('admin.packages.page.emptyNone', 'No packages yet')
          }
          description={
            debouncedSearch || statusFilter !== 'all'
              ? t('admin.packages.page.emptyFilteredHint', 'No packages match your filter.')
              : t(
                  'admin.packages.page.emptyNoneHint',
                  'Create the first package customers can subscribe to.',
                )
          }
          actionLabel={t('admin.packages.page.add', 'Add Package')}
          onAction={openCreate}
        />
      ) : viewMode === 'table' ? (
        <div className={cn('transition-opacity', isFetching && 'opacity-80')}>
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            server={{
              page,
              pageSize,
              total: data?.meta.total ?? 0,
              onPageChange: (p) => setPageState({ key: pageKey, page: p }),
              onPageSizeChange: setPageSize,
            }}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className="border-border/60 bg-card/80 hover:border-primary/40 group relative flex cursor-pointer flex-col justify-between rounded-xl border p-5 backdrop-blur-md transition duration-200 hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-wider uppercase"
                    >
                      {cycleLabel[pkg.pricingType]}
                    </Badge>
                    <h3 className="text-foreground group-hover:text-primary mt-2 text-base font-bold transition-colors">
                      {pkg.name}
                    </h3>
                    <div className="text-muted-foreground mt-0.5 font-mono text-xs">#{pkg.id}</div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {statusLabel(pkg.status)}
                  </Badge>
                </div>

                <div className="bg-muted/20 border-border/50 group-hover:border-primary/20 mt-4 flex items-center justify-between rounded-xl border p-3 transition-colors">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      {t('admin.packages.page.bandwidth', 'Bandwidth')}
                    </div>
                    <div className="text-foreground font-mono text-xl font-black">
                      {pkg.bandwidth || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-xs">
                      {t('admin.packages.page.price', 'Price')}
                    </div>
                    <div className="text-primary font-mono text-xl font-black">
                      <CurrencyDisplay amount={priceOf(pkg)} />
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />{' '}
                      {t('admin.packages.page.billingCycle', 'Billing Cycle')}
                    </span>
                    <span className="text-foreground font-semibold">
                      {cycleLabel[pkg.pricingType]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400" />{' '}
                      {t('admin.packages.page.subscribers', 'Subscribers')}
                    </span>
                    <span className="text-foreground font-mono font-semibold">
                      {formatCount(pkg.subscriberCount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Router className="h-3.5 w-3.5 text-blue-400" />{' '}
                      {t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}
                    </span>
                    <span className="text-muted-foreground max-w-[130px] truncate font-mono text-xs">
                      {pkg.mikrotikProfile ?? '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="border-border/50 mt-4 flex items-center justify-between border-t pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPkg(pkg)}
                  className="border-border/60 hover:bg-accent h-8 gap-1 text-xs"
                >
                  {t('admin.packages.page.details', 'Details')}{' '}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1">
                  <Can menu="packages" action="update">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(pkg)}
                      className="hover:bg-primary/10 hover:text-primary h-8 px-2 text-xs"
                    >
                      <Edit className="mr-1 h-3.5 w-3.5" /> {t('admin.packages.page.edit', 'Edit')}
                    </Button>
                  </Can>
                  <Can menu="packages" action="delete">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t('admin.packages.page.deleteAria', 'Delete package')}
                      onClick={() => setDeleteTarget(pkg)}
                      className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Can>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && (data?.meta.total ?? 0) > 0 && (
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(p) => setPageState({ key: pageKey, page: p })}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}

      {/* Package Inspector Sheet */}
      <Sheet open={Boolean(selectedPkg)} onOpenChange={(open) => !open && setSelectedPkg(null)}>
        <SheetContent className="border-border/80 w-full space-y-6 overflow-y-auto border-l p-6 sm:max-w-md">
          {selectedPkg && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-wider capitalize"
                  >
                    {cycleLabel[selectedPkg.pricingType]}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {statusLabel(selectedPkg.status)}
                  </Badge>
                </div>
                <SheetTitle className="text-foreground text-xl font-bold">
                  {selectedPkg.name}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground font-mono text-xs">
                  {t('admin.packages.page.idLabel', 'ID: {id}', { id: selectedPkg.id })}
                </SheetDescription>
              </SheetHeader>

              <div className="bg-muted/20 border-border/50 grid grid-cols-2 gap-3 rounded-xl border p-4">
                <div>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                    <Gauge className="h-3 w-3" /> {t('admin.packages.page.bandwidth', 'Bandwidth')}
                  </div>
                  <div className="text-foreground mt-0.5 font-mono text-2xl font-black">
                    {selectedPkg.bandwidth || '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs font-semibold">
                    {t('admin.packages.page.price', 'Price')}
                  </div>
                  <div className="text-primary mt-0.5 font-mono text-2xl font-black">
                    <CurrencyDisplay amount={priceOf(selectedPkg)} />
                  </div>
                  {selectedPkg.sellingPrice !== null && (
                    <div className="text-muted-foreground mt-1 text-xs">
                      {t('admin.packages.page.base', 'base')}{' '}
                      <CurrencyDisplay amount={selectedPkg.price} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-card border-border/50 flex items-center justify-between rounded-lg border p-2.5 font-mono">
                  <span className="text-muted-foreground">
                    {t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}
                  </span>
                  <span className="text-foreground font-bold">
                    {selectedPkg.mikrotikProfile ?? '—'}
                  </span>
                </div>
                <div className="bg-card border-border/50 flex items-center justify-between rounded-lg border p-2.5 font-mono">
                  <span className="text-muted-foreground">
                    {t('admin.packages.page.previewDays', 'Preview days')}
                  </span>
                  <span className="text-foreground font-bold">{selectedPkg.preview ?? '—'}</span>
                </div>
                <div className="bg-card border-border/50 flex items-center justify-between rounded-lg border p-2.5">
                  <span className="text-muted-foreground">
                    {t('admin.packages.page.subscribers', 'Subscribers')}
                  </span>
                  <span className="text-foreground font-mono font-bold">
                    {formatCount(selectedPkg.subscriberCount)}
                  </span>
                </div>
              </div>

              <div className="border-border/60 flex items-center gap-2 border-t pt-4">
                <Can menu="packages" action="update">
                  <Button
                    onClick={() => {
                      const p = selectedPkg;
                      setSelectedPkg(null);
                      openEdit(p);
                    }}
                    className="bg-primary text-primary-foreground h-9 flex-1 text-xs font-semibold"
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />{' '}
                    {t('admin.packages.page.editPackage', 'Edit Package')}
                  </Button>
                </Can>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPkg(null)}
                  className="h-9 text-xs"
                >
                  {t('common.close', 'Close')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Package Create & Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/80 p-6 shadow-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                {editPkg ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editPkg
                ? t('admin.packages.page.dialogEdit', 'Edit Internet Package')
                : t('admin.packages.page.dialogCreate', 'Create New Internet Package')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t(
                'admin.packages.page.dialogDesc',
                'Bandwidth, price, billing cycle and the MikroTik profile applied to customers.',
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="package_name" className="text-xs font-semibold">
                {t('admin.packages.page.fieldName', 'Package Name')}
              </Label>
              <Input
                id="package_name"
                {...register('package_name')}
                className="h-9 text-xs shadow-xs"
              />
              {errors.package_name && (
                <p className="text-destructive text-xs">{te(errors.package_name.message ?? '')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bandwidth" className="text-xs font-semibold">
                  {t('admin.packages.page.fieldBandwidth', 'Bandwidth (Mbps)')}
                </Label>
                <Input
                  id="bandwidth"
                  {...register('bandwidth')}
                  inputMode="numeric"
                  className="h-9 font-mono text-xs shadow-xs"
                />
                {errors.bandwidth && (
                  <p className="text-destructive text-xs">{te(errors.bandwidth.message ?? '')}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mikrotik_profile" className="text-xs font-semibold">
                  {t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}
                </Label>
                <Input
                  id="mikrotik_profile"
                  {...register('mikrotik_profile')}
                  className="h-9 font-mono text-xs shadow-xs"
                />
                {errors.mikrotik_profile && (
                  <p className="text-destructive text-xs">
                    {te(errors.mikrotik_profile.message ?? '')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold">
                  {t('admin.packages.page.fieldPrice', 'Price (৳)')}
                </Label>
                <Input
                  id="price"
                  {...register('price')}
                  inputMode="decimal"
                  className="h-9 font-mono text-xs shadow-xs"
                />
                {errors.price && (
                  <p className="text-destructive text-xs">{te(errors.price.message ?? '')}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selling_price" className="text-xs font-semibold">
                  {t('admin.packages.page.fieldSellingPrice', 'Selling Price (৳, optional)')}
                </Label>
                <Input
                  id="selling_price"
                  {...register('selling_price')}
                  inputMode="decimal"
                  className="h-9 font-mono text-xs shadow-xs"
                />
                {errors.selling_price && (
                  <p className="text-destructive text-xs">
                    {te(errors.selling_price.message ?? '')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preview" className="text-xs font-semibold">
                {t('admin.packages.page.fieldPreview', 'Preview days (optional)')}
              </Label>
              <Input
                id="preview"
                {...register('preview')}
                inputMode="numeric"
                className="h-9 font-mono text-xs shadow-xs"
              />
              <p className="text-muted-foreground text-xs">
                {t(
                  'admin.packages.page.previewHint',
                  'Days a new customer on this package stays paid before the first bill. 0 = bill now; blank = the package period.',
                )}
              </p>
              {errors.preview && (
                <p className="text-destructive text-xs">{te(errors.preview.message ?? '')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="billing-cycle" className="text-xs font-semibold">
                  {t('admin.packages.page.billingCycle', 'Billing Cycle')}
                </Label>
                <Select
                  value={watch('pricing_type')}
                  onValueChange={(v) =>
                    v && setValue('pricing_type', v as PackageFormValues['pricing_type'])
                  }
                  items={cycleLabel}
                >
                  <SelectTrigger id="billing-cycle" className="h-9 w-full text-xs shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{cycleLabel.weekly}</SelectItem>
                    <SelectItem value="monthly">{cycleLabel.monthly}</SelectItem>
                    <SelectItem value="yearly">{cycleLabel.yearly}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.pricing_type && (
                  <p className="text-destructive text-xs">
                    {te(errors.pricing_type.message ?? '')}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">
                  {t('admin.customers.list.statusLabel', 'Status')}
                </Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => v && setValue('status', v as PackageFormValues['status'])}
                  items={{ active: statusLabel('active'), inactive: statusLabel('inactive') }}
                >
                  <SelectTrigger id="status" className="h-9 w-full text-xs shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{statusLabel('active')}</SelectItem>
                    <SelectItem value="inactive">{statusLabel('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-destructive text-xs">{te(errors.status.message ?? '')}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-full text-xs font-semibold shadow-xs"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t('admin.packages.page.saving', 'Saving…')
                  : editPkg
                    ? t('admin.packages.page.saveChanges', 'Save Changes')
                    : t('admin.packages.page.create', 'Create Package')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.packages.page.deleteTitle', 'Delete Package')}
        description={
          deleteTarget && deleteTarget.subscriberCount > 0
            ? t(
                'admin.packages.page.deleteWithCustomers',
                '{n} customers are on this package and will need reassignment. Delete it anyway?',
                { n: deleteTarget.subscriberCount },
              )
            : t('admin.packages.page.deleteHint', 'Are you sure you want to delete this package?')
        }
        confirmLabel={t('admin.packages.page.deleteTitle', 'Delete Package')}
        destructive
        onConfirm={async () => {
          if (deleteTarget) {
            await m.remove.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
