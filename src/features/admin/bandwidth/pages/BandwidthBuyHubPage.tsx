'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowRight, Layers, Truck, FileText, Package } from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';

const LINKS = [
  { href: '/admin/bandwidth/buy/items', label: 'Catalog Items', icon: Package, desc: 'Upstream transit and peering products' },
  { href: '/admin/bandwidth/buy/categories', label: 'Categories', icon: Layers, desc: 'DIA, BDIX, CDN groupings' },
  { href: '/admin/bandwidth/buy/providers', label: 'Providers', icon: Truck, desc: 'Upstream vendors and contacts' },
  { href: '/admin/bandwidth/buy/bills', label: 'Purchase Bills', icon: FileText, desc: 'Procurement invoices and VAT' },
] as const;

export function BandwidthBuyHubPage() {
  const { data, isLoading } = useBandwidthData();

  if (isLoading) return <PageSkeleton rows={4} />;

  const summary = data?.summary;
  const bills = data?.purchaseBills ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Buy"
        subtitle="Procure upstream IP transit, BDIX peering, and cache bandwidth"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/bandwidth/daily-bill" />}>
            Daily bill
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Purchased capacity" value={`${summary?.totalPurchasedMbps ?? 0} Mbps`} icon={ArrowDownToLine} />
        <StatCard title="Utilization" value={`${summary?.utilizationPercent ?? 0}%`} />
        <StatCard title="Open bills" value={String(bills.filter((b) => b.status === 'pending').length)} />
        <StatCard title="Monthly spend" value={formatBdtWithSymbol(summary?.monthlyCostBdt ?? 0)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LINKS.map((link) => (
          <Card key={link.href}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <link.icon className="text-primary h-5 w-5" />
                <CardTitle className="text-base">{link.label}</CardTitle>
              </div>
              <CardDescription>{link.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" render={<Link href={link.href} />}>
                Open
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
