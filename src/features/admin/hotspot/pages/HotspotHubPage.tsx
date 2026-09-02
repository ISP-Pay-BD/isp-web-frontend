'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Users, Package, BarChart3, LayoutDashboard, ArrowRight } from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/admin/hotspot/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Live sessions and revenue KPIs' },
  { href: '/admin/hotspot/packages', label: 'Packages', icon: Package, desc: 'Hotspot profiles and rate limits' },
  { href: '/admin/hotspot/users', label: 'Users', icon: Users, desc: 'Active vouchers and MAC sessions' },
  { href: '/admin/hotspot/reports', label: 'Reports', icon: BarChart3, desc: 'Daily sales by router and cashier' },
] as const;

export function HotspotHubPage() {
  const { data, isLoading } = useHotspotData();

  if (isLoading) return <PageSkeleton rows={5} />;

  const profiles = data?.profiles ?? [];
  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const todaySales = reports.filter((r) => r.date === '2026-09-02').reduce((s, r) => s + r.priceBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Management"
        subtitle="MikroTik hotspot vouchers, cafe/hotel packages, and voucher sales"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active profiles" value={String(profiles.length)} icon={Package} />
        <StatCard title="Live sessions" value={String(activeUsers)} icon={Wifi} />
        <StatCard title="Total vouchers" value={String(users.length)} icon={Users} />
        <StatCard title="Today sales" value={formatBdtWithSymbol(todaySales)} icon={BarChart3} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Card key={link.href} className="transition-colors hover:border-primary/40">
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
