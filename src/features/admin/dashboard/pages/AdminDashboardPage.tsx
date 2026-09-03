'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
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
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Box,
  UserCheck,
  UserX,
  Hourglass,
  Server,
  PlugZap,
  Building2,
  PieChart as PieIcon,
  LifeBuoy,
  Search,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
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
  }, [stats?.geoRevenue, geoSearch]);

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

  const maxRevenue = Math.max(...stats.revenueByPackage.map((p) => p.amountBdt), 1);
  const totalPackageRevenue = stats.revenueByPackage.reduce((acc, p) => acc + p.amountBdt, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Operations Command Center"
          subtitle="Real-time ISP subscriber metrics, collections, network sessions, and billing alerts."
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
                className="font-medium text-xs shadow-2xs"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                {isGroupedMetrics ? 'Grouped View' : 'Section View'}
              </Button>
              <Link href="/admin/customers/new">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs text-xs">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Customer
                </Button>
              </Link>
              <Link href="/admin/customer-payments/new">
                <Button size="sm" variant="outline" className="border-border/80 hover:bg-accent font-medium text-xs">
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Record Payment
                </Button>
              </Link>
              <Link href="/admin/subscription">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium text-xs"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Self Recharge
                </Button>
              </Link>
            </div>
          }
        />
      </motion.div>

      {/* Primary KPI Row (5 Cards mirroring sAdmin.php) */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Active Customers"
          value={
            <div className="flex items-baseline gap-1">
              <NumberFlow value={stats.activeCustomers} />
              <span className="text-xs font-normal text-muted-foreground">/ {stats.totalCustomers}</span>
            </div>
          }
          description="Subscribers with live service"
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
              <span className="text-xs font-normal text-muted-foreground">({stats.customersPaymentReceivedCount ?? 840})</span>
            </div>
          }
          description="Total successful collections"
          trend={{ value: 'Target 94% on track', positive: true }}
          icon={Wallet}
          href="/admin/customer-payments"
          ctaText="View payments"
        />
        <StatCard
          title="Payment Due"
          value={
            <div className="flex items-baseline gap-1 font-mono text-amber-600 dark:text-amber-400">
              <span>৳</span>
              <NumberFlow value={stats.customersExpaymentTotal ?? 54000} format={{ notation: 'compact' }} />
              <span className="text-xs font-normal text-muted-foreground">({stats.customersExpaymentCount ?? 45})</span>
            </div>
          }
          description="Pending subscriber invoices"
          trend={{ value: 'Action required', positive: false }}
          icon={Hourglass}
          href="/admin/customers?status=expired"
          ctaText="View due accounts"
        />
        <StatCard
          title="Open Tickets"
          value={
            <div className="flex items-baseline gap-1.5 text-rose-600 dark:text-rose-400">
              <NumberFlow value={stats.pendingTickets} />
              <span className="text-xs font-normal text-muted-foreground">tickets</span>
            </div>
          }
          description="Unresolved helpdesk issues"
          trend={{ value: `${stats.ticketStats?.solvedRate ?? 94}% solve rate`, positive: true }}
          icon={LifeBuoy}
          href="/admin/support"
          ctaText="View tickets"
        />
        <Link href="/admin/subscription" className="block h-full group no-underline">
          <Card className="p-4 rounded-xl border-border/70 bg-card/90 shadow-2xs flex flex-col justify-between h-full group-hover:border-primary/50 group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 cursor-pointer">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Customer Quota
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-200 shadow-2xs">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground mt-2 font-mono">
                {stats.customerQuota?.used ?? 248} / {stats.customerQuota?.limit ?? 500}
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Used capacity</span>
                <span className="font-semibold text-foreground">{stats.customerQuota?.percent ?? 49.6}%</span>
              </div>
              <Progress value={stats.customerQuota?.percent ?? 49.6} className="h-2" />
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>Manage license & capacity</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* AI Insights Banner (3 rows matching sAdmin.php) */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-xs">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <CardContent className="p-4 relative z-10 space-y-3">
            <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary text-primary-foreground p-1.5 shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm tracking-tight">AI Insights & System Diagnostics</span>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" /> Live Telemetry
              </Badge>
            </div>
            <div className="grid gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3 w-3" />
                </div>
                <span>
                  Payment received: <strong>৳{stats.monthlyCollectionBdt.toLocaleString()}</strong> across{' '}
                  <span className="font-semibold">{stats.customersPaymentReceivedCount ?? 840}</span> verified transactions this cycle.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-3 w-3" />
                </div>
                <span>
                  <strong className="text-rose-500">{stats.expiredCustomers} subscribers</strong> expired — auto-reminder SMS dispatched to prevent churn.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Wifi className="h-3 w-3" />
                </div>
                <span>
                  <strong>{stats.routerActive ?? 6} MikroTik routers</strong> online ·{' '}
                  <strong>{stats.allResellers ?? 12} POP resellers</strong> operational on the platform.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4 Metric Category Sections (Customer, Package & Service, Employee, Network & Router) */}
      <motion.div variants={itemVariants} className="space-y-4">
        {isGroupedMetrics ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 p-4 rounded-2xl border border-border/70 bg-card/60">
            <Link href="/admin/customers/new" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">New Customers</span>
              <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.newCustomers ?? 28}</div>
            </Link>
            <Link href="/admin/customers?status=suspended" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Inactive Customers</span>
              <div className="text-xl font-bold mt-1 text-rose-500">{stats.inactiveCustomers ?? 14}</div>
            </Link>
            <Link href="/admin/packages" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Active Packages</span>
              <div className="text-xl font-bold mt-1 text-foreground">{stats.totalPackages ?? 12}</div>
            </Link>
            <Link href="/admin/areas" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Service Areas</span>
              <div className="text-xl font-bold mt-1 text-foreground">{stats.totalAreas ?? 8}</div>
            </Link>
            <Link href="/admin/hr/employees" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Active Employees</span>
              <div className="text-xl font-bold mt-1 text-foreground">{stats.employeeActive ?? 18}</div>
            </Link>
            <Link href="/admin/routers" className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer group block">
              <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Active Routers</span>
              <div className="text-xl font-bold mt-1 text-foreground">{stats.routerActive ?? 6}</div>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Customer Metrics */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Customer Metrics
                </span>
                <Link href="/admin/customers" className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/customers/new" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">New</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{stats.newCustomers ?? 28}</div>
                </Link>
                <Link href="/admin/customers?status=suspended" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Inactive</span>
                  <div className="font-bold text-rose-500">{stats.inactiveCustomers ?? 14}</div>
                </Link>
                <Link href="/admin/customers?status=expired" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Expired</span>
                  <div className="font-bold text-amber-500">{stats.expiredCustomers}</div>
                </Link>
                <Link href="/admin/customer-payments" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Total Billed</span>
                  <div className="font-bold font-mono text-[11px] text-foreground">৳1.45M</div>
                </Link>
              </div>
            </div>

            {/* Package & Service */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Box className="h-3.5 w-3.5 text-primary" /> Packages & Areas
                </span>
                <Link href="/admin/packages" className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/packages" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Active Packages</span>
                  <div className="font-bold text-foreground">{stats.totalPackages ?? 12}</div>
                </Link>
                <Link href="/admin/areas" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Service Zones</span>
                  <div className="font-bold text-foreground">{stats.totalAreas ?? 8}</div>
                </Link>
                <div className="col-span-2 p-2 rounded-lg bg-muted/30 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">Efficiency Rate</span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                    {stats.efficiencyRate ?? 92.8}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Employee Metrics */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> Employee Metrics
                </span>
                <Link href="/admin/hr/employees" className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/hr/employees" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Active Staff</span>
                  <div className="font-bold text-foreground">{stats.employeeActive ?? 18}</div>
                </Link>
                <Link href="/admin/hr/employees" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Inactive</span>
                  <div className="font-bold text-muted-foreground">{stats.employeeInactive ?? 2}</div>
                </Link>
                <Link href="/admin/hr/salaries" className="col-span-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors flex justify-between items-center cursor-pointer block group">
                  <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">Salaries Paid</span>
                  <span className="font-bold font-mono text-foreground">৳{(stats.employeePaymentReceived ?? 385000).toLocaleString()}</span>
                </Link>
              </div>
            </div>

            {/* Network & Routers */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> Network & POPs
                </span>
                <Link href="/admin/routers" className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/routers" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Active Routers</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{stats.routerActive ?? 6}</div>
                </Link>
                <Link href="/admin/pop/resellers" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer block group">
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">POP Resellers</span>
                  <div className="font-bold text-foreground">{stats.allResellers ?? 12}</div>
                </Link>
                <div className="col-span-2 p-2 rounded-lg bg-muted/30 flex justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">Router Status</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">All NAS Online</span>
                </div>
              </div>
            </div>
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
                <Card className="p-4 rounded-xl border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 cursor-pointer h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate max-w-[170px]">{router.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{router.host}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                      <div className="font-bold text-sm">{router.totalUsers}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Online</span>
                      <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{router.activeUsers}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Offline</span>
                      <div className="font-bold text-sm text-muted-foreground">{router.inactiveUsers}</div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Manage sessions</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Analytics Charts Grid: Customer Payment Report (Area) + Weekly Collections (Bar) */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-12">
        {/* Customer Payment Report */}
        <Card className="lg:col-span-8 border-border/70 bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Customer Payment Report</CardTitle>
              <CardDescription className="text-xs">Jan – Sep 2026 Collection Trends vs Monthly Target</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span>Collected</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                <span>Target</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrend ?? []}>
                  <defs>
                    <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(val: unknown) => [typeof val === 'number' ? `৳${val.toLocaleString()}` : String(val), 'Amount']}
                  />
                  <Area type="monotone" dataKey="collection" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCol)" />
                  <Area type="monotone" dataKey="target" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Revenue Daily Bars */}
        <Card className="lg:col-span-4 border-border/70 bg-card shadow-2xs">
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
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyCollections ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(val: unknown) => [typeof val === 'number' ? `৳${val.toLocaleString()}` : String(val), 'Collected']}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method Mix, Ticket Support Health, Bandwidth Usage */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Payment Method Mix */}
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
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
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Collection & Support</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
                {stats.ticketStats?.solvedRate ?? 94}% Solved
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">Helpdesk incident tracking status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/admin/support" className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-colors text-center block group">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">Open Tickets</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.ticketStats?.open ?? 7}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors text-center block group">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Ongoing Work</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.ticketStats?.ongoing ?? 12}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors text-center block group">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">Solved</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.ticketStats?.solved ?? 145}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-xl border border-muted/60 bg-muted/20 hover:border-muted/90 hover:bg-muted/40 transition-colors text-center block group">
                <span className="text-[11px] text-muted-foreground font-semibold group-hover:underline">Closed / Archived</span>
                <div className="text-2xl font-black text-muted-foreground mt-1">{stats.ticketStats?.closed ?? 210}</div>
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
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-primary" /> Daily Bandwidth
              </CardTitle>
              <CardDescription className="text-xs">Live throughput profile</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-[11px]">
              {(stats.totalDataGb ?? 48250.5).toLocaleString()} GB
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.bandwidthHourly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}G`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(val: unknown) => [typeof val === 'number' ? `${val} Gbps` : String(val), 'Peak Rate']}
                  />
                  <Area type="monotone" dataKey="gbps" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t text-muted-foreground">
              <span>Peak: 9.6 Gbps at 20:00</span>
              <span className="text-emerald-500 font-semibold">Healthy link capacity</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Geo Revenue by Territory & Real-time Audit Log */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-7">
        {/* Geo Revenue */}
        <Card className="lg:col-span-4 border-border/70 bg-card shadow-2xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Geo Revenue by Service Area
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
                  className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{geo.area}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {geo.customers} subscribers ({geo.active} active)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-foreground">
                      ৳{geo.revenueBdt.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">98% collected</span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Live Audit Log */}
        <Card className="lg:col-span-3 border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
              <span>Live Audit Log</span>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal">
                Real-time
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              System transactions, radius events & operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-2.5 text-xs hover:border-primary/30 transition-colors group"
              >
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Clock className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{act.text}</p>
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
