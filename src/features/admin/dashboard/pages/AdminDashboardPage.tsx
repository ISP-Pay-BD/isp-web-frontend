'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState, type ReactNode } from 'react';
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
  Users,
  UserCheck,
  Server,
  Briefcase,
  Layers,
  Send,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/shared/Can';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

// Heavy client-only libraries are split out of the initial bundle.
const NumberFlow = dynamic(() => import('@number-flow/react'), { ssr: false });
const chartFallback = () => <div className="h-full w-full animate-pulse rounded-lg bg-muted/30" />;
const CollectionsTrendChart = dynamic(() => import('../components/DashboardCharts').then((m) => m.CollectionsTrendChart), {
  ssr: false,
  loading: chartFallback,
});
const WeeklyCollectionsChart = dynamic(() => import('../components/DashboardCharts').then((m) => m.WeeklyCollectionsChart), {
  ssr: false,
  loading: chartFallback,
});
const PackageDonutChart = dynamic(() => import('../components/DashboardCharts').then((m) => m.PackageDonutChart), {
  ssr: false,
  loading: chartFallback,
});

const bdtK = (v: number) => (Math.abs(v) >= 1000 ? `৳${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : `৳${v.toLocaleString()}`);

function NoData({ text = 'No data recorded yet.' }: { text?: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, error, isFetching, refetch } = useAdminDashboard();
  const [geoSearch, setGeoSearch] = useState('');

  const filteredGeoRevenue = useMemo(() => {
    if (!stats?.geoRevenue) return [];
    const q = geoSearch.trim().toLowerCase();
    return q ? stats.geoRevenue.filter((g) => g.area.toLowerCase().includes(q)) : stats.geoRevenue;
  }, [stats, geoSearch]);

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (isError || !stats) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={errorMessage(error, 'Could not load dashboard metrics.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const trendCollected = stats.monthlyTrend.reduce((sum, m) => sum + m.collected, 0);
  const trendPending = stats.monthlyTrend.reduce((sum, m) => sum + m.pending, 0);
  const collectionRate = trendCollected + trendPending > 0 ? (trendCollected / (trendCollected + trendPending)) * 100 : null;
  const weeklyTotal = stats.weeklyCollections.reduce((sum, d) => sum + d.amount, 0);
  const weeklyPeak = stats.weeklyCollections.length ? Math.max(...stats.weeklyCollections.map((d) => d.amount)) : 0;
  const topArea = stats.geoRevenue[0];
  const topPlan = stats.packageDistribution.reduce<(typeof stats.packageDistribution)[number] | null>(
    (best, p) => (!best || p.count > best.count ? p : best),
    null,
  );
  const quota = stats.customerQuota;

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <PageHeader
          title="Operations Command Center"
          subtitle={
            stats.generatedAt
              ? `Subscribers, billing, routers and support at a glance · updated ${formatDateTime(stats.generatedAt)}`
              : 'Subscribers, billing, routers and support at a glance'
          }
          breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Dashboard' }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="ui-press text-xs" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Can menu="sms_message" action="read">
                <Link href="/admin/sms">
                  <Button size="sm" variant="outline" className="ui-press text-xs">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Due SMS
                  </Button>
                </Link>
              </Can>
              <Can menu="customer_payment" action="create">
                <Link href="/admin/customer-payments/new">
                  <Button size="sm" variant="outline" className="ui-press text-xs">
                    <Receipt className="mr-1.5 h-3.5 w-3.5" /> Record payment
                  </Button>
                </Link>
              </Can>
              <Can menu="customer" action="create">
                <Link href="/admin/customers/new">
                  <Button size="sm" className="ui-press text-xs font-medium bg-landing-cta text-white hover:bg-landing-cta-hover">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add customer
                  </Button>
                </Link>
              </Can>
            </div>
          }
        />
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link href="/admin/customers?status=active" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
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

        <Link href="/admin/customer-payments" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Received This Month</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳<NumberFlow value={stats.monthlyCollectionBdt} format={{ notation: 'compact' }} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersPaymentReceivedCount})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Today: ৳{stats.todayCollectionBdt.toLocaleString()}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-amber-500/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Payment Due</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                ৳<NumberFlow value={stats.customersExpaymentTotal} format={{ notation: 'compact' }} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersExpaymentCount})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <span>Collect dues</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/support" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-rose-500/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Open Tickets</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                <NumberFlow value={stats.ticketStats.open} />
              </p>
              {stats.ticketStats.solvedRate !== null ? (
                <span className="text-muted-foreground text-xs font-normal">{stats.ticketStats.solvedRate}% resolved</span>
              ) : null}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
              <span>Helpdesk</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/subscription" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide">Customer Quota</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
            </div>
            {quota ? (
              <>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <p className="font-mono text-2xl font-bold text-foreground">{quota.used}</p>
                  <span className="text-muted-foreground text-xs font-normal">/ {quota.isUnlimited ? '∞' : quota.limit}</span>
                </div>
                <div className="mt-2">
                  <Progress value={quota.isUnlimited ? 0 : quota.percent} className="h-1.5" />
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Not available for this account</p>
            )}
          </SpotlightCard>
        </Link>
      </div>

      {/* Metric strips */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<Users className="h-3.5 w-3.5 text-primary" />} title="Customer Metrics" href="/admin/customers" linkLabel="Manage">
          <MetricRow label="New this month" value={`+${stats.newCustomers}`} accent="text-emerald-600 dark:text-emerald-400" />
          <MetricRow label="Disconnected" value={stats.inactiveCustomers} />
          <MetricRow label="Expired" value={stats.expiredCustomers} accent="text-rose-500" />
          <MetricRow label="Expected monthly billing" value={`৳${stats.customersPaymentTotal.toLocaleString()}`} divider />
          <MetricRow label="Pending (last 32 days)" value={`৳${stats.customersPaymentPending.toLocaleString()}`} accent="text-amber-500" />
        </MetricCard>

        <MetricCard icon={<Layers className="h-3.5 w-3.5 text-blue-500" />} title="Package & Coverage" href="/admin/packages" linkLabel="Plans">
          <MetricRow label="Active packages" value={stats.totalPackages} />
          <MetricRow label="Active service areas" value={stats.totalAreas} />
          <MetricRow label="Top area" value={topArea ? topArea.area : '—'} divider />
          <MetricRow label="Top plan" value={topPlan ? `${topPlan.name} (${topPlan.count})` : '—'} />
        </MetricCard>

        <MetricCard icon={<Briefcase className="h-3.5 w-3.5 text-amber-500" />} title="Staff & Payroll" href="/admin/hr/employees" linkLabel="HR Desk">
          <MetricRow label="Active employees" value={stats.employeeActive} />
          <MetricRow label="Inactive" value={stats.employeeInactive} />
          <MetricRow label="Salaries paid (all time)" value={`৳${stats.employeePaymentReceived.toLocaleString()}`} accent="text-emerald-600 dark:text-emerald-400" divider />
          <MetricRow label="Salary pending this month" value={`৳${stats.employeePaymentPending.toLocaleString()}`} accent="text-amber-500" />
        </MetricCard>

        <MetricCard icon={<Server className="h-3.5 w-3.5 text-emerald-500" />} title="Network Infrastructure" href="/admin/routers" linkLabel="Routers">
          <MetricRow label="Active routers" value={stats.routerActive} accent="text-emerald-600 dark:text-emerald-400" />
          <MetricRow label="Inactive routers" value={stats.routerInactive} />
          <MetricRow label="POP resellers" value={stats.allResellers} />
          <MetricRow label="Connected customers" value={stats.connectedCustomers} divider />
        </MetricCard>
      </div>

      {/* Routers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
              <Wifi className="text-primary h-4 w-4" /> Active Routers
            </h2>
            <p className="text-muted-foreground text-xs">Customers per router (live counts when the router poller has reported)</p>
          </div>
          <Link href="/admin/routers">
            <Button size="sm" variant="ghost" className="text-primary text-xs">
              Manage routers <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        {stats.routers.length === 0 ? (
          <Card className="border border-dashed border-border/70">
            <NoData text="No active routers configured." />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.routers.map((router) => (
              <Card key={router.id} className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2 pt-3 px-3.5 flex flex-row items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <Link href="/admin/routers" className="font-semibold text-xs text-foreground truncate hover:text-primary transition-colors block">
                      {router.name}
                    </Link>
                    <span className="font-mono text-[10px] text-muted-foreground">{router.host}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 capitalize">
                    {router.liveStatus ?? 'active'}
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
                    <span>{router.lastUpdated ? `Polled ${router.lastUpdated}` : 'From customer records'}</span>
                    <Link href="/admin/routers" className="text-primary hover:underline font-medium flex items-center gap-0.5">
                      Details <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Collections */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Collected vs Pending by Month</CardTitle>
              <CardDescription className="text-xs">Customer payments, year to date</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                <span className="font-medium">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-amber-600 rounded-full" />
                <span className="font-medium text-muted-foreground">Pending</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80 w-full">
              {stats.monthlyTrend.length ? <CollectionsTrendChart data={stats.monthlyTrend} /> : <NoData />}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
              <Summary label="Collected" value={bdtK(trendCollected)} />
              <Summary label="Pending" value={bdtK(trendPending)} muted />
              <Summary label="Collection rate" value={collectionRate === null ? '—' : `${collectionRate.toFixed(1)}%`} accent />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Last 7 Days</CardTitle>
            <CardDescription className="text-xs">Daily customer collections</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              {stats.weeklyCollections.length ? <WeeklyCollectionsChart data={stats.weeklyCollections} /> : <NoData />}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <Summary label="Total" value={bdtK(weeklyTotal)} />
              <div className="h-8 w-px bg-border/50" />
              <Summary label="Avg/Day" value={bdtK(Math.round(weeklyTotal / Math.max(1, stats.weeklyCollections.length)))} />
              <div className="h-8 w-px bg-border/50" />
              <Summary label="Peak" value={bdtK(weeklyPeak)} accent />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution, methods, support */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" /> Package Distribution
            </CardTitle>
            <CardDescription className="text-xs">Customers by package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.packageDistribution.length ? (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <PackageDonutChart data={stats.packageDistribution} />
                </div>
                <div className="space-y-1.5 pt-1">
                  {stats.packageDistribution.map((pkg) => (
                    <div key={pkg.name} className="flex items-center justify-between text-xs py-0.5">
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pkg.color }} />
                        {pkg.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground">{pkg.count}</span>
                        <span className="font-bold text-foreground">{pkg.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <NoData />
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Payment Method Mix
              </CardTitle>
              <CardDescription className="text-xs">Customer collections, year to date</CardDescription>
            </div>
            <Link href="/admin/customer-payments" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
              Ledger <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.paymentMethods.length ? (
              stats.paymentMethods.map((method) => (
                <div key={method.name} className="space-y-1.5 p-2 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
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
              ))
            ) : (
              <NoData />
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Support Tickets</span>
              {stats.ticketStats.solvedRate !== null ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{stats.ticketStats.solvedRate}% resolved</span>
              ) : null}
            </CardTitle>
            <CardDescription className="text-xs">Tickets raised by your customers and staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pt-2">
              <TicketTile label="Open" value={stats.ticketStats.open} tone="text-amber-600 dark:text-amber-400" />
              <TicketTile label="Ongoing" value={stats.ticketStats.ongoing} tone="text-blue-600 dark:text-blue-400" />
              <TicketTile label="Solved" value={stats.ticketStats.solved} tone="text-emerald-600 dark:text-emerald-400" />
              <TicketTile label="Closed" value={stats.ticketStats.closed} tone="text-muted-foreground" />
            </div>
            <Link href="/admin/support">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Open Support Desk <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Areas + recent payments */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Revenue by Service Area
              </CardTitle>
              <CardDescription className="text-xs">This month&apos;s collections and customers per area</CardDescription>
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
            {filteredGeoRevenue.length ? (
              filteredGeoRevenue.map((geo) => (
                <Link key={geo.area} href="/admin/areas" className="block group no-underline">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-border/40">
                    <div>
                      <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                        <span>{geo.area}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {geo.customers} customers ({geo.active} active)
                      </div>
                    </div>
                    <div className="font-mono font-bold text-xs text-foreground">৳{geo.revenueBdt.toLocaleString()}</div>
                  </div>
                </Link>
              ))
            ) : (
              <NoData text={geoSearch ? 'No area matches your search.' : 'No customers assigned to areas yet.'} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Recent Payments</span>
              <Link href="/admin/customer-payments" className="text-xs text-primary hover:underline font-semibold">
                View all
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">Latest customer payment activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {stats.recentActivities.length ? (
              stats.recentActivities.map((act) => (
                <Link
                  key={act.id}
                  href={`/admin/customer-payments/${act.id}/pos`}
                  className="flex items-start gap-3 rounded-lg bg-muted/20 p-2.5 text-xs border border-border/30 hover:bg-muted/40 no-underline"
                >
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <Receipt className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {act.customerName || 'Customer'} · ৳{act.amountBdt.toLocaleString()} {act.method ? `via ${act.method}` : ''}
                    </p>
                    <span className="text-muted-foreground text-[10px] capitalize">
                      {act.status}
                      {act.at ? ` · ${formatDateTime(act.at)}` : ''}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <NoData text="No payments recorded yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  href,
  linkLabel,
  children,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <Card className="border border-border/70 bg-card/80 shadow-[var(--shadow-xs)]">
      <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          {icon} {title}
        </span>
        <Link href={href} className="text-[10px] text-primary hover:underline">
          {linkLabel}
        </Link>
      </CardHeader>
      <CardContent className="px-4 pb-3.5 space-y-2">{children}</CardContent>
    </Card>
  );
}

function MetricRow({ label, value, accent, divider }: { label: string; value: string | number; accent?: string; divider?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 text-xs ${divider ? 'pt-1 border-t border-border/50' : ''}`}>
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-mono font-semibold text-right truncate ${accent ?? 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function Summary({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="text-center flex-1">
      <div className="text-[10px] tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm font-bold font-mono ${accent ? 'text-emerald-500' : muted ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function TicketTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block no-underline border border-border/40">
      <span className={`text-[11px] font-medium ${tone}`}>{label}</span>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </Link>
  );
}
