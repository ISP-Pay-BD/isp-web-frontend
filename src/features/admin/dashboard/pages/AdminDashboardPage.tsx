'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Users,
  Wallet,
  Wifi,
  UserPlus,
  Receipt,
  MapPin,
  Layers,
  ArrowRight,
  Clock,
  Box,
  UserCheck,
  Server,
  PieChart as PieIcon,
  Search,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

const containerVariants = {
  ...staggerContainer,
  visible: staggerContainer.show,
  show: staggerContainer.show,
};

const itemVariants = {
  ...fadeUp,
  visible: fadeUp.show,
};

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();
  const [isGroupedMetrics, setIsGroupedMetrics] = useState(false);
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
    <motion.div
      variants={containerVariants}
      initial={false}
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Operations"
          subtitle="Collections, sessions, and billing alerts that need action today."
          breadcrumb={[
            { label: 'Admin', url: '/admin/dashboard' },
            { label: 'Dashboard' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={isGroupedMetrics ? 'default' : 'outline'}
                onClick={() => setIsGroupedMetrics(!isGroupedMetrics)}
                className="text-xs"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                {isGroupedMetrics ? 'Grouped' : 'Sections'}
              </Button>
              <Link href="/admin/customers/new">
                <Button size="sm" className="text-xs font-medium">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add customer
                </Button>
              </Link>
              <Link href="/admin/customer-payments/new">
                <Button size="sm" variant="outline" className="text-xs">
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Record payment
                </Button>
              </Link>
            </div>
          }
        />
      </motion.div>

      {/* Triage — action first */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Payment due</p>
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
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Expired</p>
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
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Open tickets</p>
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
      </motion.div>

      {/* Ops snapshot */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-muted/30 px-4 py-3 text-xs text-muted-foreground"
      >
        <span className="font-medium text-foreground">৳{stats.monthlyCollectionBdt.toLocaleString()}</span>
        {' '}collected ·{' '}
        <span className="font-medium text-foreground">{stats.customersPaymentReceivedCount ?? 840}</span> payments ·{' '}
        <span className="font-medium text-foreground">{stats.routerActive ?? 6}</span> routers online ·{' '}
        <span className="font-medium text-foreground">{stats.allResellers ?? 12}</span> POP resellers
      </motion.div>

      {/* Primary KPIs */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Customers"
          value={
            <div className="flex items-baseline gap-1">
              <NumberFlow value={stats.activeCustomers} />
              <span className="text-xs font-normal text-muted-foreground">/ {stats.totalCustomers}</span>
            </div>
          }
          description="Live service"
          trend={{ value: '+4.2% this month', positive: true }}
          icon={Users}
          href="/admin/customers"
          ctaText="View customers"
        />
        <StatCard
          title="Payment Received"
          value={
            <div className="flex items-baseline gap-1 font-mono">
              <span>৳</span>
              <NumberFlow value={stats.monthlyCollectionBdt} format={{ notation: 'compact' }} />
            </div>
          }
          description="Successful collections"
          trend={{ value: 'Target 94% on track', positive: true }}
          icon={Wallet}
          href="/admin/customer-payments"
          ctaText="View payments"
        />
        <StatCard
          title="Online Sessions"
          value={<NumberFlow value={stats.onlineUsers} />}
          description="Active PPPoE now"
          trend={{ value: `${stats.routerActive ?? 6} NAS online`, positive: true }}
          icon={Wifi}
          href="/admin/routers"
          ctaText="View sessions"
        />
        <Link href="/admin/subscription" className="block h-full group no-underline">
          <SpotlightCard className="flex h-full flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Customer quota
                </p>
                <UserCheck className="h-4 w-4 text-muted-foreground/70" />
              </div>
              <div className="mt-3 font-mono text-2xl font-semibold text-foreground">
                {stats.customerQuota?.used ?? 248} / {stats.customerQuota?.limit ?? 500}
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Used</span>
                <span className="font-medium text-foreground">{stats.customerQuota?.percent ?? 49.6}%</span>
              </div>
              <Progress value={stats.customerQuota?.percent ?? 49.6} className="h-1.5" />
              <div className="flex items-center gap-1 pt-1 text-[11px] font-medium text-primary opacity-80 group-hover:opacity-100">
                Manage capacity <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </SpotlightCard>
        </Link>
      </motion.div>

      {/* Metric sections */}
      <motion.div variants={itemVariants} className="space-y-4">
        {isGroupedMetrics ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 rounded-xl bg-muted/20 p-3">
            <Link href="/admin/customers/new" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">New Customers</span>
                <div className="text-xl font-semibold mt-1 text-emerald-600 dark:text-emerald-400">{stats.newCustomers ?? 28}</div>
              </SpotlightCard>
            </Link>
            <Link href="/admin/customers?status=suspended" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">Inactive Customers</span>
                <div className="text-xl font-semibold mt-1 text-rose-500">{stats.inactiveCustomers ?? 14}</div>
              </SpotlightCard>
            </Link>
            <Link href="/admin/packages" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">Active Packages</span>
                <div className="text-xl font-semibold mt-1 text-foreground">{stats.totalPackages ?? 12}</div>
              </SpotlightCard>
            </Link>
            <Link href="/admin/areas" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">Service Areas</span>
                <div className="text-xl font-semibold mt-1 text-foreground">{stats.totalAreas ?? 8}</div>
              </SpotlightCard>
            </Link>
            <Link href="/admin/hr/employees" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">Active Employees</span>
                <div className="text-xl font-semibold mt-1 text-foreground">{stats.employeeActive ?? 18}</div>
              </SpotlightCard>
            </Link>
            <Link href="/admin/routers" className="block no-underline">
              <SpotlightCard className="p-3 cursor-pointer">
                <span className="text-[11px] text-muted-foreground font-medium">Active Routers</span>
                <div className="text-xl font-semibold mt-1 text-foreground">{stats.routerActive ?? 6}</div>
              </SpotlightCard>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-4">
            <Card className="p-4 space-y-3 ring-0 shadow-none">
              <div className="relative z-[1] flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Customers
                </span>
                <Link href="/admin/customers" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="relative z-[1] grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/customers/new" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">New</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.newCustomers ?? 28}</div>
                </Link>
                <Link href="/admin/customers?status=suspended" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Inactive</span>
                  <div className="font-semibold text-rose-500">{stats.inactiveCustomers ?? 14}</div>
                </Link>
                <Link href="/admin/customers?status=expired" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Expired</span>
                  <div className="font-semibold text-amber-500">{stats.expiredCustomers}</div>
                </Link>
                <Link href="/admin/customer-payments" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Total Billed</span>
                  <div className="font-semibold font-mono text-[11px] text-foreground">৳1.45M</div>
                </Link>
              </div>
            </Card>

            <Card className="p-4 space-y-3 ring-0 shadow-none">
              <div className="relative z-[1] flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-primary" /> Packages & Areas
                </span>
                <Link href="/admin/packages" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="relative z-[1] grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/packages" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Active Packages</span>
                  <div className="font-semibold text-foreground">{stats.totalPackages ?? 12}</div>
                </Link>
                <Link href="/admin/areas" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Service Zones</span>
                  <div className="font-semibold text-foreground">{stats.totalAreas ?? 8}</div>
                </Link>
                <div className="col-span-2 p-2 rounded-lg bg-muted/30 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">Efficiency</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {stats.efficiencyRate ?? 92.8}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3 ring-0 shadow-none">
              <div className="relative z-[1] flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> Employees
                </span>
                <Link href="/admin/hr/employees" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="relative z-[1] grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/hr/employees" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Active Staff</span>
                  <div className="font-semibold text-foreground">{stats.employeeActive ?? 18}</div>
                </Link>
                <Link href="/admin/hr/employees" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Inactive</span>
                  <div className="font-semibold text-muted-foreground">{stats.employeeInactive ?? 2}</div>
                </Link>
                <Link href="/admin/hr/salaries" className="col-span-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex justify-between items-center cursor-pointer no-underline">
                  <span className="text-[11px] text-muted-foreground">Salaries Paid</span>
                  <span className="font-semibold font-mono text-foreground">৳{(stats.employeePaymentReceived ?? 385000).toLocaleString()}</span>
                </Link>
              </div>
            </Card>

            <Card className="p-4 space-y-3 ring-0 shadow-none">
              <div className="relative z-[1] flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> Network & POPs
                </span>
                <Link href="/admin/routers" className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="relative z-[1] grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/routers" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">Active Routers</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.routerActive ?? 6}</div>
                </Link>
                <Link href="/admin/pop/resellers" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block group no-underline">
                  <span className="text-[10px] text-muted-foreground">POP Resellers</span>
                  <div className="font-semibold text-foreground">{stats.allResellers ?? 12}</div>
                </Link>
                <div className="col-span-2 p-2 rounded-lg bg-muted/30 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">Router Status</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">All NAS Online</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Router / POP Live Sessions (Real-time cards mirroring sAdmin.php) */}
      <motion.div variants={itemVariants}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Wifi className="h-4 w-4 text-emerald-500" /> POP Live Sessions
              </h2>
              <p className="text-xs text-muted-foreground">Live PPPoE sessions across connected MikroTik access concentrators</p>
            </div>
            <Link href="/admin/routers">
              <Button size="sm" variant="ghost" className="text-xs text-primary">
                Manage Routers <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(stats.routers ?? []).map((router) => (
              <Link key={router.id} href="/admin/routers" className="block group no-underline">
                <SpotlightCard className="p-4 h-full flex flex-col justify-between cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm text-foreground truncate max-w-[170px]">{router.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{router.host}</div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/40 text-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                      <div className="font-semibold text-sm">{router.totalUsers}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Online</span>
                      <div className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">{router.activeUsers}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Offline</span>
                      <div className="font-semibold text-sm text-muted-foreground">{router.inactiveUsers}</div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 flex items-center gap-1 text-[11px] font-medium text-primary opacity-80 group-hover:opacity-100">
                    Manage sessions <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Analytics Charts Grid: Customer Payment Report (Combo Bar+Line) + Weekly Collections (Bar) */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-12">
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
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.5" />
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Collected</div>
                <div className="text-sm font-bold font-mono text-foreground">
                  ৳{((stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.collection, 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Target</div>
                <div className="text-sm font-bold font-mono text-muted-foreground">
                  ৳{((stats.monthlyTrend ?? []).reduce((sum, m) => sum + m.target, 0) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Achievement</div>
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
                      <stop offset="0%" stopColor="#f75803" stopOpacity={1} />
                      <stop offset="100%" stopColor="#c44103" stopOpacity={0.7} />
                    </linearGradient>
                    <filter id="barShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f75803" floodOpacity="0.25" />
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
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
                  <div className="text-sm font-bold font-mono">
                    ৳{((stats.weeklyCollections ?? []).reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg/Day</div>
                  <div className="text-sm font-bold font-mono">
                    ৳{((stats.weeklyCollections ?? []).reduce((sum, d) => sum + d.amount, 0) / 7 / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Peak</div>
                  <div className="text-sm font-bold font-mono text-emerald-500">
                    ৳{Math.max(...(stats.weeklyCollections ?? []).map((d) => d.amount)) / 1000}k
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method Mix, Ticket Support Health, Bandwidth Usage */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
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
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
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
      </motion.div>

      {/* Geo Revenue by Territory & Real-time Audit Log */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-7">
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
      </motion.div>
    </motion.div>
  );
}
