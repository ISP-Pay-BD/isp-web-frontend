'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  Users,
  Package,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';

const QUICK_LINKS = [
  {
    href: '/admin/hotspot/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    desc: 'Live sessions and revenue',
  },
  {
    href: '/admin/hotspot/packages',
    label: 'Packages',
    icon: Package,
    desc: 'Profiles and rate limits',
  },
  {
    href: '/admin/hotspot/users',
    label: 'Users',
    icon: Users,
    desc: 'Vouchers and MAC sessions',
  },
  {
    href: '/admin/hotspot/reports',
    label: 'Reports',
    icon: BarChart3,
    desc: 'Sales by router and cashier',
  },
] as const;

export function HotspotHubPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load hotspot hub"
          description="Could not fetch hotspot overview data."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const profiles = data?.profiles ?? [];
  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const todaySales = reports
    .filter((r) => r.date === new Date().toISOString().split('T')[0])
    .reduce((s, r) => s + r.priceBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Management"
        subtitle="MikroTik hotspot vouchers, cafe/hotel packages, and voucher sales"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot' },
        ]}
        actions={
          <Link href="/admin/hotspot/packages">
            <Button size="sm" className="font-semibold">
              <Package className="mr-1.5 h-3.5 w-3.5" /> Create Package
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{profiles.length}</span>{' '}
          <span className="text-muted-foreground">profiles</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{activeUsers}</span>{' '}
          <span className="text-muted-foreground">live sessions</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{users.length}</span>{' '}
          <span className="text-muted-foreground">vouchers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatBdtWithSymbol(todaySales)}</span>{' '}
          <span className="text-muted-foreground">today</span>
        </p>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {QUICK_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-4 py-4 no-underline transition-colors hover:bg-muted/40"
            >
              <link.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4 text-primary" /> Live sessions
            </CardTitle>
            <CardDescription className="text-xs">
              Connected users across routers
            </CardDescription>
          </div>
          <Link href="/admin/hotspot/dashboard">
            <Button size="sm" variant="ghost" className="text-xs text-primary">
              Dashboard <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active hotspot sessions.</p>
          ) : (
            <ul className="divide-y divide-border">
              {users.slice(0, 4).map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.username}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{user.macAddress}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      <Wifi className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      Online
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">{user.uptime}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
