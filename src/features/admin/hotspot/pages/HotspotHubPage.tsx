'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotData } from '../hooks/useHotspotData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  Users,
  Package,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Activity,
  Ticket,
  ShieldCheck,
  Router,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format/currency';

const QUICK_MODULES = [
  {
    href: '/admin/hotspot/dashboard',
    label: 'Live Dashboard',
    icon: LayoutDashboard,
    desc: 'Real-time active MAC sessions, bandwidth usage, and gateway router health.',
    badge: 'Real-time',
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20',
  },
  {
    href: '/admin/hotspot/packages',
    label: 'Hotspot Profiles & Packages',
    icon: Package,
    desc: 'Configure bandwidth rate limits, duration quotas, burst rates, and pricing.',
    badge: 'Rate Limits',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    href: '/admin/hotspot/users',
    label: 'Active Users & Sessions',
    icon: Users,
    desc: 'Monitor connected guest clients, MAC bindings, IP allocations, and traffic.',
    badge: 'Clients',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    href: '/admin/hotspot/vouchers',
    label: 'Voucher Code Batches',
    icon: Ticket,
    desc: 'Generate printable multi-digit voucher PINs with custom validity hours.',
    badge: 'PIN Cards',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    href: '/admin/hotspot/walled-garden',
    label: 'Walled Garden Rules',
    icon: ShieldCheck,
    desc: 'Whitelist domains, payment gateways, and portals accessible before authentication.',
    badge: 'Bypass DNS',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    href: '/admin/hotspot/reports',
    label: 'Voucher Sales & Analytics',
    icon: BarChart3,
    desc: 'Revenue breakdown by location, selling counter cashier, and payment gateway.',
    badge: 'Accounting',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
  },
] as const;

export function HotspotHubPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={5} />;
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
  const routers = data?.routers ?? [];
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const onlineRouters = routers.filter((r) => r.status === 'online').length;
  const totalRevenue = reports.reduce((s, r) => s + (r.priceBdt || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot & Captive Portal Hub"
        subtitle="Manage MikroTik hotspot gateways, prepaid voucher card PINs, guest WiFi bandwidth, and sales."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Hub' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/hotspot/vouchers">
              <Button variant="outline" size="sm" className="h-9">
                <Ticket className="mr-2 h-4 w-4" />
                Generate Vouchers
              </Button>
            </Link>
            <Link href="/admin/hotspot/packages">
              <Button size="sm" className="h-9">
                <Package className="mr-2 h-4 w-4" />
                New Package
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Profiles</span>
            <Wifi className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {profiles.length}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Bandwidth tiers defined</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Live Active Sessions</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {activeUsers}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Guest devices online</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Gateway Routers</span>
            <Router className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {onlineRouters} / {routers.length}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">MikroTik APs synchronized</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Voucher Revenue</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cumulative voucher billing</p>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Hotspot Control Center
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="h-full border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:bg-card/90 hover:shadow-md group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.bgColor} ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs bg-background/60 font-mono">
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-base font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                      {item.label}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
