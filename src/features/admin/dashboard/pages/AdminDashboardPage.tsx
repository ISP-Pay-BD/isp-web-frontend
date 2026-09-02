'use client';

import Link from 'next/link';
import {
  Users,
  Wallet,
  AlertCircle,
  Wifi,
  UserPlus,
  Receipt,
  MapPin,
  Zap,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return <PageSkeleton rows={6} />;
  }

  if (isError || !stats) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="Could not connect to mock server. Click retry to reload."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Live operations overview, subscriber metrics, and collections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/customers/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-1.5 h-4 w-4" /> Add Customer
            </Button>
          </Link>
          <Link href="/admin/customer-payments/new">
            <Button size="sm" variant="outline">
              <Receipt className="mr-1.5 h-4 w-4" /> Record Payment
            </Button>
          </Link>
          <Link href="/admin/subscription">
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Zap className="mr-1.5 h-4 w-4" /> Self Recharge
            </Button>
          </Link>
        </div>
      </div>

      {/* AI / System Insights Banner (mirroring sAdmin.php JSX design) */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">System Insights</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Live metrics
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Today collection is running strong with{' '}
                <CurrencyDisplay amount={stats.todayCollectionBdt} className="font-semibold text-foreground" />. {stats.expiredCustomers} accounts need renewal.
              </p>
            </div>
          </div>
          <Link href="/admin/customers/expired">
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              View Expired <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers}
          description={`Out of ${stats.totalCustomers} total subscribers`}
          trend={{ value: '+4.2% from last month', positive: true }}
          icon={Users}
        />
        <StatCard
          title="Today Collection"
          value={<CurrencyDisplay amount={stats.todayCollectionBdt} />}
          description="Received across online & cash"
          trend={{ value: 'Daily target on track', positive: true }}
          icon={Wallet}
        />
        <StatCard
          title="Monthly Collection"
          value={<CurrencyDisplay amount={stats.monthlyCollectionBdt} />}
          description="September 2026 total"
          trend={{ value: '+12.5% YoY', positive: true }}
          icon={TrendingUp}
        />
        <StatCard
          title="Expired / Due"
          value={stats.expiredCustomers}
          description={`${stats.suspendedCustomers} suspended accounts`}
          trend={{ value: 'Requires SMS reminder', positive: false }}
          icon={AlertCircle}
        />
      </div>

      {/* Online Users & Quick Stats Band */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Online PPPoE Sessions
              <Wifi className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.onlineUsers} online
            </div>
            <p className="text-xs text-muted-foreground mt-1">Real-time session status from MikroTik NAS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Service Areas
              <MapPin className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 Areas</div>
            <p className="text-xs text-muted-foreground mt-1">Covering Dhaka, Chittagong, Sylhet, Khulna</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Pending Tickets
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTickets} Tickets</div>
            <p className="text-xs text-muted-foreground mt-1">Customer support requests awaiting resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Package & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Package</CardTitle>
            <CardDescription>Top subscriber plans ranked by gross monthly collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.revenueByPackage.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                <div>
                  <div className="font-medium text-sm">{item.package}</div>
                  <div className="text-xs text-muted-foreground">Standard 30-day billing cycle</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-sm">
                    <CurrencyDisplay amount={item.amountBdt} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">Monthly</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>System transactions & operations audit log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 rounded-lg border p-2.5 text-xs">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{act.text}</p>
                  <span className="text-muted-foreground text-[11px]">{act.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
