'use client';

import Link from 'next/link';
import { ArrowRight, Layers, Truck, FileText, Package, Activity } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useBandwidthBills } from '../hooks/useBandwidthBills';
import { useBandwidthItems, useBandwidthProviders } from '../hooks/useBandwidthCatalog';
import { isoDay, monthStartIso } from '../utils';

const HUB_MODULES = [
  {
    href: '/admin/bandwidth/buy/items',
    label: 'Catalogue Items',
    icon: Package,
    color: 'text-primary bg-primary/10 border-primary/20',
    desc: 'Bandwidth items with unit price and VAT, used on bills and invoices.',
  },
  {
    href: '/admin/bandwidth/buy/categories',
    label: 'Categories',
    icon: Layers,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Category and sub-category groups of the item catalogue.',
  },
  {
    href: '/admin/bandwidth/buy/providers',
    label: 'Providers',
    icon: Truck,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    desc: 'Upstream carriers and their contact details.',
  },
  {
    href: '/admin/bandwidth/buy/bills',
    label: 'Purchase Bills',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Provider bills with line VAT, payments and outstanding dues.',
  },
  {
    href: '/admin/bandwidth/daily-bill',
    label: 'Daily Bill',
    icon: Activity,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    desc: 'Sales invoices per POP client for a day or date range, with collections.',
  },
] as const;

export function BandwidthBuyHubPage() {
  // All-time totals + the five newest bills (one request).
  const recent = useBandwidthBills({ page: 1, pageSize: 5 });
  // This month's purchases.
  const month = useBandwidthBills({ page: 1, pageSize: 1, from: monthStartIso(), to: isoDay() });
  const providers = useBandwidthProviders({ page: 1, pageSize: 1 });
  const items = useBandwidthItems();

  if (recent.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (recent.isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load bandwidth buy hub" description="Could not fetch the purchase overview." actionLabel="Retry" onAction={() => recent.refetch()} />
      </div>
    );
  }

  const totals = recent.data?.totals;
  const bills = recent.data?.items ?? [];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Buy Hub"
        subtitle="Upstream bandwidth procurement: catalogue, providers and purchase bills"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth' },
          { label: 'Bandwidth Buy' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/bandwidth/daily-bill">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/80">
                <Activity className="h-3.5 w-3.5 text-primary" /> Daily Bill
              </Button>
            </Link>
            <Link href="/admin/bandwidth/buy/bills">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Purchase Bills
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{providers.data?.meta.total ?? '—'}</span>{' '}
          <span className="text-muted-foreground">providers · {items.data?.length ?? '—'} catalogue items</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{month.data ? formatBdtWithSymbol(month.data.totals.total) : '—'}</span>{' '}
          <span className="text-muted-foreground">purchased this month</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{totals?.dueCount ?? 0}</span>{' '}
          <span className="text-muted-foreground">bills marked due</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(totals?.due ?? 0)}</span>{' '}
          <span className="text-muted-foreground">outstanding to providers</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full group">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className={cn('p-2.5 rounded-xl border shrink-0 w-fit', mod.color)}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{mod.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{mod.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Recent purchase bills
          </CardTitle>
          <CardDescription className="text-xs">
            {totals ? `${totals.count} bills · ${formatBdtWithSymbol(totals.total)} billed · ${formatBdtWithSymbol(totals.paid)} paid` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {bills.length === 0 ? (
            <p className="text-xs text-muted-foreground">No purchase bills recorded yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {bills.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">{b.providerName || '—'}</span>
                    <StatusBadge status={b.paymentStatus === 'Paid' ? 'paid' : 'pending'} label={b.paymentStatus} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {b.invoiceNumber} · {b.billingDate}
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Total</span>
                    <span className="font-mono font-semibold text-foreground">{formatBdtWithSymbol(b.total)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Due</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(b.due)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
