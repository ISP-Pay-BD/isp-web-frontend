'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  Truck,
  FileText,
  Package,
  Activity,
  Zap,
  TrendingUp,
  CreditCard,
  Building2,
  PieChart,
  HardDrive,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';

const HUB_MODULES = [
  {
    href: '/admin/bandwidth/buy/items',
    label: 'Catalog Items',
    badge: 'SKU Products',
    icon: Package,
    color: 'text-primary bg-primary/10 border-primary/20',
    desc: 'Upstream Dedicated Internet (DIA), BDIX peering, and Content Cache products.',
  },
  {
    href: '/admin/bandwidth/buy/categories',
    label: 'Categories',
    badge: 'Rate Tiers',
    icon: Layers,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Base rate rules, transmission categories, and national coverage groupings.',
  },
  {
    href: '/admin/bandwidth/buy/providers',
    label: 'Carriers & Providers',
    badge: 'IIG / ITC',
    icon: Truck,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    desc: 'Upstream carrier trunks, NTTN transmission circuits, and NOC contacts.',
  },
  {
    href: '/admin/bandwidth/buy/bills',
    label: 'Purchase Bills',
    badge: 'Accounts Payable',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Monthly upstream carrier billing statements, 5% VAT, and payment vouchers.',
  },
  {
    href: '/admin/bandwidth/daily-bill',
    label: 'Daily Consumption Bill',
    badge: 'Live Usage',
    icon: Activity,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    desc: 'Gigabyte consumption logs recorded daily per POP transmission node.',
  },
] as const;

export function BandwidthBuyHubPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load bandwidth buy hub"
          description="Could not fetch purchase overview."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const summary = data?.summary;
  const bills = data?.purchaseBills ?? [];
  const providers = data?.providers ?? [];
  const openBills = bills.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Buy Hub"
        subtitle="Upstream IP transit procurement, NTTN transmission circuits, BDIX peering, and carrier purchase reconciliation"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth' },
          { label: 'Bandwidth Buy' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/bandwidth/daily-bill">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/80">
                <Activity className="h-3.5 w-3.5 text-primary" /> Daily Usage Bill
              </Button>
            </Link>
            <Link href="/admin/bandwidth/buy/bills">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Purchase Invoices
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{`${summary?.totalPurchasedMbps ?? 2500} Mbps`}</span>{' '}
          <span className="text-muted-foreground">total contracted capacity</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{`${summary?.utilizationPercent ?? 82}%`}</span>{' '}
          <span className="text-muted-foreground">peak network utilization</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{openBills}</span>{' '}
          <span className="text-muted-foreground">pending carrier invoices</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(summary?.monthlyCostBdt ?? 605000)}
          </span>{' '}
          <span className="text-muted-foreground">monthly upstream expense</span>
        </p>
      </div>

      {/* Interactive Navigation Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_MODULES.map((mod) => (
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

      {/* Upstream Carrier Live Trunks Overview Card */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Active Carrier Trunks & Capacity Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            Live contracted bandwidth breakdown across International Internet Gateways (IIG) and NTTN links.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground truncate">{p.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Active
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">Capacity:</span>
                  <span className="text-sm font-mono font-bold text-primary">{p.totalCapacityMbps} Mbps</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Monthly Rate:</span>
                  <span className="font-mono font-semibold text-foreground">৳{p.monthlyBillBdt.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
