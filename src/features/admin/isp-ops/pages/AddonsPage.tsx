'use client';

import { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Tv,
  Film,
  Globe,
  Radio,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Check,
  RefreshCw,
  X,
  Tag,
  ArrowRight,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  PackageCheck,
  ShieldCheck,
  Sliders,
  DollarSign,
  PlayCircle,
  Eye,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { AddonRow } from '@/data/admin/isp-ops.data';

type CategoryFilter = 'all' | 'ott' | 'iptv' | 'static_ip' | 'other';
type StatusFilter = 'all' | 'active' | 'inactive';

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  ott: {
    label: 'OTT Entertainment',
    icon: Film,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  iptv: {
    label: 'IPTV Channels / STB',
    icon: Tv,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  static_ip: {
    label: 'Public Static IP Routing',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  other: {
    label: 'Hardware & Optimization',
    icon: Radio,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

export function AddonsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedAddon, setSelectedAddon] = useState<AddonRow | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Addon Form State
  const [newAddonName, setNewAddonName] = useState('');
  const [newCategory, setNewCategory] = useState<'ott' | 'iptv' | 'static_ip' | 'other'>('ott');
  const [newPrice, setNewPrice] = useState('250');
  const [newStatus, setNewStatus] = useState(true);

  const addonsList = useMemo(() => data?.addons ?? [], [data?.addons]);

  const filteredAddons = useMemo(() => {
    return addonsList.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.priceBdt.toString().includes(q);

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.active) ||
        (statusFilter === 'inactive' && !item.active);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [addonsList, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = addonsList.length;
    const active = addonsList.filter((a) => a.active).length;
    const avgPrice = total > 0 ? Math.round(addonsList.reduce((acc, a) => acc + a.priceBdt, 0) / total) : 0;
    const ottCount = addonsList.filter((a) => a.category === 'ott').length;
    const iptvCount = addonsList.filter((a) => a.category === 'iptv').length;
    const ipCount = addonsList.filter((a) => a.category === 'static_ip').length;

    return { total, active, avgPrice, ottCount, iptvCount, ipCount };
  }, [addonsList]);

  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) {
      toast.error('Addon name is required');
      return;
    }
    toast.success(`Add-on product "${newAddonName}" registered successfully!`);
    setIsNewModalOpen(false);
    setNewAddonName('');
    setNewPrice('250');
  };

  const handleToggleStatus = (addon: AddonRow) => {
    toast.success(`"${addon.name}" is now ${addon.active ? 'Disabled' : 'Activated'}`);
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load addons" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="VAS & Add-on Products"
        subtitle="Manage sellable OTT subscriptions, IPTV channel packages, public static IPs, and hardware leases."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Addons & VAS' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Add-on
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Addons</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">OTT Passes</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Film className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-purple-400">{stats.ottCount}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">IPTV / STB</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Tv className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">{stats.iptvCount}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Static IPs</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.ipCount}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg. Price</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">৳{stats.avgPrice}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search add-ons by title, category, code, price..."
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
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v as CategoryFilter)}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-background/80">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ott">OTT Entertainment</SelectItem>
              <SelectItem value="iptv">IPTV Channels</SelectItem>
              <SelectItem value="static_ip">Public Static IP</SelectItem>
              <SelectItem value="other">Hardware & Others</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-background/80">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Disabled Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Addons Grid / Cards */}
      {filteredAddons.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-10 w-10 text-muted-foreground" />}
          title="No add-on products found"
          description="Try modifying your search or filters, or create a new catalog add-on."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setCategoryFilter('all');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAddons.map((addon) => {
            const cfg = categoryConfig[addon.category] ?? categoryConfig.other;
            const Icon = cfg.icon;

            return (
              <Card
                key={addon.id}
                className={cn(
                  'group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm',
                  !addon.active && 'opacity-65'
                )}
                onClick={() => setSelectedAddon(addon)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn('p-2.5 rounded-xl border', cfg.bg, cfg.color, cfg.border)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5',
                          addon.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        )}
                      >
                        {addon.active ? 'Active' : 'Disabled'}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedAddon(addon); }}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(addon); }}>
                            <Sliders className="h-3.5 w-3.5 mr-2" /> Toggle Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-400"
                            onClick={(e) => { e.stopPropagation(); toast.error(`Cannot delete active add-on with subscribers`); }}
                          >
                            <X className="h-3.5 w-3.5 mr-2" /> Archive Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{addon.id}</span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {addon.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Retail Price</span>
                      <p className="text-lg font-bold font-mono text-foreground">
                        ৳{addon.priceBdt.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAddon(addon);
                      }}
                    >
                      Inspect <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deep Dive Inspector Drawer */}
      <Sheet open={!!selectedAddon} onOpenChange={(open) => !open && setSelectedAddon(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedAddon && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedAddon.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      selectedAddon.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    )}
                  >
                    {selectedAddon.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedAddon.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  VAS product telemetry, subscriber attachment, and package availability.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground capitalize">{selectedAddon.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Monthly Tariff</span>
                      <span className="font-mono font-bold text-primary text-sm">৳{selectedAddon.priceBdt}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium text-foreground">Prepaid / Monthly Recurring</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Mushak 6.3 Tax (5%)</span>
                      <span className="font-mono text-foreground">৳{Math.round(selectedAddon.priceBdt * 0.05)}</span>
                    </div>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provisioning Configuration</h5>
                  <Card className="border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Auto-provisioning upon invoice settlement</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Sparkles className="h-4 w-4" />
                      <span>Compatible with all FTTH & Corporate packages</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <Tv className="h-4 w-4" />
                      <span>Includes direct vendor API sync token</span>
                    </div>
                  </Card>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      handleToggleStatus(selectedAddon);
                      setSelectedAddon(null);
                    }}
                  >
                    {selectedAddon.active ? 'Deactivate Product' : 'Activate Product'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedAddon(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Addon Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="border border-border bg-card text-foreground w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Create New Add-on Product</h3>
                    <p className="text-xs text-muted-foreground">Configure a sellable OTT, IPTV, or Static IP add-on.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAddon} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Add-on Title *</label>
                  <Input
                    placeholder="e.g. SonyLIV Sports HD + Bongo Bundle"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Product Category *</label>
                    <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v as any)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="ott">OTT Entertainment</SelectItem>
                        <SelectItem value="iptv">IPTV Channels / STB</SelectItem>
                        <SelectItem value="static_ip">Public Static IP</SelectItem>
                        <SelectItem value="other">Hardware / Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Price (BDT / month) *</label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="newStatus"
                    checked={newStatus}
                    onChange={(e) => setNewStatus(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="newStatus" className="text-xs text-muted-foreground cursor-pointer">
                    Publish immediately to subscriber portal and sales catalog
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewModalOpen(false)}
                    className="border-border hover:bg-accent text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                    Create Add-on Product
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
