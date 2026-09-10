'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Users,
  FileText,
  Activity,
  Zap,
  TrendingUp,
  Building2,
  DollarSign,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';

const SELL_MODULES = [
  {
    href: '/admin/bandwidth/sell/clients',
    label: 'Wholesale & Corporate Clients',
    badge: 'Buyers Directory',
    icon: Users,
    color: 'text-primary bg-primary/10 border-primary/20',
    desc: 'Manage downstream wholesale POP buyers, corporate DIA leased lines, and dedicated accounts.',
  },
  {
    href: '/admin/bandwidth/sell/invoices',
    label: 'Sales Invoices & Billing',
    badge: 'Receivables Ledger',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Generate NBR Mushak-compliant invoices, track collection reconciliations, and record payments.',
  },
] as const;

export function BandwidthSellHubPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load bandwidth sell hub"
          description="Could not fetch wholesale overview."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const clients = data?.sellClients ?? [];
  const invoices = data?.invoices ?? [];
  const totalAllocated = clients.reduce((s, c) => s + c.allocatedMbps, 0);
  const totalMonthlySell = clients.reduce((s, c) => s + c.monthlyRateBdt, 0);
  const totalDue = clients.reduce((s, c) => s + c.balanceDueBdt, 0);
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const openInvoices = invoices.filter((i) => i.status !== 'paid').length;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Sell Hub"
        subtitle="Wholesale bandwidth distribution, corporate DIA subscriber accounts, and sales invoice billing"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth' },
          { label: 'Bandwidth Sell' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/bandwidth/sell/clients">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/80">
                <Users className="h-3.5 w-3.5 text-primary" /> Manage Clients
              </Button>
            </Link>
            <Link href="/admin/bandwidth/sell/invoices">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Sales Invoices
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{clients.length}</span>{' '}
          <span className="text-muted-foreground">corporate clients · {activeClients} active</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{totalAllocated} Mbps</span>{' '}
          <span className="text-muted-foreground">total sold bandwidth</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(totalMonthlySell)}
          </span>{' '}
          <span className="text-muted-foreground">monthly recurring sales</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {formatBdtWithSymbol(totalDue)}
          </span>{' '}
          <span className="text-muted-foreground">outstanding client receivables</span>
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SELL_MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full group">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn('p-2.5 rounded-xl border shrink-0', mod.color)}>
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
                    {mod.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{mod.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Wholesale Client Accounts Snapshot */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Active Wholesale & Corporate Accounts
          </CardTitle>
          <CardDescription className="text-xs">
            Direct dedicated leased lines and sub-ISP wholesale distribution summaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clients.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground truncate">{c.clientName}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {c.popZone}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">Allocation:</span>
                  <span className="text-sm font-mono font-bold text-primary">{c.allocatedMbps} Mbps</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Monthly Rate:</span>
                  <span className="font-mono font-semibold text-foreground">৳{c.monthlyRateBdt.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
