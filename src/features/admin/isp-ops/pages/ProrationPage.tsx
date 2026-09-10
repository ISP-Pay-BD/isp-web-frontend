'use client';

import { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ProrationExample } from '@/data/admin/isp-ops.data';

export function ProrationPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  // Interactive Calculator Sandbox
  const [calcFromPrice, setCalcFromPrice] = useState<number>(800);
  const [calcToPrice, setCalcToPrice] = useState<number>(1500);
  const [calcDaysUsed, setCalcDaysUsed] = useState<number>(10);
  const [calcCycleDays, setCalcCycleDays] = useState<number>(30);
  const [search, setSearch] = useState('');

  const rawRows = useMemo(() => data?.prorationExamples ?? [], [data?.prorationExamples]);

  // Proration Sandbox Calculations
  const remainingDays = Math.max(0, calcCycleDays - calcDaysUsed);
  const unusedCredit = Math.round((remainingDays / calcCycleDays) * calcFromPrice);
  const newPlanCharge = Math.round((remainingDays / calcCycleDays) * calcToPrice);
  const netPayable = newPlanCharge - unusedCredit;
  const isUpgrade = calcToPrice >= calcFromPrice;

  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase().trim();
      return (
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        r.fromPackage.toLowerCase().includes(q) ||
        r.toPackage.toLowerCase().includes(q)
      );
    });
  }, [rawRows, search]);

  const handleApplyProration = () => {
    toast.success(`Prorated package upgrade calculated! Net invoice ৳ ${netPayable.toLocaleString()} generated and speed adjusted via RADIUS.`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load proration wizard"
        description="Could not load package change calculations."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Proration Wizard & Mid-Cycle Upgrades"
        subtitle="Accurately compute credit refunds, prorated charges, and net adjustments when subscribers upgrade or downgrade plans mid-month."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Proration Wizard' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Proration ledger synchronized');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Ledger
            </Button>
          </div>
        }
      />

      {/* Interactive Sandbox Calculator Card */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-md overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Live Mid-Cycle Plan Change Simulator
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-primary/30 text-primary font-mono">
              Auto-Prorated (Exact Day Basis)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Existing Package */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Current Package Monthly Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">৳</span>
                <Input
                  type="number"
                  value={calcFromPrice}
                  onChange={(e) => setCalcFromPrice(Number(e.target.value) || 0)}
                  className="pl-7 h-9 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">e.g. Home 20 Mbps (৳ 800)</p>
            </div>

            {/* Target Package */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Target New Package Monthly Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">৳</span>
                <Input
                  type="number"
                  value={calcToPrice}
                  onChange={(e) => setCalcToPrice(Number(e.target.value) || 0)}
                  className="pl-7 h-9 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">e.g. Home Turbo 50 Mbps (৳ 1,500)</p>
            </div>

            {/* Days Elapsed */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Days Already Used in Cycle
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  value={calcDaysUsed}
                  onChange={(e) => setCalcDaysUsed(Number(e.target.value) || 0)}
                  className="pl-8 h-9 text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{remainingDays} days remaining in 30d cycle</p>
            </div>

            {/* Net Amount Box */}
            <div className={cn(
              'p-4 rounded-lg border flex flex-col justify-between',
              isUpgrade ? 'bg-primary/10 border-primary/30' : 'bg-emerald-500/10 border-emerald-500/30'
            )}>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {isUpgrade ? 'Net Payable by Subscriber' : 'Credit Refund to Account'}
                </span>
                <p className="text-xl font-bold font-mono text-foreground mt-1 tabular-nums">
                  ৳ {Math.abs(netPayable).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">BDT</span>
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleApplyProration}
                className="mt-2 text-xs h-7 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Apply & Bill Now
              </Button>
            </div>
          </div>

          {/* Mathematical Breakdown Formula */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/60 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">1. Unused Old Plan Credit:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ({remainingDays}/30) × ৳{calcFromPrice} = ৳{unusedCredit}
              </span>
            </div>
            <span>+</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">2. Prorated New Plan Charge:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">
                ({remainingDays}/30) × ৳{calcToPrice} = ৳{newPlanCharge}
              </span>
            </div>
            <span>=</span>
            <div className="flex items-center gap-2 font-bold text-primary">
              <span>Net:</span>
              <span>৳{netPayable} BDT</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proration Ledger Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by customer name or package plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredRows.length} recent proration events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Subscriber Name</th>
                <th className="py-3 px-4">Original Plan</th>
                <th className="py-3 px-4">New Target Plan</th>
                <th className="py-3 px-3">Days Used</th>
                <th className="py-3 px-4">Unused Credit</th>
                <th className="py-3 px-4">New Plan Charge</th>
                <th className="py-3 px-4">Net Adjustment</th>
                <th className="py-3 px-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.map((row) => {
                const isUp = row.netBdt >= 0;

                return (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-foreground text-sm">
                        {row.customerName ?? 'Subscriber Account'}
                      </span>
                    </td>

                    {/* From Package */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{row.fromPackage}</span>
                        {row.fromPriceBdt && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            ৳ {row.fromPriceBdt.toLocaleString()} / mo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* To Package */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{row.toPackage}</span>
                        {row.toPriceBdt && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            ৳ {row.toPriceBdt.toLocaleString()} / mo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Days Used */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {row.daysUsed} / {row.cycleDays ?? 30} days
                      </span>
                    </td>

                    {/* Unused Credit */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                      -৳ {row.creditBdt.toLocaleString()}
                    </td>

                    {/* Charge */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-foreground font-medium tabular-nums">
                      +৳ {row.chargeBdt.toLocaleString()}
                    </td>

                    {/* Net */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-sm tabular-nums">
                      <span className={cn(isUp ? 'text-primary' : 'text-emerald-500')}>
                        {isUp ? '+' : ''}৳ {row.netBdt.toLocaleString()}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase px-2 py-0.5',
                          isUp
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        )}
                      >
                        {isUp ? 'Upgrade' : 'Downgrade'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
