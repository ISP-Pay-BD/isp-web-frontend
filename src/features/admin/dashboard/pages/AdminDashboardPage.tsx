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
  Users,
  UserCheck,
  UserX,
  Server,
  Building2,
  Briefcase,
  Layers,
  Send,
  RefreshCw,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
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
  const [selectedRouter, setSelectedRouter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredGeoRevenue = useMemo(() => {
    if (!stats?.geoRevenue) return [];
    if (!geoSearch.trim()) return stats.geoRevenue;
    const q = geoSearch.toLowerCase();
    return stats.geoRevenue.filter((g) => g.area.toLowerCase().includes(q));
  }, [stats, geoSearch]);

  const handleSyncMikroTik = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('MikroTik sync completed — 4 routers & 80 subscriber queues updated.');
    }, 1000);
  };

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
    <div className="w-full space-y-6 pb-12">
      {/* Header & Quick Action Hub */}
      <div>
        <PageHeader
          title="Operations Command Center"
          subtitle="Real-time subscriber sessions, billing triage, MikroTik gateways & network health."
          breadcrumb={[
            { label: 'Admin', url: '/admin/dashboard' },
            { label: 'Dashboard' },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="ui-press text-xs"
                onClick={handleSyncMikroTik}
                disabled={isSyncing}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync MikroTik'}
              </Button>
              <Link href="/admin/sms">
                <Button size="sm" variant="outline" className="ui-press text-xs">
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Due SMS
                </Button>
              </Link>
              <Link href="/admin/customer-payments/new">
                <Button size="sm" variant="outline" className="ui-press text-xs">
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Record payment
                </Button>
              </Link>
              <Link href="/admin/customers/new">
                <Button size="sm" className="ui-press text-xs font-medium bg-landing-cta text-white hover:bg-landing-cta-hover">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add customer
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* 5 Primary Operational Hero KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Active Customers */}
        <Link href="/admin/customers?status=active" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition-all hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Active Customers</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                <NumberFlow value={stats.activeCustomers} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">/ {stats.totalCustomers}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>View details</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Payment Received */}
        <Link href="/admin/customer-payments" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition-all hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Payment Received</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳<NumberFlow value={stats.monthlyCollectionBdt} format={{ notation: 'compact' }} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersPaymentReceivedCount ?? 840})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>View ledger</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Payment Due */}
        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition-all hover:border-amber-500/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Payment Due</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                ৳<NumberFlow value={stats.customersExpaymentTotal ?? 54000} format={{ notation: 'compact' }} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersExpaymentCount ?? 45})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <span>Collect dues</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Open Tickets */}
        <Link href="/admin/support" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition-all hover:border-rose-500/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Open Tickets</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                <NumberFlow value={stats.pendingTickets} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">
                {stats.ticketStats?.solvedRate ?? 94}% solved
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
              <span>Helpdesk</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Customer Quota */}
        <Link href="/admin/subscription" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition-all hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Tenant Quota</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                {stats.customerQuota?.used ?? 248}
              </p>
              <span className="text-muted-foreground text-xs font-normal">/ {stats.customerQuota?.limit ?? 500}</span>
            </div>
            <div className="mt-2">
              <Progress value={stats.customerQuota?.percent ?? 49.6} className="h-1.5" />
            </div>
          </SpotlightCard>
        </Link>
      </div>

      {/* Categorized Operational Metric Mini-Strips */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Customer Metrics Strip */}
        <Card className="border border-border/70 bg-card/80 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Customer Metrics
            </span>
            <Link href="/admin/customers" className="text-[10px] text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">New Customers:</span>
              <Badge variant="secondary" className="font-mono text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +{stats.newCustomers ?? 28}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inactive (Disconnected):</span>
              <span className="font-mono font-medium text-foreground">{stats.inactiveCustomers ?? 14}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Expired:</span>
              <span className="font-mono font-semibold text-rose-500">{stats.expiredCustomers ?? 18}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Billed Total:</span>
              <span className="font-mono font-bold text-foreground">৳{((stats.customersPaymentTotal ?? 1450000) / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Due Pending:</span>
              <span className="font-mono font-bold text-amber-500">৳{((stats.customersPaymentPending ?? 165000) / 1000).toFixed(0)}k</span>
            </div>
          </CardContent>
        </Card>

        {/* Package & Service Areas */}
        <Card className="border border-border/70 bg-card/80 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" /> Package &amp; Coverage
            </span>
            <Link href="/admin/packages" className="text-[10px] text-primary hover:underline">
              Plans
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Packages:</span>
              <span className="font-mono font-semibold text-foreground">{stats.totalPackages ?? 12} plans</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Service Areas:</span>
              <span className="font-mono font-semibold text-foreground">{stats.totalAreas ?? 8} zones</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Plan Efficiency:</span>
              <Badge variant="secondary" className="font-mono text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {stats.efficiencyRate ?? 92.8}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Top Area:</span>
              <span className="font-medium text-foreground">Dhaka North</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Top Plan:</span>
              <span className="font-medium text-foreground">20 Mbps Turbo</span>
            </div>
          </CardContent>
        </Card>

        {/* HR & Staff Metrics */}
        <Card className="border border-border/70 bg-card/80 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-amber-500" /> Staff &amp; Payroll
            </span>
            <Link href="/admin/hr/employees" className="text-[10px] text-primary hover:underline">
              HR Desk
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Employees:</span>
              <span className="font-mono font-semibold text-foreground">{stats.employeeActive ?? 18} staff</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inactive / On Leave:</span>
              <span className="font-mono font-medium text-muted-foreground">{stats.employeeInactive ?? 2}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Salaries Paid:</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                ৳{((stats.employeePaymentReceived ?? 385000) / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Pending Salary Due:</span>
              <span className="font-mono font-bold text-amber-500">
                ৳{((stats.employeePaymentPending ?? 45000) / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Field Technicians:</span>
              <span className="font-medium text-foreground">12 on duty</span>
            </div>
          </CardContent>
        </Card>

        {/* Network & Router Infrastructure */}
        <Card className="border border-border/70 bg-card/80 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-emerald-500" /> Network Infrastructure
            </span>
            <Link href="/admin/routers" className="text-[10px] text-primary hover:underline">
              Routers
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Routers:</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {stats.routerActive ?? 6} online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inactive / Offline:</span>
              <span className="font-mono font-medium text-muted-foreground">{stats.routerInactive ?? 1}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">POP Resellers:</span>
              <span className="font-mono font-semibold text-foreground">{stats.allResellers ?? 12} POPs</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">PPPoE Sessions:</span>
              <span className="font-mono font-bold text-foreground">{stats.onlineUsers ?? 215} live</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">BDIX Pipe:</span>
              <span className="font-medium text-emerald-500">Connected (10G)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POP Live Sessions — MikroTik Hub Status Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
              <Wifi className="text-primary h-4 w-4" /> POP Live Sessions &amp; MikroTik Gateways
            </h2>
            <p className="text-muted-foreground text-xs">Live PPPoE subscriber sessions across connected access concentrators</p>
          </div>
          <Link href="/admin/routers">
            <Button size="sm" variant="ghost" className="text-primary text-xs">
              Manage routers <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(stats.routers ?? []).map((router) => (
            <Card key={router.id} className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2 pt-3 px-3.5 flex flex-row items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <Link href={`/admin/routers`} className="font-semibold text-xs text-foreground truncate hover:text-primary transition-colors block">
                    {router.name}
                  </Link>
                  <span className="font-mono text-[10px] text-muted-foreground">{router.host}</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/20 px-1.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Online
                </Badge>
              </CardHeader>
              <CardContent className="px-3.5 pb-3 pt-1">
                <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted/30 p-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Total</div>
                    <div className="font-mono text-xs font-bold text-foreground">{router.totalUsers}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</div>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{router.activeUsers}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Offline</div>
                    <div className="font-mono text-xs font-bold text-muted-foreground">{router.inactiveUsers}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{router.lastUpdated ?? 'Live sync'}</span>
                  <Link href="/admin/routers" className="text-primary hover:underline font-medium flex items-center gap-0.5">
                    View users <ChevronRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid: Customer Payment Report + Weekly Collections */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Customer Payment Report — Combo Chart (Bar + Line) */}
        <Card className="lg:col-span-8 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
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
                    name="Actual"
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
                    name="Target"
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
        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
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
                  <div className="text-sm font-bold font-mono text-foreground">
                    ৳{((stats.weeklyCollections ?? []).reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center flex-1">
                  <div className="text-[10px] tracking-wide text-muted-foreground">Avg/Day</div>
                  <div className="text-sm font-bold font-mono text-foreground">
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

      {/* Package Distribution + Payment Method Mix + Helpdesk Support Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Package Distribution Donut Chart */}
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-primary" /> Package Distribution
              </CardTitle>
              <CardDescription className="text-xs">Subscribers by bandwidth plan</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              {stats.efficiencyRate ?? 92.8}% Efficiency
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.packageDistribution ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {(stats.packageDistribution ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `${val} subscribers`}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-1">
              {(stats.packageDistribution ?? []).map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between text-xs py-0.5">
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pkg.color }} />
                    {pkg.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">{pkg.count} users</span>
                    <span className="font-bold text-foreground">{pkg.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Mix */}
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Payment Method Mix
              </CardTitle>
              <CardDescription className="text-xs">MFS gateway collection shares</CardDescription>
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
                      <span className="font-bold text-foreground">{method.percent}%</span>
                    </div>
                  </div>
                  <Progress value={method.percent} className="h-2" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Ticket & Support Health */}
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Collection &amp; Support</span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {stats.ticketStats?.solvedRate ?? 94}% Solved
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Helpdesk incident tracking status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline border border-border/40">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Open Tickets</span>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.ticketStats?.open ?? 7}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline border border-border/40">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Ongoing Work</span>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.ticketStats?.ongoing ?? 12}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline border border-border/40">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Solved</span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.ticketStats?.solved ?? 145}</div>
              </Link>
              <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block group no-underline border border-border/40">
                <span className="text-[11px] text-muted-foreground font-medium">Closed</span>
                <div className="text-2xl font-bold text-muted-foreground mt-1">{stats.ticketStats?.closed ?? 210}</div>
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
      </div>

      {/* Subscriber Health & Churn + Daily Bandwidth Throughput */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscriber Growth vs Churn */}
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Subscriber Health &amp; Churn</CardTitle>
              <CardDescription className="text-xs">New user acquisitions vs disconnected churn</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
              {stats.retentionRate ?? 96.2}% Retention
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.growthChurn ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `${val} users`}
                      />
                    }
                  />
                  <Bar dataKey="newUsers" name="New Customers" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="churned" name="Churned" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> +52 New added this month
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> -7 Churned
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Data Consumption (Bandwidth) */}
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-emerald-500" /> Daily Bandwidth Consumption
              </CardTitle>
              <CardDescription className="text-xs">Live throughput profile &amp; traffic flow</CardDescription>
            </div>
            <span className="font-mono text-[11px] font-bold text-foreground">
              {(stats.totalDataGb ?? 48250.5).toLocaleString()} GB Transferred
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.bandwidthHourly ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientBandwidth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
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
              <span className="text-muted-foreground">Peak Speed: <span className="font-bold text-emerald-600 dark:text-emerald-400">9.6 Gbps</span> at 20:00</span>
              <span className="text-emerald-500 font-medium">BDIX / IIG Upstream Healthy</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geo Revenue by Territory & Real-time Audit Log */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Geo Revenue */}
        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Geo Revenue by Service Area
              </CardTitle>
              <CardDescription className="text-xs">
                Billing collections mapped across active subscriber zones
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
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-border/40">
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
                    <div className="font-mono font-bold text-xs text-foreground">
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
        <Card className="lg:col-span-3 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Live Audit Log</span>
              <Badge variant="outline" className="text-[10px] font-mono font-normal">
                Real-time
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              System transactions, radius events &amp; operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-lg bg-muted/20 p-2.5 text-xs border border-border/30"
              >
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
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

