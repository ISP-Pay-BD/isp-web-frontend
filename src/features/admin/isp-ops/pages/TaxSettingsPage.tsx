'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Percent,
  Search,
  Plus,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  X,
  Sliders,
  Check,
  HelpCircle,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { TaxSetting } from '@/data/admin/isp-ops.data';

export function TaxSettingsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [selectedTax, setSelectedTax] = useState<TaxSetting | null>(null);

  // Live Calculator State
  const [calcBaseAmount, setCalcBaseAmount] = useState<number>(1000);
  const [calcTaxRate, setCalcTaxRate] = useState<number>(15);
  const [calcInclusive, setCalcInclusive] = useState<boolean>(false);

  const rawTaxes = useMemo(() => data?.taxSettings ?? [], [data?.taxSettings]);

  const totalCollectedMonth = useMemo(
    () => rawTaxes.reduce((s, t) => s + (t.collectedThisMonthBdt ?? 0), 0),
    [rawTaxes]
  );
  const activeCount = useMemo(() => rawTaxes.filter((t) => t.active).length, [rawTaxes]);

  const filteredTaxes = useMemo(() => {
    return rawTaxes.filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase().trim();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q)) ||
        (t.nbrCode && t.nbrCode.toLowerCase().includes(q)) ||
        t.applyTo.toLowerCase().includes(q)
      );
    });
  }, [rawTaxes, search]);

  // Live calculation results
  const calculatedVat = useMemo(() => {
    if (calcInclusive) {
      return Math.round(calcBaseAmount - calcBaseAmount / (1 + calcTaxRate / 100));
    } else {
      return Math.round(calcBaseAmount * (calcTaxRate / 100));
    }
  }, [calcBaseAmount, calcTaxRate, calcInclusive]);

  const calculatedTotal = useMemo(() => {
    if (calcInclusive) {
      return calcBaseAmount;
    } else {
      return calcBaseAmount + calculatedVat;
    }
  }, [calcBaseAmount, calculatedVat, calcInclusive]);

  const handleToggleActive = (tax: TaxSetting, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${tax.name}: Status toggled`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load tax settings"
        description="Could not query NBR tax configuration."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Tax & VAT Settings"
        subtitle="Configure Bangladesh NBR Value Added Tax (Mushak 6.3), Advance Income Tax (AIT), and OTC service levies."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Tax / VAT' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Tax definitions updated from NBR schema');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync NBR Rules
            </Button>

            <Button
              size="sm"
              onClick={() => toast.info('Tax head creation template loaded')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Tax Head
            </Button>
          </div>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total VAT Collected */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              VAT Collected (Month)
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              ৳ {totalCollectedMonth.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>NBR Challan ready</span>
            <span className="text-emerald-500 font-medium">Mushak 6.3</span>
          </div>
        </Card>

        {/* Standard Broadband VAT */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Broadband VAT Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              15.0%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>NBR ISP Statutory Rate</span>
          </div>
        </Card>

        {/* Active Tax Heads */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Tax Rules
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {activeCount} / {rawTaxes.length}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Invoices, OTC & Hardware</span>
          </div>
        </Card>

        {/* Compliance Status */}
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Compliance Status
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              Compliant
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono text-[10px]">BIN: 002391024-0101</span>
          </div>
        </Card>
      </div>

      {/* Live VAT & Tax Calculator Box */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Interactive VAT & Tax Calculator Widget
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/80">
              Real-time Preview
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Base Package Price (BDT)
              </label>
              <Input
                type="number"
                value={calcBaseAmount}
                onChange={(e) => setCalcBaseAmount(Number(e.target.value) || 0)}
                className="h-9 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Tax Head / Rate
              </label>
              <Select
                value={String(calcTaxRate)}
                onValueChange={(v) => setCalcTaxRate(Number(v))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Broadband VAT (15%)</SelectItem>
                  <SelectItem value="5">OTC Service Tax (5%)</SelectItem>
                  <SelectItem value="3">Corporate AIT (3%)</SelectItem>
                  <SelectItem value="7.5">Hardware Sales (7.5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Computed Tax / VAT
              </span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums">
                ৳ {calculatedVat.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">BDT</span>
              </p>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <span className="text-[10px] text-primary uppercase font-semibold">
                Gross Total Payable
              </span>
              <p className="text-lg font-bold text-primary font-mono tabular-nums">
                ৳ {calculatedTotal.toLocaleString()} <span className="text-xs font-normal text-primary/80">BDT</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tax rules by name, NBR code, or scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredTaxes.length} tax rules configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Tax Description & NBR Reference</th>
                <th className="py-3 px-3">Tax Rate</th>
                <th className="py-3 px-3">Calculation Type</th>
                <th className="py-3 px-3">Applicable Scope</th>
                <th className="py-3 px-4">Collected (Month)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTaxes.map((tax) => {
                return (
                  <tr
                    key={tax.id}
                    onClick={() => setSelectedTax(tax)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    {/* Name & NBR */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {tax.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono text-[10px] font-semibold text-primary">{tax.code ?? 'VAT'}</span>
                          {tax.nbrCode && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-[10px]">{tax.nbrCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold font-mono text-sm text-foreground">
                        {tax.ratePct}%
                      </span>
                    </td>

                    {/* Inclusive vs Exclusive */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          tax.inclusive
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        )}
                      >
                        {tax.inclusive ? 'Inclusive (In Price)' : 'Exclusive (+ On Top)'}
                      </Badge>
                    </td>

                    {/* Scope */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {tax.applyTo}
                      </Badge>
                    </td>

                    {/* Collected This Month */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-foreground text-xs tabular-nums">
                        ৳ {(tax.collectedThisMonthBdt ?? 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(tax, e)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all',
                          tax.active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted/60 text-muted-foreground border-border/80'
                        )}
                      >
                        {tax.active ? (
                          <>
                            <Check className="h-3 w-3" /> Active
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTax(tax)}
                        className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Tax Drawer */}
      <Sheet open={!!selectedTax} onOpenChange={(open) => !open && setSelectedTax(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {selectedTax && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-bold text-foreground">
                  Tax Head: {selectedTax.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  NBR Mushak Schedule Configuration
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Tax Head Name</label>
                  <Input defaultValue={selectedTax.name} className="h-9 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Rate Percentage (%)</label>
                    <Input defaultValue={selectedTax.ratePct} type="number" className="h-9 text-xs font-mono font-bold" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Internal Code</label>
                    <Input defaultValue={selectedTax.code ?? 'VAT-15'} className="h-9 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">NBR Reference Code</label>
                  <Input defaultValue={selectedTax.nbrCode ?? 'Mushak-6.3-9901'} className="h-9 text-xs font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Applicable Scope</label>
                  <Select defaultValue={selectedTax.applyTo}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Monthly Invoices Only</SelectItem>
                      <SelectItem value="otc">One-Time Connection (OTC) Only</SelectItem>
                      <SelectItem value="both">Both Invoices & OTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => {
                      toast.success(`Tax head "${selectedTax.name}" updated successfully!`);
                      setSelectedTax(null);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                  >
                    Save Tax Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTax(null)}
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
    </div>
  );
}
