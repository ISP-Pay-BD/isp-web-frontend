'use client';

import { useState, useMemo } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
  Zap,
  Activity,
  Users,
  TrendingUp,
  Server,
  Layers,
  ArrowUpRight,
  Shield,
  Clock,
  Sparkles,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Router,
  ChevronRight,
  Check,
  Building2,
  Home,
  Wifi,
} from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Package } from '@/data/shared/types';

export function PackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [catalogFilter, setCatalogFilter] = useState<'all' | 'home' | 'corporate' | 'hotspot' | 'pop'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
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
      burstSpeedMbps: 15,
      priceBdt: 800,
      validityDays: 30,
      type: 'home',
      visible: true,
      mikrotikProfile: 'pppoe_profile_10M_turbo',
      poolName: 'pool_dhaka_north_cg1',
      fupQuotaGb: 0,
      fupThrottleMbps: 5,
      staticIpIncluded: false,
      slaUptime: '99.5%',
    },
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const popPackages = useMemo(() => data?.popPackages ?? [], [data?.popPackages]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = items.length;
    const home = items.filter((p) => p.type === 'home').length;
    const corp = items.filter((p) => p.type === 'corporate').length;
    const hotspot = items.filter((p) => p.type === 'hotspot').length;
    const pop = popPackages.length;
    const avgPrice = items.length
      ? Math.round(items.reduce((a, p) => a + p.priceBdt, 0) / items.length)
      : 0;
    const totalSubscribers = items.reduce((a, p) => a + (p.activeSubscribers ?? 0), 0);
    return { total, home, corp, hotspot, pop, avgPrice, totalSubscribers };
  }, [items, popPackages]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    let list = items;
    if (catalogFilter === 'pop') {
      list = popPackages;
    } else if (catalogFilter !== 'all') {
      list = items.filter((p) => p.type === catalogFilter);
    }

    if (!search.trim()) return list;

    const q = search.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.mikrotikProfile && p.mikrotikProfile.toLowerCase().includes(q)) ||
        String(p.speedMbps).includes(q) ||
        String(p.priceBdt).includes(q)
    );
  }, [items, popPackages, catalogFilter, search]);

  const openCreate = () => {
    setEditPkg(null);
    reset({
      name: '',
      speedMbps: 10,
      burstSpeedMbps: 15,
      priceBdt: 800,
      validityDays: 30,
      type: 'home',
      visible: true,
      mikrotikProfile: 'pppoe_profile_10M_turbo',
      poolName: 'pool_dhaka_north_cg1',
      fupQuotaGb: 0,
      fupThrottleMbps: 5,
      staticIpIncluded: false,
      slaUptime: '99.5%',
    });
    setDialogOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditPkg(pkg);
    reset({
      name: pkg.name,
      speedMbps: pkg.speedMbps,
      burstSpeedMbps: pkg.burstSpeedMbps ?? pkg.speedMbps,
      priceBdt: pkg.priceBdt,
      validityDays: pkg.validityDays,
      type: pkg.type,
      visible: pkg.visible,
      mikrotikProfile: pkg.mikrotikProfile ?? '',
      poolName: pkg.poolName ?? '',
      fupQuotaGb: pkg.fupQuotaGb ?? 0,
      fupThrottleMbps: pkg.fupThrottleMbps ?? 0,
      staticIpIncluded: pkg.staticIpIncluded ?? false,
      slaUptime: pkg.slaUptime ?? '99.5%',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: PackageFormValues) => {
    if (editPkg) {
      await updateMutation.mutateAsync({ id: editPkg.id, payload: values });
      toast.success(`Package "${values.name}" updated successfully`);
    } else {
      await createMutation.mutateAsync(values);
      toast.success(`Package "${values.name}" created and synced with RADIUS`);
    }
    setDialogOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Package ID',
      'Plan Name',
      'Speed (Mbps)',
      'Burst Speed (Mbps)',
      'Retail Price (BDT)',
      'Validity (Days)',
      'Category',
      'MikroTik Profile',
      'IP Pool',
      'Subscribers',
      'Status',
    ];
    const rows = filteredCatalog.map((p) => [
      p.id,
      p.name,
      p.speedMbps,
      p.burstSpeedMbps ?? p.speedMbps,
      p.priceBdt,
      p.validityDays,
      p.type,
      p.mikrotikProfile ?? 'N/A',
      p.poolName ?? 'Default',
      p.activeSubscribers ?? 0,
      p.visible ? 'Visible' : 'Hidden',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `isp_packages_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Package catalog exported to CSV');
  };

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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Internet Packages & Bandwidth Tiers"
        subtitle="Manage subscriber broadband profiles, queue rate limits, and retail prices"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
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

      {/* KPI Financial & Network Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Profiles
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {stats.total}
              </span>
              <span className="text-xs text-muted-foreground">tier profiles</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{stats.home} Home · {stats.corp} Corp · {stats.hotspot} Hotspot</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Subscribers
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                {stats.totalSubscribers.toLocaleString()}
              </span>
              <span className="text-xs text-purple-400 font-medium">onboarded</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Across GPON, PPPoE & Hotspot queues
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Average ARPU
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                <CurrencyDisplay amount={stats.avgPrice} />
              </span>
              <span className="text-xs text-emerald-500 font-medium">/ month</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Average revenue per active retail tier
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                MikroTik Sync
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Server className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5" /> 100%
              </span>
              <span className="text-xs text-muted-foreground">RADIUS CoA</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Rate-limit profile sync active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search + Category Pills + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by package name, speed, profile or price..."
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
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: `All (${items.length})` },
                { key: 'home', label: `Home (${stats.home})` },
                { key: 'corporate', label: `Corporate (${stats.corp})` },
                { key: 'hotspot', label: `Hotspot (${stats.hotspot})` },
                { key: 'pop', label: `POP Reseller (${stats.pop})` },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={catalogFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setCatalogFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  catalogFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
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
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredCatalog.length === 0 ? (
        <EmptyState
          title="No packages found"
          description="No internet packages match your search filter."
          actionLabel="Add Package"
          onAction={openCreate}
        />
      ) : viewMode === 'table' ? (
        /* High-Density Interactive Data Table */
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Plan Name & ID</th>
                  <th className="py-3 px-4">Bandwidth / Burst</th>
                  <th className="py-3 px-4">MikroTik Profile</th>
                  <th className="py-3 px-4">Retail Price</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Subscribers</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCatalog.map((pkg) => {
                  const isCorp = pkg.type === 'corporate';
                  const isHotspot = pkg.type === 'hotspot';
                  return (
                    <tr
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg font-bold shrink-0',
                              isCorp
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : isHotspot
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            )}
                          >
                            {isCorp ? (
                              <Building2 className="h-4 w-4" />
                            ) : isHotspot ? (
                              <Wifi className="h-4 w-4" />
                            ) : (
                              <Home className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                              {pkg.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {pkg.id} {pkg.staticIpIncluded && '· Static IP'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="font-bold text-foreground text-sm">
                            {pkg.speedMbps} Mbps
                          </span>
                          {pkg.burstSpeedMbps && pkg.burstSpeedMbps > pkg.speedMbps && (
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              ⚡ {pkg.burstSpeedMbps}M Burst
                            </span>
                          )}
                        </div>
                        {pkg.fupQuotaGb ? (
                          <div className="text-[10px] text-muted-foreground">
                            FUP: {pkg.fupQuotaGb}GB → {pkg.fupThrottleMbps}M
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-500/80 font-medium">
                            Unlimited FUP
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        <div className="truncate max-w-[160px]" title={pkg.mikrotikProfile ?? 'default'}>
                          {pkg.mikrotikProfile ?? 'pppoe_default'}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70">
                          {pkg.poolName ?? 'pool_default'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        ৳{pkg.priceBdt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        <span className="font-medium text-foreground">{pkg.validityDays}</span> days
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono font-semibold text-foreground">
                            {(pkg.activeSubscribers ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold tracking-wider',
                            isCorp
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : isHotspot
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          )}
                        >
                          {pkg.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {pkg.visible ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                            <Eye className="h-3.5 w-3.5" /> Visible
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <EyeOff className="h-3.5 w-3.5" /> Hidden
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Can menu="packages" action="update">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                              onClick={() => openEdit(pkg)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Can>
                          <Can menu="packages" action="delete">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteId(pkg.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Premium Card Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.map((pkg) => {
            const isCorp = pkg.type === 'corporate';
            const isHotspot = pkg.type === 'hotspot';
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all duration-200 group relative cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider',
                          isCorp
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : isHotspot
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        )}
                      >
                        {pkg.type}
                      </Badge>
                      <h3 className="font-bold text-base text-foreground mt-2 group-hover:text-primary transition-colors">
                        {pkg.name}
                      </h3>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {pkg.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {pkg.visible ? (
                        <span title="Visible to subscribers" className="text-emerald-400 p-1">
                          <Eye className="h-4 w-4" />
                        </span>
                      ) : (
                        <span title="Hidden from customer portal" className="text-muted-foreground p-1">
                          <EyeOff className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bandwidth & Price Tile */}
                  <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Bandwidth Speed</div>
                      <div className="text-xl font-black font-mono text-foreground flex items-baseline gap-1">
                        <span>{pkg.speedMbps}</span>
                        <span className="text-xs font-normal text-muted-foreground">Mbps</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">Retail Price</div>
                      <div className="text-xl font-black font-mono text-primary">
                        ৳{pkg.priceBdt.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Specs list */}
                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        Validity Cycle
                      </span>
                      <span className="font-semibold text-foreground">{pkg.validityDays} Days</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-purple-400" />
                        Active Subscribers
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {(pkg.activeSubscribers ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Router className="h-3.5 w-3.5 text-blue-400" />
                        MikroTik Profile
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[130px]">
                        {pkg.mikrotikProfile ?? 'pppoe_std'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" />
                        SLA Target
                      </span>
                      <span className="font-semibold text-emerald-400">{pkg.slaUptime ?? '99.5%'}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPkg(pkg)}
                    className="h-8 text-xs border-border/60 hover:bg-accent gap-1"
                  >
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
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
              </div>
            );
          })}
        </div>
      )}

      {/* Package Deep-Dive Inspector Sheet */}
      <Sheet open={Boolean(selectedPkg)} onOpenChange={(open) => !open && setSelectedPkg(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedPkg && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20"
                  >
                    {selectedPkg.type}
                  </Badge>
                  {selectedPkg.visible ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Live on Portal
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border/50">
                      Hidden
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedPkg.name}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  ID: {selectedPkg.id}
                </SheetDescription>
              </SheetHeader>

              {/* Bandwidth & Cost Highlights */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Speed Quota</div>
                  <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                    {selectedPkg.speedMbps} <span className="text-xs font-normal text-muted-foreground">Mbps</span>
                  </div>
                  {selectedPkg.burstSpeedMbps && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                      ⚡ {selectedPkg.burstSpeedMbps} Mbps Burst Cap
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground font-semibold">Monthly Price</div>
                  <div className="text-2xl font-black font-mono text-primary mt-0.5">
                    ৳{selectedPkg.priceBdt.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {selectedPkg.validityDays} Days Validity
                  </div>
                </div>
              </div>

              {/* MikroTik & Provisioning Telemetry */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Router className="h-4 w-4 text-primary" />
                  Router & RADIUS Parameters
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50 font-mono">
                    <span className="text-muted-foreground">MikroTik Profile</span>
                    <span className="font-bold text-foreground">{selectedPkg.mikrotikProfile ?? 'pppoe_std'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50 font-mono">
                    <span className="text-muted-foreground">IP Pool</span>
                    <span className="font-bold text-foreground">{selectedPkg.poolName ?? 'pool_dhaka_north_cg1'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-muted-foreground">Static IP Route</span>
                    <span className="font-bold text-foreground">
                      {selectedPkg.staticIpIncluded ? 'Included (1 Public IP)' : 'CGNAT Shared Pool'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                    <span className="text-muted-foreground">SLA Guaranteed</span>
                    <span className="font-bold text-emerald-400 font-mono">{selectedPkg.slaUptime ?? '99.5%'}</span>
                  </div>
                </div>
              </div>

              {/* Subscribers Stats */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300">Active Subscribers on Tier</span>
                  <span className="font-mono font-bold text-purple-200 text-sm">
                    {(selectedPkg.activeSubscribers ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Generates estimated MRR of ৳{((selectedPkg.activeSubscribers ?? 0) * selectedPkg.priceBdt).toLocaleString()} BDT.
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/60">
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
                <Button
                  variant="outline"
                  onClick={() => setSelectedPkg(null)}
                  className="text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Package Creation & Edit Dialog */}
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
              Configure bandwidth speed, MikroTik rate-limiting queue, and retail price.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Package Plan Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g. Home Ultra 40 Mbps Turbo"
                className="text-xs h-9 shadow-xs"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Speed Limit (Mbps)</Label>
                <Input
                  type="number"
                  {...register('speedMbps')}
                  className="text-xs h-9 font-mono shadow-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Burst Speed (Mbps)</Label>
                <Input
                  type="number"
                  {...register('burstSpeedMbps')}
                  placeholder="Optional burst"
                  className="text-xs h-9 font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Retail Price (৳ BDT)</Label>
                <Input
                  type="number"
                  {...register('priceBdt')}
                  className="text-xs h-9 font-mono shadow-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Validity (Days)</Label>
                <Input
                  type="number"
                  {...register('validityDays')}
                  className="text-xs h-9 font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Tier</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) =>
                    v && setValue('type', v as PackageFormValues['type'])
                  }
                >
                  <SelectTrigger className="text-xs h-9 shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Broadband</SelectItem>
                    <SelectItem value="corporate">Corporate Dedicated</SelectItem>
                    <SelectItem value="hotspot">Public Hotspot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">MikroTik Profile</Label>
                <Input
                  {...register('mikrotikProfile')}
                  placeholder="pppoe_profile_name"
                  className="text-xs h-9 font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                disabled={isSubmitting}
              >
                {editPkg ? 'Save Changes' : 'Create & Sync with Router'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
    </div>
  );
}
