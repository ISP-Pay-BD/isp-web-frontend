'use client';

import { useState, useMemo } from 'react';
import {
  Smartphone,
  Search,
  Plus,
  Radio,
  Zap,
  Clock,
  CheckCircle2,
  MoreVertical,
  RefreshCw,
  X,
  ArrowRight,
  TrendingUp,
  Filter,
  DollarSign,
  Eye,
  Sliders,
  HardDrive,
  Signal,
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
import type { MobilePlan } from '@/data/admin/isp-ops.data';

type ValidityFilter = 'all' | '15' | '30' | '60' | '90';
type StatusFilter = 'all' | 'active' | 'inactive';

export function MobilePlansPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPlan, setSelectedPlan] = useState<MobilePlan | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Plan Form State
  const [newPlanName, setNewPlanName] = useState('');
  const [newDataGb, setNewDataGb] = useState('50');
  const [newValidityDays, setNewValidityDays] = useState('30');
  const [newPriceBdt, setNewPriceBdt] = useState('699');
  const [newActive, setNewActive] = useState(true);

  const plansList = useMemo(() => data?.mobilePlans ?? [], [data?.mobilePlans]);

  const filteredPlans = useMemo(() => {
    return plansList.filter((plan) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        plan.id.toLowerCase().includes(q) ||
        plan.dataGb.toString().includes(q) ||
        plan.priceBdt.toString().includes(q);

      const matchesValidity =
        validityFilter === 'all' || plan.validityDays.toString() === validityFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && plan.active) ||
        (statusFilter === 'inactive' && !plan.active);

      return matchesSearch && matchesValidity && matchesStatus;
    });
  }, [plansList, search, validityFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = plansList.length;
    const active = plansList.filter((p) => p.active).length;
    const avgPrice = total > 0 ? Math.round(plansList.reduce((s, p) => s + p.priceBdt, 0) / total) : 0;
    const maxData = plansList.reduce((m, p) => Math.max(m, p.dataGb), 0);
    return { total, active, avgPrice, maxData };
  }, [plansList]);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      toast.error('Plan name is required');
      return;
    }
    toast.success(`Mobile 4G/LTE plan "${newPlanName}" created successfully!`);
    setIsNewModalOpen(false);
    setNewPlanName('');
    setNewDataGb('50');
    setNewPriceBdt('699');
  };

  const handleToggleStatus = (plan: MobilePlan) => {
    toast.success(`Plan "${plan.name}" status updated to ${plan.active ? 'Disabled' : 'Active'}`);
  };

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load mobile broadband plans" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="4G / LTE Mobile Broadband Plans"
        subtitle="Manage hybrid failover cellular data pools, SIM backup bundles, field telemetry plans, and quota thresholds."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Mobile Plans' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
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
              New LTE Plan
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total LTE Plans</p>
              <h3 className="text-xl font-bold font-mono text-foreground">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Catalog</p>
              <h3 className="text-xl font-bold font-mono text-emerald-400">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Signal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Max Data Cap</p>
              <h3 className="text-xl font-bold font-mono text-blue-400">{stats.maxData} GB</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Avg. Tariff</p>
              <h3 className="text-xl font-bold font-mono text-amber-400">৳{stats.avgPrice}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search LTE plans by name, data volume, price, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/80"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={validityFilter} onValueChange={(v) => v && setValidityFilter(v as ValidityFilter)}>
              <SelectTrigger className="w-[160px] h-9 text-xs bg-background/80 border-border/80">
                <SelectValue placeholder="Validity Duration" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Validities</SelectItem>
                <SelectItem value="15">15 Days</SelectItem>
                <SelectItem value="30">30 Days (Monthly)</SelectItem>
                <SelectItem value="60">60 Days (Bi-Monthly)</SelectItem>
                <SelectItem value="90">90 Days (Quarterly)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-xs bg-background/80 border-border/80">
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
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={<Smartphone className="h-10 w-10 text-muted-foreground" />}
          title="No mobile plans found"
          description="No LTE data plans match your active filter criteria."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setValidityFilter('all');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map((plan) => {
            const costPerGb = (plan.priceBdt / plan.dataGb).toFixed(1);

            return (
              <Card
                key={plan.id}
                className={cn(
                  'group relative border border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden cursor-pointer shadow-sm',
                  !plan.active && 'opacity-65'
                )}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Signal className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5',
                          plan.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border/60'
                        )}
                      >
                        {plan.active ? 'Active' : 'Disabled'}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(plan); }}>
                            <Sliders className="h-3.5 w-3.5 mr-2" /> Toggle Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{plan.id}</span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {plan.name}
                    </h4>
                  </div>

                  {/* Volume specs */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Data Volume</p>
                      <p className="text-base font-bold font-mono text-primary">{plan.dataGb} GB</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Validity</p>
                      <p className="text-base font-bold font-mono text-foreground">{plan.validityDays} Days</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground">৳{costPerGb}/GB</span>
                      <p className="text-lg font-bold font-mono text-foreground">৳{plan.priceBdt.toLocaleString()}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary group-hover:translate-x-1 transition-transform p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan);
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

      {/* Inspector Drawer */}
      <Sheet open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedPlan && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedPlan.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      selectedPlan.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border/60'
                    )}
                  >
                    {selectedPlan.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedPlan.name}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Cellular SIM provisioning, failover policy rules, and APN parameters.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Quota Volume</span>
                    <span className="font-mono font-bold text-foreground text-sm">{selectedPlan.dataGb} GB</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Validity Duration</span>
                    <span className="font-medium text-foreground">{selectedPlan.validityDays} Calendar Days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Retail Price</span>
                    <span className="font-mono font-bold text-primary text-sm">৳{selectedPlan.priceBdt}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Effective Rate</span>
                    <span className="font-mono text-muted-foreground">৳{(selectedPlan.priceBdt / selectedPlan.dataGb).toFixed(2)} per GB</span>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carrier APN Settings</h5>
                  <Card className="border border-border/70 bg-muted/20 p-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">APN Name:</span>
                      <span className="text-foreground">isppay.failover.net</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Auth Type:</span>
                      <span className="text-foreground">PAP / CHAP (Auto)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">IP Allocation:</span>
                      <span className="text-emerald-400">CGNAT IPv4 / IPv6 Dual</span>
                    </div>
                  </Card>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      handleToggleStatus(selectedPlan);
                      setSelectedPlan(null);
                    }}
                  >
                    {selectedPlan.active ? 'Deactivate Plan' : 'Activate Plan'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedPlan(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New LTE Plan Modal */}
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
                    <h3 className="text-lg font-bold text-foreground">Create 4G / LTE Plan</h3>
                    <p className="text-xs text-muted-foreground">Configure quota, validity duration, and pricing.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Plan Title *</label>
                  <Input
                    placeholder="e.g. LTE 50GB Hybrid Backup Pack"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Data (GB) *</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={newDataGb}
                      onChange={(e) => setNewDataGb(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Validity (Days) *</label>
                    <Select value={newValidityDays} onValueChange={(v) => v && setNewValidityDays(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="15">15 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Price (BDT) *</label>
                    <Input
                      type="number"
                      placeholder="699"
                      value={newPriceBdt}
                      onChange={(e) => setNewPriceBdt(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="newActiveStatus"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="rounded border-border bg-card text-primary focus:ring-primary"
                  />
                  <label htmlFor="newActiveStatus" className="text-xs text-muted-foreground cursor-pointer">
                    Enable plan for immediate subscriber bundle add-on
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
                    Create Mobile Plan
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
