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
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold shrink-0 bg-primary/10 text-primary border border-primary/20">
                <PackageIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <button
                  type="button"
                  onClick={() => setSelectedPkg(pkg)}
                  className="block text-left font-semibold text-foreground text-sm hover:text-primary transition-colors"
                >
                  {pkg.name}
                </button>
                <div className="text-xs font-normal text-muted-foreground font-mono">#{pkg.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'bandwidth',
        header: t('admin.packages.page.bandwidth', 'Bandwidth'),
        cell: ({ row }) => <span className="font-mono font-bold text-foreground text-sm">{row.original.bandwidth || '—'}</span>,
      },
      {
        accessorKey: 'mikrotikProfile',
        header: t('admin.packages.page.mikrotikProfile', 'MikroTik Profile'),
        cell: ({ row }) => (
          <div className="truncate max-w-[160px] font-mono text-xs text-muted-foreground">{row.original.mikrotikProfile ?? '—'}</div>
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
              <div className="font-bold text-primary text-sm">
                <CurrencyDisplay amount={priceOf(pkg)} />
              </div>
              {pkg.sellingPrice !== null && pkg.sellingPrice !== pkg.price && (
                <div className="text-xs font-normal text-muted-foreground">
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
        cell: ({ row }) => <span className="text-muted-foreground">{cycleLabel[row.original.pricingType]}</span>,
      },
      {
        accessorKey: 'subscriberCount',
        header: t('admin.packages.page.subscribers', 'Subscribers'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono font-semibold text-foreground">{formatCount(row.original.subscriberCount)}</span>
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
              <Button variant="ghost" size="icon" aria-label={t('admin.packages.page.editAria', 'Edit package')} className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(row.original)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="packages" action="delete">
              <Button variant="ghost" size="icon" aria-label={t('admin.packages.page.deleteAria', 'Delete package')} className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(row.original)}>
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
      <EmptyState variant="error"
        title={t('admin.packages.page.loadFailed', 'Failed to load packages')}
        description={errorMessage(error, t('admin.packages.page.loadFailedHint', 'Could not fetch package catalog from backend.'))}
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
        subtitle={t('admin.packages.page.subtitle', 'Manage subscriber broadband packages, MikroTik profiles and prices')}
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.packages.page.add', 'Add Package')}
            </Button>
          </Can>
        }
      />

      {/* KPI Ribbon (backend summary over every package) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(
          [
            { label: t('nav.packages', 'Packages'), value: kpi(summary?.total), sub: t('admin.packages.page.kpiActiveInactive', '{active} active · {inactive} inactive', { active: kpi(summary?.active), inactive: kpi(summary?.inactive) }), icon: Layers, tone: 'bg-primary/10 text-primary' },
            { label: t('admin.packages.page.kpiActive', 'Active Packages'), value: kpi(summary?.active), sub: t('admin.packages.page.kpiActiveHint', 'Available for new customers'), icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-400' },
            { label: t('admin.packages.page.subscribers', 'Subscribers'), value: summary ? formatCount(summary.subscribers) : '…', sub: t('admin.packages.page.kpiSubscribersHint', 'Customers on these packages'), icon: Users, tone: 'bg-purple-500/10 text-purple-400' },
            {
              label: t('admin.packages.page.kpiAvgPrice', 'Average Price'),
              value: summary ? <CurrencyDisplay amount={summary.avgPrice} /> : '…',
              sub: t('admin.packages.page.kpiAvgPriceHint', 'Mean base price across packages'),
              icon: TrendingUp,
              tone: 'bg-blue-500/10 text-blue-400',
            },
          ] as const
        ).map((k) => (
          <Card key={k.label} className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
                <div className={cn('p-2 rounded-lg', k.tone)}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black tracking-tight text-foreground font-mono">{k.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar: Search + Status Pills + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.packages.page.searchPlaceholder', 'Search by package name...')}
            aria-label={t('admin.packages.page.searchPlaceholder', 'Search by package name...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label={t('admin.packages.page.clearSearch', 'Clear search')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: t('admin.packages.page.pillAll', 'All ({n})', { n: kpi(summary?.total) }) },
                { key: 'active', label: t('admin.packages.page.pillActive', 'Active ({n})', { n: kpi(summary?.active) }) },
                { key: 'inactive', label: t('admin.packages.page.pillInactive', 'Inactive ({n})', { n: kpi(summary?.inactive) }) },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={statusFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition',
                  statusFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
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
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
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
          title={debouncedSearch || statusFilter !== 'all' ? t('admin.packages.page.emptyFiltered', 'No packages found') : t('admin.packages.page.emptyNone', 'No packages yet')}
          description={
            debouncedSearch || statusFilter !== 'all'
              ? t('admin.packages.page.emptyFilteredHint', 'No packages match your filter.')
              : t('admin.packages.page.emptyNoneHint', 'Create the first package customers can subscribe to.')
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
              className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition duration-200 group relative cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                      {cycleLabel[pkg.pricingType]}
                    </Badge>
                    <h3 className="font-bold text-base text-foreground mt-2 group-hover:text-primary transition-colors">{pkg.name}</h3>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">#{pkg.id}</div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{statusLabel(pkg.status)}</Badge>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                  <div>
                    <div className="text-xs text-muted-foreground">{t('admin.packages.page.bandwidth', 'Bandwidth')}</div>
                    <div className="text-xl font-black font-mono text-foreground">{pkg.bandwidth || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{t('admin.packages.page.price', 'Price')}</div>
                    <div className="text-xl font-black font-mono text-primary">
                      <CurrencyDisplay amount={priceOf(pkg)} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" /> {t('admin.packages.page.billingCycle', 'Billing Cycle')}
                    </span>
                    <span className="font-semibold text-foreground">{cycleLabel[pkg.pricingType]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400" /> {t('admin.packages.page.subscribers', 'Subscribers')}
                    </span>
                    <span className="font-mono font-semibold text-foreground">{formatCount(pkg.subscriberCount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Router className="h-3.5 w-3.5 text-blue-400" /> {t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[130px]">{pkg.mikrotikProfile ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => setSelectedPkg(pkg)} className="h-8 text-xs border-border/60 hover:bg-accent gap-1">
                  {t('admin.packages.page.details', 'Details')} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1">
                  <Can menu="packages" action="update">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)} className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary">
                      <Edit className="h-3.5 w-3.5 mr-1" /> {t('admin.packages.page.edit', 'Edit')}
                    </Button>
                  </Can>
                  <Can menu="packages" action="delete">
                    <Button size="sm" variant="ghost" aria-label={t('admin.packages.page.deleteAria', 'Delete package')} onClick={() => setDeleteTarget(pkg)} className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10">
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
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedPkg && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                    {cycleLabel[selectedPkg.pricingType]}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">{statusLabel(selectedPkg.status)}</Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedPkg.name}</SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">{t('admin.packages.page.idLabel', 'ID: {id}', { id: selectedPkg.id })}</SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> {t('admin.packages.page.bandwidth', 'Bandwidth')}
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">{selectedPkg.bandwidth || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-semibold">{t('admin.packages.page.price', 'Price')}</div>
                  <div className="text-2xl font-black font-mono text-primary mt-0.5">
                    <CurrencyDisplay amount={priceOf(selectedPkg)} />
                  </div>
                  {selectedPkg.sellingPrice !== null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('admin.packages.page.base', 'base')} <CurrencyDisplay amount={selectedPkg.price} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50 font-mono">
                  <span className="text-muted-foreground">{t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}</span>
                  <span className="font-bold text-foreground">{selectedPkg.mikrotikProfile ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">{t('admin.packages.page.subscribers', 'Subscribers')}</span>
                  <span className="font-bold text-foreground font-mono">{formatCount(selectedPkg.subscriberCount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border/60">
                <Can menu="packages" action="update">
                  <Button
                    onClick={() => {
                      const p = selectedPkg;
                      setSelectedPkg(null);
                      openEdit(p);
                    }}
                    className="flex-1 bg-primary text-primary-foreground text-xs font-semibold h-9"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> {t('admin.packages.page.editPackage', 'Edit Package')}
                  </Button>
                </Can>
                <Button variant="outline" onClick={() => setSelectedPkg(null)} className="text-xs h-9">
                  {t('common.close', 'Close')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Package Create & Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg p-6 border-border/80 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editPkg ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editPkg ? t('admin.packages.page.dialogEdit', 'Edit Internet Package') : t('admin.packages.page.dialogCreate', 'Create New Internet Package')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('admin.packages.page.dialogDesc', 'Bandwidth, price, billing cycle and the MikroTik profile applied to customers.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="package_name" className="text-xs font-semibold">{t('admin.packages.page.fieldName', 'Package Name')}</Label>
              <Input id="package_name" {...register('package_name')} className="text-xs h-9 shadow-xs" />
              {errors.package_name && <p className="text-xs text-destructive">{te(errors.package_name.message ?? '')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bandwidth" className="text-xs font-semibold">{t('admin.packages.page.fieldBandwidth', 'Bandwidth (Mbps)')}</Label>
                <Input id="bandwidth" {...register('bandwidth')} inputMode="numeric" className="text-xs h-9 font-mono shadow-xs" />
                {errors.bandwidth && <p className="text-xs text-destructive">{te(errors.bandwidth.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mikrotik_profile" className="text-xs font-semibold">{t('admin.packages.page.mikrotikProfile', 'MikroTik Profile')}</Label>
                <Input id="mikrotik_profile" {...register('mikrotik_profile')} className="text-xs h-9 font-mono shadow-xs" />
                {errors.mikrotik_profile && <p className="text-xs text-destructive">{te(errors.mikrotik_profile.message ?? '')}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold">{t('admin.packages.page.fieldPrice', 'Price (৳)')}</Label>
                <Input id="price" {...register('price')} inputMode="decimal" className="text-xs h-9 font-mono shadow-xs" />
                {errors.price && <p className="text-xs text-destructive">{te(errors.price.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selling_price" className="text-xs font-semibold">{t('admin.packages.page.fieldSellingPrice', 'Selling Price (৳, optional)')}</Label>
                <Input id="selling_price" {...register('selling_price')} inputMode="decimal" className="text-xs h-9 font-mono shadow-xs" />
                {errors.selling_price && <p className="text-xs text-destructive">{te(errors.selling_price.message ?? '')}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="billing-cycle" className="text-xs font-semibold">{t('admin.packages.page.billingCycle', 'Billing Cycle')}</Label>
                <Select
                  value={watch('pricing_type')}
                  onValueChange={(v) => v && setValue('pricing_type', v as PackageFormValues['pricing_type'])}
                  items={cycleLabel}
                >
                  <SelectTrigger id="billing-cycle" className="text-xs h-9 shadow-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{cycleLabel.weekly}</SelectItem>
                    <SelectItem value="monthly">{cycleLabel.monthly}</SelectItem>
                    <SelectItem value="yearly">{cycleLabel.yearly}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.pricing_type && <p className="text-xs text-destructive">{te(errors.pricing_type.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">{t('admin.customers.list.statusLabel', 'Status')}</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => v && setValue('status', v as PackageFormValues['status'])}
                  items={{ active: statusLabel('active'), inactive: statusLabel('inactive') }}
                >
                  <SelectTrigger id="status" className="text-xs h-9 shadow-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{statusLabel('active')}</SelectItem>
                    <SelectItem value="inactive">{statusLabel('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{te(errors.status.message ?? '')}</p>}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('admin.packages.page.saving', 'Saving…') : editPkg ? t('admin.packages.page.saveChanges', 'Save Changes') : t('admin.packages.page.create', 'Create Package')}
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
            ? t('admin.packages.page.deleteWithCustomers', '{n} customers are on this package and will need reassignment. Delete it anyway?', { n: deleteTarget.subscriberCount })
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
