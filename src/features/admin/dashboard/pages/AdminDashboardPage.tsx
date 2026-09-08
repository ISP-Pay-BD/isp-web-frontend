'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Wifi,
  UserPlus,
  Receipt,
  MapPin,
  ArrowRight,
  Clock,
  PieChart as PieIcon,
  Search,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';


export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();
  const [geoSearch, setGeoSearch] = useState('');

  const filteredGeoRevenue = useMemo(() => {
    if (!stats?.geoRevenue) return [];
    if (!geoSearch.trim()) return stats.geoRevenue;
    const q = geoSearch.toLowerCase();
    return stats.geoRevenue.filter((g) => g.area.toLowerCase().includes(q));
  }, [stats, geoSearch]);

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <PageHeader
          title="Operations"
          subtitle="Collections, sessions, and billing alerts that need action today."
          breadcrumb={[
            { label: 'Admin', url: '/admin/dashboard' },
            { label: 'Dashboard' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/customers/new">
                <Button size="sm" className="ui-press text-xs font-medium">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add customer
                </Button>
              </Link>
              <Link href="/admin/customer-payments/new">
                <Button size="sm" variant="outline" className="ui-press text-xs">
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Record payment
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* Triage — action first */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide">Payment due</p>
              <p className="mt-1 font-mono text-xl font-semibold text-amber-600 dark:text-amber-400">
                ৳<NumberFlow value={stats.customersExpaymentTotal ?? 54000} format={{ notation: 'compact' }} />
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({stats.customersExpaymentCount ?? 45})
                </span>
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </SpotlightCard>
        </Link>
        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide">Expired</p>
              <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-400">
                <NumberFlow value={stats.expiredCustomers} />
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">subscribers</span>
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </SpotlightCard>
        </Link>
        <Link href="/admin/support" className="group block no-underline">
          <SpotlightCard className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide">Open tickets</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                <NumberFlow value={stats.pendingTickets} />
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {stats.ticketStats?.solvedRate ?? 94}% solved
                </span>
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </SpotlightCard>
        </Link>
      </div>

      {/* Primary metrics — summary strip (not 4 KPI tiles) */}
      <div className="bg-card border-border/60 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border px-4 py-3 text-sm shadow-[var(--shadow-xs)]">
        <Link href="/admin/customers" className="hover:text-primary group transition-colors duration-200 ease-out">
          <span className="text-muted-foreground text-[11px] tracking-wide">Active</span>
          <p className="font-semibold tabular-nums">
            <NumberFlow value={stats.activeCustomers} />
            <span className="text-muted-foreground ml-1 text-xs font-normal">/ {stats.totalCustomers}</span>
          </p>
        </Link>
        <span className="text-border hidden sm:inline">·</span>
        <Link href="/admin/customer-payments" className="hover:text-primary group transition-colors duration-200 ease-out">
          <span className="text-muted-foreground text-[11px] tracking-wide">Collected</span>
          <p className="font-mono font-semibold tabular-nums">
            ৳<NumberFlow value={stats.monthlyCollectionBdt} format={{ notation: 'compact' }} />
          </p>
        </Link>
        <span className="text-border hidden sm:inline">·</span>
        <Link href="/admin/routers" className="hover:text-primary group transition-colors duration-200 ease-out">
          <span className="text-muted-foreground text-[11px] tracking-wide">Online</span>
          <p className="font-semibold tabular-nums">
            <NumberFlow value={stats.onlineUsers} />
            <span className="text-muted-foreground ml-1 text-xs font-normal">sessions</span>
          </p>
        </Link>
        <span className="text-border hidden sm:inline">·</span>
        <Link href="/admin/subscription" className="hover:text-primary group min-w-[140px] transition-colors duration-200 ease-out">
          <span className="text-muted-foreground text-[11px] tracking-wide">Quota</span>
          <p className="font-mono text-xs font-semibold tabular-nums">
            {stats.customerQuota?.used ?? 248}/{stats.customerQuota?.limit ?? 500}
          </p>
          <Progress value={stats.customerQuota?.percent ?? 49.6} className="mt-1 h-1" />
        </Link>
      </div>

      {/* Quick links — dense, not 4 card modules */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { href: '/admin/packages', label: 'Packages', value: stats.totalPackages ?? 12 },
          { href: '/admin/areas', label: 'Areas', value: stats.totalAreas ?? 8 },
          { href: '/admin/hr/employees', label: 'Staff', value: stats.employeeActive ?? 18 },
          { href: '/admin/pop/resellers', label: 'POPs', value: stats.allResellers ?? 12 },
          { href: '/admin/customers/new', label: 'New today', value: stats.newCustomers ?? 28 },
        ].map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30 inline-flex items-center gap-2 rounded-lg border px-3 py-2 shadow-[var(--shadow-xs)] transition-colors duration-200 ease-out"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
          </Link>
        ))}
      </div>

      {/* Router / POP Live Sessions (Real-time cards mirroring sAdmin.php) */}
      <div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                <Wifi className="text-muted-foreground h-4 w-4" /> POP live sessions
              </h2>
              <p className="text-muted-foreground text-xs">Live PPPoE sessions across connected MikroTik access concentrators</p>
            </div>
            <Link href="/admin/routers">
              <Button size="sm" variant="ghost" className="text-primary text-xs">
                Manage routers <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="border-border/60 overflow-hidden rounded-lg border shadow-[var(--shadow-xs)]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-left text-[11px] tracking-wide">
                <tr>
                  <th className="px-3 py-2 font-medium">Router</th>
                  <th className="px-3 py-2 font-medium">Host</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Total</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Online</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Offline</th>
                </tr>
              </thead>
              <tbody>
                {(stats.routers ?? []).map((router) => (
                  <tr key={router.id} className="border-t border-border/40 transition-colors duration-200 hover:bg-muted/20">
                    <td className="px-3 py-2.5">
                      <Link href="/admin/routers" className="font-medium hover:text-primary">
                        {router.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{router.host}</td>
                    <td className="px-3 py-2.5 tabular-nums">{router.totalUsers}</td>
                    <td className="px-3 py-2.5 tabular-nums text-foreground">{router.activeUsers}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{router.inactiveUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid: Customer Payment Report (Combo Bar+Line) + Weekly Collections (Bar) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Customer Payment Report — Combo Chart (Bar + Line) */}
        <Card className="lg:col-span-8 bg-card shadow-none border-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Comparing Actual vs Target by Month</CardTitle>
              <CardDescription className="text-xs">Jan – Sep 2026 Collection Trends vs Monthly Target</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                <span className="font-medium">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-cyan-500 rounded-full" />
                <span className="font-medium text-muted-foreground">Target</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.monthlyTrend ?? []} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <filter id="comboDotGlow">
                      <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="var(--primary)" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dx={-5}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `৳${val.toLocaleString()}`}
                      />
                    }
                    cursor={{ fill: 'rgba(56, 189, 248, 0.06)' }}
                  />
                  {/* Bars — Actual collected */}
                  <Bar
                    dataKey="collection"
                    name="collection"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    label={{
                      position: 'top',
                      fontSize: 10,
                      fontWeight: 600,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  {/* Line — Target */}
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="target"
                    stroke="#0e7490"
                    strokeWidth={2.5}
                    dot={{
                      r: 5,
                      fill: '#0e7490',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#0e7490',
                      stroke: '#fff',
                      strokeWidth: 2,
                      filter: 'url(#comboDotGlow)',
                    }}
                    animationDuration={2000}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[10px] tracking-wide text-muted-foreground mb-1">Total Collected</div>
                <div className="text-sm font-bold font-mono text-foreground">
                  ৳{((stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.collection, 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] tracking-wide text-muted-foreground mb-1">Target</div>
                <div className="text-sm font-bold font-mono text-muted-foreground">
                  ৳{((stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.target, 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] tracking-wide text-muted-foreground mb-1">Achievement</div>
                <div className="text-sm font-bold font-mono text-emerald-500">
                  {((stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.collection, 0) /
                    (stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.target, 0) *
                    100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Revenue Daily Bars */}
        <Card className="lg:col-span-4 bg-card shadow-none border-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Weekly Revenue</CardTitle>
              <CardDescription className="text-xs">Daily collections for current week</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
              +{stats.weeklyGrowth ?? 8.4}%
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyCollections ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e85a1a" stopOpacity={1} />
                      <stop offset="100%" stopColor="#c44103" stopOpacity={0.7} />
                    </linearGradient>
                    <filter id="barShadow">
                      <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#e85a1a" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dy={5}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `৳${v / 1000}k`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dx={-5}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `৳${val.toLocaleString()}`}
                      />
                    }
                    cursor={{ fill: 'rgba(247, 88, 3, 0.08)' }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="url(#gradientBar)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Weekly Summary */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-[10px] tracking-wide text-muted-foreground">Total</div>
                  <div className="text-sm font-bold font-mono">
                    ৳{((stats.weeklyCollections ?? []).reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center flex-1">
                  <div className="text-[10px] tracking-wide text-muted-foreground">Avg/Day</div>
                  <div className="text-sm font-bold font-mono">
                    ৳{((stats.weeklyCollections ?? []).reduce((sum, d) => sum + d.amount, 0) / 7 / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center flex-1">
                  <div className="text-[10px] tracking-wide text-muted-foreground">Peak</div>
                  <div className="text-sm font-bold font-mono text-emerald-500">
                    ৳{Math.max(...(stats.weeklyCollections ?? []).map((d) => d.amount)) / 1000}k
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Mix, Ticket Support Health, Bandwidth Usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Method Mix */}
        <Card className="bg-card shadow-none border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-primary" /> Payment Method Mix
              </CardTitle>
              <CardDescription className="text-xs">Gateway collection shares</CardDescription>
            </div>
            <Link href="/admin/customer-payments" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
              Ledger <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats.paymentMethods ?? []).map((method) => (
              <Link key={method.name} href="/admin/customer-payments" className="block group no-underline">
                <div className="space-y-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: method.color }} />
                      {method.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">৳{method.amountBdt.toLocaleString()}</span>
                      <span className="font-bold">{method.percent}%</span>
                    </div>
                  </div>
                  <Progress value={method.percent} className="h-2" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Ticket & Support Health */}
        <Card className="bg-card shadow-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Collection & Support</span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {stats.ticketStats?.solvedRate ?? 94}% Solved
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Helpdesk incident tracking status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Open Tickets</span>
                <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">{stats.ticketStats?.open ?? 7}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Ongoing Work</span>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">{stats.ticketStats?.ongoing ?? 12}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Solved</span>
                <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{stats.ticketStats?.solved ?? 145}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline">
                <span className="text-[11px] text-muted-foreground font-medium">Closed</span>
                <div className="text-2xl font-semibold text-muted-foreground mt-1">{stats.ticketStats?.closed ?? 210}</div>
              </Link>
            </div>
            <div className="pt-2">
              <Link href="/admin/support">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Open Support Desk <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Daily Data Consumption (Bandwidth) */}
        <Card className="bg-card shadow-none border-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-emerald-500" /> Daily Bandwidth
              </CardTitle>
              <CardDescription className="text-xs">Live throughput profile</CardDescription>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {(stats.totalDataGb ?? 48250.5).toLocaleString()} GB
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.bandwidthHourly ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientBandwidth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientBandwidthStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <filter id="bandwidthGlow">
                      <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}G`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `${val} Gbps`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="gbps"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientBandwidth)"
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
              <span className="text-muted-foreground">Peak: <span className="font-medium text-emerald-600 dark:text-emerald-400">9.6 Gbps</span> at 20:00</span>
              <span className="text-muted-foreground font-medium">Healthy capacity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geo Revenue by Territory & Real-time Audit Log */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Geo Revenue */}
        <Card className="lg:col-span-4 bg-card shadow-none border-0">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Geo Revenue
              </CardTitle>
              <CardDescription className="text-xs">
                Billing collections mapped across active zones
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search area..."
                value={geoSearch}
                onChange={(e) => setGeoSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-background/50 rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredGeoRevenue.map((geo) => (
              <Link
                key={geo.area}
                href="/admin/areas"
                className="block group no-underline"
              >
                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                      <span>{geo.area}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {geo.customers} subscribers ({geo.active} active)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium text-xs text-foreground">
                      ৳{geo.revenueBdt.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">98% collected</span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Live Audit Log */}
        <Card className="lg:col-span-3 bg-card shadow-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Live Audit Log</span>
              <span className="text-[10px] font-mono font-normal text-muted-foreground">Real-time</span>
            </CardTitle>
            <CardDescription className="text-xs">
              System transactions, radius events & operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-lg bg-muted/20 p-2.5 text-xs"
              >
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{act.text}</p>
                  <span className="text-muted-foreground text-[10px]">{act.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
