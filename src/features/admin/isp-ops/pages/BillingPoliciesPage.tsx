'use client';

import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  Sliders,
  Clock,
  Zap,
  Users,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  MoreVertical,
  Check,
  RefreshCw,
  X,
  Lock,
  Unlock,
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
import type { BillingPolicy } from '@/data/admin/isp-ops.data';

type ModeFilter = 'all' | 'prepaid' | 'postpaid' | 'hybrid';

export function BillingPoliciesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<BillingPolicy | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New policy state
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyMode, setNewPolicyMode] = useState<'prepaid' | 'postpaid' | 'hybrid'>('prepaid');
  const [newPolicyGrace, setNewPolicyGrace] = useState('3');
  const [newPolicyFup, setNewPolicyFup] = useState('500');

  const rawPolicies = useMemo(() => data?.billingPolicies ?? [], [data?.billingPolicies]);

  const totalSubscribers = useMemo(
    () => rawPolicies.reduce((s, p) => s + (p.customersCount ?? 200), 0),
    [rawPolicies]
  );
  const autoSuspendCount = useMemo(
    () => rawPolicies.filter((p) => p.autoSuspend).length,
    [rawPolicies]
  );
  const avgGraceDays = useMemo(
    () => (rawPolicies.length ? (rawPolicies.reduce((s, p) => s + p.graceDays, 0) / rawPolicies.length).toFixed(1) : '0'),
    [rawPolicies]
  );

  const filteredPolicies = useMemo(() => {
    return rawPolicies.filter((p) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.mode.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (modeFilter !== 'all' && p.mode !== modeFilter) {
        return false;
      }

      return true;
    });
  }, [rawPolicies, search, modeFilter]);

  const handleToggleAutoSuspend = (policy: BillingPolicy, e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !policy.autoSuspend;
    toast.success(`${policy.name}: Auto-suspend ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName.trim()) {
      toast.error('Please enter a policy name');
      return;
    }
    toast.success(`Billing policy "${newPolicyName}" created successfully!`);
    setIsAddOpen(false);
    setNewPolicyName('');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load billing policies"
        description="Could not query policy rules from billing daemon."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Billing Policies & FUP Rules"
        subtitle="Configure grace periods, Fair Usage Policy (FUP) data caps, and automatic RADIUS disconnection rules."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Policies' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Billing policies synchronized with RADIUS');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Engine
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Create Billing Policy
            </Button>
          </div>
        }
      />

      {/* KPI Policy Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Policies */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Policies
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rawPolicies.length}
            </span>
            <span className="text-xs text-muted-foreground">rules defined</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Prepaid, Postpaid & Hybrid</span>
          </div>
        </Card>

        {/* Covered Subscribers */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Subscribers
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalSubscribers.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">customers</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-emerald-500 font-medium">100% policy enforcement</span>
          </div>
        </Card>

        {/* Auto-Suspend Rules */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Auto-Suspend Active
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {autoSuspendCount}
            </span>
            <span className="text-xs text-muted-foreground">policies</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Automatic CoA cutoff</span>
          </div>
        </Card>

        {/* Average Grace Days */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg. Grace Period
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {avgGraceDays}
            </span>
            <span className="text-xs text-muted-foreground">days average</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>From 0d to 15d corporate</span>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search policies by name, mode, or description..."
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

          <div className="flex items-center gap-2">
            <Select value={modeFilter} onValueChange={(v) => setModeFilter((v as ModeFilter) || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                <Sliders className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="prepaid">Prepaid Only</SelectItem>
                <SelectItem value="postpaid">Postpaid Only</SelectItem>
                <SelectItem value="hybrid">Hybrid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table & Grid */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Policy Name & Scope</th>
                <th className="py-3 px-3">Billing Mode</th>
                <th className="py-3 px-3">Grace Period</th>
                <th className="py-3 px-4">Fair Usage (FUP Cap)</th>
                <th className="py-3 px-3">Subscribers</th>
                <th className="py-3 px-3">Auto Suspend</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">No billing policies found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing your search terms or create a new policy.</p>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => {
                  return (
                    <tr
                      key={policy.id}
                      onClick={() => setSelectedPolicy(policy)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {policy.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {policy.description ?? 'Standard ISP billing schedule and FUP throttle rule.'}
                          </span>
                        </div>
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-xs font-semibold px-2 py-0.5',
                            policy.mode === 'prepaid' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                            policy.mode === 'postpaid' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                            policy.mode === 'hybrid' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          )}
                        >
                          {policy.mode}
                        </Badge>
                      </td>

                      {/* Grace Period */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {policy.graceDays === 0 ? '0 Days (No Grace)' : `${policy.graceDays} Days Grace`}
                          </span>
                        </div>
                      </td>

                      {/* FUP Cap */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium text-foreground text-xs">
                            {policy.fupGb ? `${policy.fupGb} GB Quota` : <span className="text-emerald-500 font-semibold">Unlimited Quota</span>}
                          </span>
                          {policy.throttleSpeedMbps && (
                            <span className="text-[10px] text-muted-foreground">
                              Throttle to {policy.throttleSpeedMbps} Mbps on cap
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subscribers */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold">{(policy.customersCount ?? 200).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Auto Suspend */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleAutoSuspend(policy, e)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all',
                            policy.autoSuspend
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted'
                          )}
                        >
                          {policy.autoSuspend ? (
                            <>
                              <Check className="h-3 w-3" /> Enabled
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" /> Disabled
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPolicy(policy)}
                            className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                          >
                            <Sliders className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Policy Edit / Detail Drawer */}
      <Sheet open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {selectedPolicy && (
            <>
              <SheetHeader>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                >
                  Policy Configuration
                </Badge>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedPolicy.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  ID: {selectedPolicy.id} · Billing Mode: {selectedPolicy.mode.toUpperCase()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Policy Name</label>
                  <Input defaultValue={selectedPolicy.name} className="h-9 text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Billing Mode</label>
                  <Select defaultValue={selectedPolicy.mode}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid (Pay-First)</SelectItem>
                      <SelectItem value="postpaid">Postpaid (Invoice Net Days)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Grace Window)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Grace Period (Days)</label>
                    <Input defaultValue={selectedPolicy.graceDays} type="number" className="h-9 text-xs font-mono" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">FUP Data Cap (GB)</label>
                    <Input defaultValue={selectedPolicy.fupGb ?? ''} placeholder="Unlimited" type="number" className="h-9 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Throttle Bandwidth Speed (Mbps)</label>
                  <Input defaultValue={selectedPolicy.throttleSpeedMbps ?? 5} type="number" className="h-9 text-xs font-mono" />
                  <p className="text-[10px] text-muted-foreground">Applied automatically via RADIUS CoA when customer exceeds monthly FUP data cap.</p>
                </div>

                <Card className="p-4 border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Automatic Line Suspension</p>
                      <p className="text-[11px] text-muted-foreground">Cutoff internet on expiration / grace end</p>
                    </div>
                    <Badge variant={selectedPolicy.autoSuspend ? 'default' : 'secondary'}>
                      {selectedPolicy.autoSuspend ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </Card>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => {
                      toast.success(`Policy "${selectedPolicy.name}" updated successfully!`);
                      setSelectedPolicy(null);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                  >
                    Save Changes & Sync RADIUS
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPolicy(null)}
                    className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Policy Modal / Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground">Create Billing Policy</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Define a new billing schedule and FUP quota policy for customer packages.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Policy Name *</label>
              <Input
                placeholder="e.g. Student Prepaid 3-Day Grace"
                value={newPolicyName}
                onChange={(e) => setNewPolicyName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Billing Mode</label>
              <Select value={newPolicyMode} onValueChange={(v) => v && setNewPolicyMode(v as 'prepaid' | 'postpaid' | 'hybrid')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid (Pay-First)</SelectItem>
                  <SelectItem value="postpaid">Postpaid (Invoice Net Days)</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Grace Window)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Grace Period (Days)</label>
                <Input
                  type="number"
                  value={newPolicyGrace}
                  onChange={(e) => setNewPolicyGrace(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">FUP Data Cap (GB)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newPolicyFup}
                  onChange={(e) => setNewPolicyFup(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold">
                Create Policy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="w-full text-xs h-9 border-border/80 hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
