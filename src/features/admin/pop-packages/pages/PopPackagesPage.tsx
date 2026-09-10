'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Search,
  Boxes,
  Wifi,
  Zap,
  X,
  Edit,
  Plus,
  Download,
  Copy,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { usePackages, useUpdatePackage } from '@/features/admin/packages/hooks/use-packages';
import { packageSchema, type PackageFormValues } from '@/features/admin/packages/schemas/package.schema';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Can } from '@/components/shared/Can';
import type { Package } from '@/data/shared/types';
import { cn } from '@/lib/utils';

type TypeFilter = 'all' | 'home' | 'corporate' | 'hotspot';

export function PopPackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const updateMutation = useUpdatePackage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: '',
      speedMbps: 20,
      priceBdt: 800,
      validityDays: 30,
      type: 'home',
      visible: true,
    },
  });

  const items = data?.popPackages ?? [];

  const stats = useMemo(() => {
    const home = items.filter((p) => p.type === 'home').length;
    const corp = items.filter((p) => p.type === 'corporate').length;
    const avg = items.length ? Math.round(items.reduce((a, p) => a + p.priceBdt, 0) / items.length) : 0;
    const maxSpeed = items.length ? Math.max(...items.map((p) => p.speedMbps)) : 0;
    return { home, corp, avg, maxSpeed };
  }, [items]);

  const openCreate = () => {
    setEditPkg(null);
    reset({
      name: '',
      speedMbps: 25,
      priceBdt: 1000,
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

  const handleDuplicate = (pkg: Package) => {
    toast.success(`Cloned package "${pkg.name} (Copy)" to POP catalog (mock)`);
  };

  const onSubmit = async (values: PackageFormValues) => {
    if (editPkg) {
      await updateMutation.mutateAsync({ id: editPkg.id, payload: values });
      toast.success('Package updated successfully');
    } else {
      toast.success(`New package "${values.name}" created for POP catalog`);
    }
    setDialogOpen(false);
    setEditPkg(null);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Package Name', 'Speed (Mbps)', 'Reseller Price (BDT)', 'Type', 'Status'];
    const rows = items.map((p) => [
      p.id,
      p.name,
      p.speedMbps,
      p.priceBdt,
      p.type,
      p.visible ? 'Active' : 'Hidden',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pop_packages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('POP package catalog exported to CSV');
  };

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.speedMbps).includes(search);
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [items, search, typeFilter]);

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP packages"
        description="Could not fetch reseller package catalog."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Customer Packages"
        subtitle="Bandwidth profiles and pricing tiers available to POP resellers for downstream subscriber sales"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'Customer Packages' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Catalog
            </Button>
            <Can menu="packages" action="create">
              <Button
                size="sm"
                onClick={openCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add POP Package
              </Button>
            </Can>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{items.length}</span>{' '}
          <span className="text-muted-foreground">total POP packages</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{stats.home}</span>{' '}
          <span className="text-muted-foreground">home FTTH plans</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-purple-600 dark:text-purple-400">{stats.corp}</span>{' '}
          <span className="text-muted-foreground">corporate tiers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={stats.avg} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">avg. reseller wholesale price</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{stats.maxSpeed} Mbps</span>{' '}
          <span className="text-muted-foreground">peak profile speed</span>
        </p>
      </div>

      {/* Toolbar & Filter */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search package name or speed (e.g. 50)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
              {(['all', 'home', 'corporate'] as const).map((f) => (
                <Button
                  key={f}
                  type="button"
                  size="sm"
                  variant={typeFilter === f ? 'default' : 'ghost'}
                  onClick={() => setTypeFilter(f)}
                  className="text-xs h-7 px-2.5 capitalize"
                >
                  {f === 'all' ? `All (${items.length})` : `${f} (${f === 'home' ? stats.home : stats.corp})`}
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/50">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table Content */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No POP packages found"
              description="No packages match your search or category filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setTypeFilter('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[50px]">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">#</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">POP Package Plan</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Speed (Bandwidth)</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Wholesale Price</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Validity</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Category</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pkg, idx) => (
                  <tr
                    key={pkg.id}
                    className="group border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-xl transition-all duration-200 border shrink-0',
                            pkg.type === 'corporate'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-primary/10 text-primary border-primary/20',
                          )}
                        >
                          <Boxes className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {pkg.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {pkg.id} &middot; Reseller Tariff
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-foreground">
                          <Zap className="h-3 w-3 text-amber-500" />
                          {pkg.speedMbps} Mbps
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        <CurrencyDisplay amount={pkg.priceBdt} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {pkg.validityDays} Days
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold capitalize',
                          pkg.type === 'corporate'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            : 'bg-primary/10 text-primary border-primary/20',
                        )}
                      >
                        {pkg.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {pkg.visible ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-500/10 text-muted-foreground border-slate-500/20 text-[10px] font-medium gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />
                          Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(pkg)}
                          title="Clone package"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Can menu="packages" action="update">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(pkg)}
                            title="Edit package"
                            className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit & Create Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditPkg(null);
        }}
      >
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editPkg ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              {editPkg ? 'Edit POP Package' : 'Create POP Package'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure bandwidth speed quota, wholesale price, and validity duration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Package Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g. POP Fiber Ultra 35 Mbps"
                className="text-xs h-10 shadow-sm"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Speed (Mbps) *</Label>
                <Input
                  type="number"
                  {...register('speedMbps')}
                  className="text-xs h-10 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Wholesale Price (৳ BDT) *</Label>
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
                <Label className="text-xs font-semibold">Plan Category</Label>
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
                    <SelectItem value="home">Home FTTH</SelectItem>
                    <SelectItem value="corporate">Corporate Dedicated</SelectItem>
                    <SelectItem value="hotspot">Public Hotspot</SelectItem>
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
    </div>
  );
}
