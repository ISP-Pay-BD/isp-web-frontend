'use client';

import { useState } from 'react';
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
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
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

const CYCLE_LABEL: Record<IspPackage['pricingType'], string> = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

export function PackagesPage() {
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

  const openEdit = (pkg: IspPackage) => {
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
  };

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
        title="Failed to load packages"
        description={errorMessage(error, 'Could not fetch package catalog from backend.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const priceOf = (pkg: IspPackage) => pkg.sellingPrice ?? pkg.price;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Internet Packages & Bandwidth Tiers"
        subtitle="Manage subscriber broadband packages, MikroTik profiles and prices"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Packages' },
        ]}
        actions={
          <Can menu="packages" action="create">
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Package
            </Button>
          </Can>
        }
      />

      {/* KPI Ribbon (backend summary over every package) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(
          [
            { label: 'Packages', value: kpi(summary?.total), sub: `${kpi(summary?.active)} active · ${kpi(summary?.inactive)} inactive`, icon: Layers, tone: 'bg-primary/10 text-primary' },
            { label: 'Active Packages', value: kpi(summary?.active), sub: 'Available for new customers', icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-400' },
            { label: 'Subscribers', value: summary ? summary.subscribers.toLocaleString() : '…', sub: 'Customers on these packages', icon: Users, tone: 'bg-purple-500/10 text-purple-400' },
            {
              label: 'Average Price',
              value: summary ? <CurrencyDisplay amount={summary.avgPrice} /> : '…',
              sub: 'Mean base price across packages',
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
              <div className="mt-2 text-[11px] text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar: Search + Status Pills + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
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
                { key: 'all', label: `All (${kpi(summary?.total)})` },
                { key: 'active', label: `Active (${kpi(summary?.active)})` },
                { key: 'inactive', label: `Inactive (${kpi(summary?.inactive)})` },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={statusFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
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
              title="Table View"
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
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {items.length === 0 ? (
        <EmptyState
          title={debouncedSearch || statusFilter !== 'all' ? 'No packages found' : 'No packages yet'}
          description={debouncedSearch || statusFilter !== 'all' ? 'No packages match your filter.' : 'Create the first package customers can subscribe to.'}
          actionLabel="Add Package"
          onAction={openCreate}
        />
      ) : viewMode === 'table' ? (
        <div className={cn('rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs', isFetching && 'opacity-80')}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Plan Name & ID</th>
                  <th className="py-3 px-4">Bandwidth</th>
                  <th className="py-3 px-4">MikroTik Profile</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Subscribers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((pkg) => (
                  <tr
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold shrink-0 bg-primary/10 text-primary border border-primary/20">
                          <PackageIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{pkg.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">#{pkg.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground text-sm">{pkg.bandwidth || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      <div className="truncate max-w-[160px]">{pkg.mikrotikProfile ?? '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-primary text-sm">
                        <CurrencyDisplay amount={priceOf(pkg)} />
                      </div>
                      {pkg.sellingPrice !== null && pkg.sellingPrice !== pkg.price && (
                        <div className="text-[10px] text-muted-foreground">
                          base <CurrencyDisplay amount={pkg.price} />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{CYCLE_LABEL[pkg.pricingType]}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono font-semibold text-foreground">{pkg.subscriberCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px] font-semibold',
                          pkg.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border/50'
                        )}
                      >
                        {pkg.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Can menu="packages" action="update">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(pkg)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                        <Can menu="packages" action="delete">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(pkg)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all duration-200 group relative cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                      {CYCLE_LABEL[pkg.pricingType]}
                    </Badge>
                    <h3 className="font-bold text-base text-foreground mt-2 group-hover:text-primary transition-colors">{pkg.name}</h3>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">#{pkg.id}</div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px]">{pkg.status}</Badge>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Bandwidth</div>
                    <div className="text-xl font-black font-mono text-foreground">{pkg.bandwidth || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">Price</div>
                    <div className="text-xl font-black font-mono text-primary">
                      <CurrencyDisplay amount={priceOf(pkg)} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" /> Billing Cycle
                    </span>
                    <span className="font-semibold text-foreground">{CYCLE_LABEL[pkg.pricingType]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400" /> Subscribers
                    </span>
                    <span className="font-mono font-semibold text-foreground">{pkg.subscriberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Router className="h-3.5 w-3.5 text-blue-400" /> MikroTik Profile
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[130px]">{pkg.mikrotikProfile ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => setSelectedPkg(pkg)} className="h-8 text-xs border-border/60 hover:bg-accent gap-1">
                  Details <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1">
                  <Can menu="packages" action="update">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)} className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </Can>
                  <Can menu="packages" action="delete">
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(pkg)} className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Can>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(data?.meta.total ?? 0) > 0 && (
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
                  <Badge variant="outline" className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                    {CYCLE_LABEL[selectedPkg.pricingType]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{selectedPkg.status}</Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedPkg.name}</SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">ID: {selectedPkg.id}</SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> Bandwidth
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">{selectedPkg.bandwidth || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground font-semibold">Price</div>
                  <div className="text-2xl font-black font-mono text-primary mt-0.5">
                    <CurrencyDisplay amount={priceOf(selectedPkg)} />
                  </div>
                  {selectedPkg.sellingPrice !== null && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      base <CurrencyDisplay amount={selectedPkg.price} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50 font-mono">
                  <span className="text-muted-foreground">MikroTik Profile</span>
                  <span className="font-bold text-foreground">{selectedPkg.mikrotikProfile ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Subscribers</span>
                  <span className="font-bold text-foreground font-mono">{selectedPkg.subscriberCount.toLocaleString()}</span>
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
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Package
                  </Button>
                </Can>
                <Button variant="outline" onClick={() => setSelectedPkg(null)} className="text-xs h-9">
                  Close
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
              {editPkg ? 'Edit Internet Package' : 'Create New Internet Package'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bandwidth, price, billing cycle and the MikroTik profile applied to customers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="package_name" className="text-xs font-semibold">Package Name</Label>
              <Input id="package_name" {...register('package_name')} className="text-xs h-9 shadow-xs" />
              {errors.package_name && <p className="text-xs text-destructive">{errors.package_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bandwidth (Mbps)</Label>
                <Input {...register('bandwidth')} inputMode="numeric" className="text-xs h-9 font-mono shadow-xs" />
                {errors.bandwidth && <p className="text-xs text-destructive">{errors.bandwidth.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">MikroTik Profile</Label>
                <Input {...register('mikrotik_profile')} className="text-xs h-9 font-mono shadow-xs" />
                {errors.mikrotik_profile && <p className="text-xs text-destructive">{errors.mikrotik_profile.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Price (৳)</Label>
                <Input {...register('price')} inputMode="decimal" className="text-xs h-9 font-mono shadow-xs" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Selling Price (৳, optional)</Label>
                <Input {...register('selling_price')} inputMode="decimal" className="text-xs h-9 font-mono shadow-xs" />
                {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Billing Cycle</Label>
                <Select
                  value={watch('pricing_type')}
                  onValueChange={(v) => v && setValue('pricing_type', v as PackageFormValues['pricing_type'])}
                  items={CYCLE_LABEL}
                >
                  <SelectTrigger className="text-xs h-9 shadow-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.pricing_type && <p className="text-xs text-destructive">{errors.pricing_type.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => v && setValue('status', v as PackageFormValues['status'])}
                  items={{ active: 'Active', inactive: 'Inactive' }}
                >
                  <SelectTrigger className="text-xs h-9 shadow-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : editPkg ? 'Save Changes' : 'Create Package'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Package"
        description={
          deleteTarget && deleteTarget.subscriberCount > 0
            ? `${deleteTarget.subscriberCount} customers are on this package and will need reassignment. Delete it anyway?`
            : 'Are you sure you want to delete this package?'
        }
        confirmLabel="Delete Package"
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
