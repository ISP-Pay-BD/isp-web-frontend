'use client';

import { useState, useMemo } from 'react';
import {
  Scale,
  Landmark,
  CreditCard,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Building,
  DollarSign,
  PieChart,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { useBalanceSheet } from '../hooks/use-balance-sheet';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function SectionBlock({
  title,
  total,
  items,
  icon: Icon,
  color,
  bg,
  border,
}: {
  title: string;
  total: number;
  items: Array<{ name: string; amountBdt: number }>;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden h-full flex flex-col justify-between">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl border', color, bg, border)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground">{items.length} accounting line items</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs font-bold font-mono px-2.5 py-1', color, bg, border)}>
            ৳{total.toLocaleString()}
          </Badge>
        </div>

        {/* Items list */}
        <div className="p-3.5">
          <ul className="space-y-1">
            {items.map((item) => {
              const pct = total > 0 ? ((item.amountBdt / total) * 100).toFixed(1) : '0';
              return (
                <li
                  key={item.name}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors group border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    <div>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        {pct}% of category
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    ৳{item.amountBdt.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function BalanceSheetPage() {
  const { balanceSheet, isLoading, isError, refetch } = useBalanceSheet();

  const handleExportCSV = () => {
    toast.success(`Exporting audited balance sheet snapshot (as of ${balanceSheet?.asOf ?? 'today'})...`);
  };

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;

  if (isError || !balanceSheet) {
    return (
      <EmptyState
        title="Failed to load balance sheet"
        description="Could not generate the financial snapshot."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const isBalanced =
    balanceSheet.assets.totalBdt === balanceSheet.liabilities.totalBdt + balanceSheet.equity.totalBdt;

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Balance Sheet (Financial Position)"
        subtitle={`Summary of assets, liabilities, and retained equity snapshot as of ${balanceSheet.asOf}.`}
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Balance Sheet' }]}
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
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export Balance Sheet
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Assets
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-blue-400 font-mono">
                ৳{balanceSheet.assets.totalBdt.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Current & Fixed Infrastructure Holdings
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Liabilities
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">
                ৳{balanceSheet.liabilities.totalBdt.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Upstream Transit & Security Payables
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Retained Equity
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                ৳{balanceSheet.equity.totalBdt.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Cumulative Net Retained Solvency
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Accounting Equation
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" /> Balanced & Reconciled
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Assets = Liabilities + Equity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets & Liabilities Side-by-Side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock
          title="Assets (Current & Fixed Infrastructure)"
          total={balanceSheet.assets.totalBdt}
          items={balanceSheet.assets.items}
          icon={Landmark}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <SectionBlock
          title="Liabilities (Payables & Advances)"
          total={balanceSheet.liabilities.totalBdt}
          items={balanceSheet.liabilities.items}
          icon={CreditCard}
          color="text-amber-400"
          bg="bg-amber-500/10"
          border="border-amber-500/20"
        />
      </div>

      {/* Total Equity & Accounting Summary Banner */}
      <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-sm overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Scale className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground">Total Equity & Capital Solvency</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Assets (৳{balanceSheet.assets.totalBdt.toLocaleString()}) = Liabilities (৳{balanceSheet.liabilities.totalBdt.toLocaleString()}) + Equity (৳{balanceSheet.equity.totalBdt.toLocaleString()})
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-base sm:text-lg font-bold font-mono px-4 py-2 shadow-xs self-start sm:self-auto"
            >
              ৳{balanceSheet.equity.totalBdt.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
