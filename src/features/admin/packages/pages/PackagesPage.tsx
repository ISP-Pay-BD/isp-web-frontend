'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Package as PackageIcon,
  Eye,
  EyeOff,
  Download,
  LayoutGrid,
  List,
  Wifi,
  Building2,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from '../hooks/use-packages';
import { packageSchema, type PackageFormValues } from '../schemas/package.schema';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';
import type { Package } from '@/data/shared/types';

const packageSearchFilter = (
  row: LegacyRow<Package>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.name.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    String(p.speedMbps).includes(q)
  );
};

export function PackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [catalogFilter, setCatalogFilter] = useState<'all' | 'home' | 'corporate' | 'pop'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [gridSearch, setGridSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as Resolver<PackageFormValues>,
    defaultValues: {
      name: '',
      speedMbps: 10,
      priceBdt: 800,
      validityDays: 30,
      type: 'home',
      visible: true,
    },
  });

  const items = data?.items ?? [];
  const popPackages = data?.popPackages ?? [];

  const stats = useMemo(() => {
    const home = items.filter((p) => p.type === 'home').length;
    const corp = items.filter((p) => p.type === 'corporate').length;
    const pop = popPackages.length;
    const avg = items.length
      ? Math.round(items.reduce((a, p) => a + p.priceBdt, 0) / items.length)
      : 0;
    return { home, corp, pop, avg };
  }, [items, popPackages]);

  const catalog = useMemo(() => {
    if (catalogFilter === 'pop') return popPackages;
    if (catalogFilter === 'home' || catalogFilter === 'corporate') {
      return items.filter((p) => p.type === catalogFilter);
    }
    return items;
  }, [catalogFilter, items, popPackages]);

  const gridFiltered = useMemo(() => {
    if (!gridSearch) return catalog;
    const q = gridSearch.toLowerCase();
    return catalog.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.speedMbps).includes(q),
    );
  }, [catalog, gridSearch]);

  const openCreate = () => {
    setEditPkg(null);
    reset({
      name: '',
      speedMbps: 10,
      priceBdt: 800,
      validityDays: 30,
      type: 'home',
      visible: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditPkg(pkg);
    reset({
      name: pkg.name,
      speedMbps: pkg.speedMbps,
      priceBdt: pkg.priceBdt,
      validityDays: pkg.validityDays,
      type: pkg.type,
      visible: pkg.visible,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: PackageFormValues) => {
    if (editPkg) {
      await updateMutation.mutateAsync({ id: editPkg.id, payload: values });
      toast.success('Package updated successfully');
    } else {
      await createMutation.mutateAsync(values);
      toast.success('New package created successfully');
    }
    setDialogOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Package ID',
      'Package Name',
      'Speed (Mbps)',
      'Price (BDT)',
      'Validity (Days)',
      'Type',
      'Visible',
    ];
    const rows = catalog.map((p) => [
      p.id,
      p.name,
      p.speedMbps,
      p.priceBdt,
      p.validityDays,
      p.type,
      p.visible ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `packages_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Package catalog exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Package, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Plan Name',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  p.type === 'corporate'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <PackageIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">{p.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{p.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'speedMbps',
        header: 'Bandwidth',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-foreground">
            {row.original.speedMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'priceBdt',
        header: 'Price',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-primary">
            <CurrencyDisplay amount={row.original.priceBdt} />
          </span>
        ),
      },
      {
        accessorKey: 'validityDays',
        header: 'Validity',
        size: 100,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.validityDays} days</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Category',
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`capitalize text-[10px] font-semibold ${
              row.original.type === 'corporate'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: 'visibility',
        accessorFn: (row) => (row.visible ? 'visible' : 'hidden'),
        header: 'Visibility',
        size: 110,
        cell: ({ row }) =>
          row.original.visible ? (
            <span className="text-emerald-500 flex items-center gap-1 font-semibold text-[11px]">
              <Eye className="h-3.5 w-3.5" /> Visible
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <EyeOff className="h-3.5 w-3.5" /> Hidden
            </span>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Can menu="packages" action="update">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => openEdit(row.original)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="packages" action="delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [],
  );

  const catalogPills = (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
      {(
        [
          { key: 'all', label: `All (${items.length})` },
          { key: 'home', label: `Home (${stats.home})` },
          { key: 'corporate', label: `Corporate (${stats.corp})` },
          { key: 'pop', label: `POP Reseller (${stats.pop})` },
        ] as const
      ).map((pill) => (
        <Button
          key={pill.key}
          type="button"
          size="sm"
          variant={catalogFilter === pill.key ? 'default' : 'ghost'}
          onClick={() => setCatalogFilter(pill.key)}
          className="text-xs h-7 px-2.5"
        >
          {pill.label}
        </Button>
      ))}
    </div>
  );

  const viewToggle = (
    <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60">
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          viewMode === 'grid'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        title="Grid View"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode('table')}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          viewMode === 'table'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        title="Table View"
      >
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load packages"
        description="Could not fetch package catalog from backend."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Internet Packages & Bandwidth Tiers"
          subtitle="Manage subscriber broadband profiles, queue rate limits, and retail prices"
          breadcrumb={[
            { label: 'Admin', url: '/admin/dashboard' },
            { label: 'Packages' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="text-xs border-border/80 hover:bg-accent gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Can menu="packages" action="create">
                <Button
                  size="sm"
                  onClick={openCreate}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Package
                </Button>
              </Can>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Packages"
          value={items.length}
          description="Provisioned billing rate profiles"
          icon={PackageIcon}
        />
        <StatCard
          title="Home Broadband"
          value={stats.home}
          description="Residential FTTH & wireless plans"
          icon={Wifi}
        />
        <StatCard
          title="Corporate Dedicated"
          value={stats.corp}
          description="SLA duplex enterprise plans"
          icon={Building2}
        />
        <StatCard
          title="Average Plan Price"
          value={
            <CurrencyDisplay
              amount={stats.avg}
              className="font-mono text-foreground font-bold"
            />
          }
          description="Monthly retail average"
          icon={Zap}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={catalog}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search packages by plan name or speed..."
            searchFilterFn={packageSearchFilter}
            facetFilters={
              catalogFilter === 'pop'
                ? []
                : [{ columnId: 'type', title: 'Category' }]
            }
            emptyTitle="No packages found"
            emptyDescription="Create your first internet package plan to start provisioning subscribers."
            toolbarActions={
              <div className="flex flex-wrap items-center gap-2">
                {catalogPills}
                {viewToggle}
                <Can menu="packages" action="create">
                  <Button size="sm" onClick={openCreate} className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Package
                  </Button>
                </Can>
              </div>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
              <Input
                placeholder="Search packages by plan name or speed..."
                value={gridSearch}
                onChange={(e) => setGridSearch(e.target.value)}
                className="max-w-md h-9 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                {catalogPills}
                {viewToggle}
              </div>
            </div>

            {gridFiltered.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="No packages found"
                  description="Create your first internet package plan to start provisioning subscribers."
                  actionLabel="Add Package"
                  onAction={openCreate}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gridFiltered.map((pkg, idx) => {
                  const isCorporate = pkg.type === 'corporate';
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.35,
                        ease: [0.25, 0.46, 0.45, 0.94] as const,
                      }}
                      whileHover={hoverLift}
                      className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px] font-semibold uppercase',
                                isCorporate
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-primary/10 text-primary border-primary/20',
                              )}
                            >
                              {pkg.type}
                            </Badge>
                            <h3 className="font-bold text-base text-foreground mt-2 group-hover:text-primary transition-colors duration-200">
                              {pkg.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            {pkg.visible ? (
                              <span title="Visible to subscribers" className="text-emerald-500 p-1">
                                <Eye className="h-4 w-4" />
                              </span>
                            ) : (
                              <span title="Hidden from portal" className="text-muted-foreground p-1">
                                <EyeOff className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between group-hover:border-primary/20 transition-colors duration-300">
                          <div>
                            <div className="text-[11px] text-muted-foreground">Speed Throughput</div>
                            <div className="text-xl font-black font-mono text-foreground flex items-baseline gap-1">
                              <span>{pkg.speedMbps}</span>
                              <span className="text-xs font-normal text-muted-foreground">Mbps</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-muted-foreground">Retail Rate</div>
                            <div className="text-xl font-black font-mono text-primary">
                              ৳{pkg.priceBdt.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{pkg.validityDays} Days Validity Cycle</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>MikroTik Queue & PPPoE Profile</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Unlimited High-Speed Data</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between relative">
                        <span className="font-mono text-[11px] text-muted-foreground">{pkg.id}</span>
                        <div className="flex items-center gap-1">
                          <Can menu="packages" action="update">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(pkg)}
                              className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                          </Can>
                          <Can menu="packages" action="delete">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(pkg.id)}
                              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </Can>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editPkg ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editPkg ? 'Edit Package' : 'Add New Package'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure bandwidth speed, retail price, and billing cycle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Package Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g. Home Ultra 30 Mbps"
                className="text-xs h-10 shadow-sm"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Speed (Mbps)</Label>
                <Input
                  type="number"
                  {...register('speedMbps')}
                  className="text-xs h-10 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Price (৳ BDT)</Label>
                <Input
                  type="number"
                  {...register('priceBdt')}
                  className="text-xs h-10 font-mono shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Validity (Days)</Label>
                <Input
                  type="number"
                  {...register('validityDays')}
                  className="text-xs h-10 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) =>
                    v && setValue('type', v as PackageFormValues['type'])
                  }
                >
                  <SelectTrigger className="text-xs h-10 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold shadow-sm"
                disabled={isSubmitting}
              >
                {editPkg ? 'Save Changes' : 'Create Package'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Package"
        description="Subscribers currently on this plan will need to be reassigned. Are you sure you want to delete this plan?"
        confirmLabel="Delete Package"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </motion.div>
  );
}
