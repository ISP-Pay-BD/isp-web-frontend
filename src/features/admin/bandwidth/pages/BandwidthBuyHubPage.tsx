'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  Truck,
  FileText,
  Package,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';

const LINKS = [
  { href: '/admin/bandwidth/buy/items', label: 'Catalog Items', icon: Package, desc: 'Upstream transit and peering products' },
  { href: '/admin/bandwidth/buy/categories', label: 'Categories', icon: Layers, desc: 'DIA, BDIX, CDN groupings' },
  { href: '/admin/bandwidth/buy/providers', label: 'Providers', icon: Truck, desc: 'Upstream vendors and contacts' },
  { href: '/admin/bandwidth/buy/bills', label: 'Purchase Bills', icon: FileText, desc: 'Procurement invoices and VAT' },
] as const;

export function BandwidthBuyHubPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="table" rows={4} />;
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
  const openBills = bills.filter((b) => b.status === 'pending').length;

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      <div>
        <PageHeader
          title="Bandwidth Buy"
          subtitle="Procure upstream IP transit, BDIX peering, and cache bandwidth"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Bandwidth Buy' },
          ]}
          actions={
            <Button variant="outline" size="sm" render={<Link href="/admin/bandwidth/daily-bill" />} className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Daily bill
            </Button>
          }
        />
      </div>

      {/* Stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{`${summary?.totalPurchasedMbps ?? 0} Mbps`}</span>{' '}
          <span className="text-muted-foreground">purchased capacity</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`${summary?.utilizationPercent ?? 0}%`}</span>{' '}
          <span className="text-muted-foreground">utilization</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{String(openBills)}</span>{' '}
          <span className="text-muted-foreground">open bills</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatBdtWithSymbol(summary?.monthlyCostBdt ?? 0)}</span>{' '}
          <span className="text-muted-foreground">monthly spend</span>
        </p>
      </div>

      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="p-2 rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
                <link.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground">{link.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
