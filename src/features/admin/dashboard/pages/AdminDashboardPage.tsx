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
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Banknote,
  Landmark,
  CreditCard,
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
import { formatDateTime, formatBdtWithSymbol, numberLocale, COMPACT_FORMAT } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
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

const bdtK = (v: number) => (Math.abs(v) >= 1000 ? `৳${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : `${formatBdtWithSymbol(v)}`);

function NoData({ text }: { text?: string }) {
  const t = useTranslations();
  return <p className="py-6 text-center text-xs text-muted-foreground">{text ?? t('admin.dashboard.noData', 'No data recorded yet.')}</p>;
}

export function AdminDashboardPage() {
  const t = useTranslations();
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
      <EmptyState variant="error"
        title={t('admin.dashboard.error.title', 'Failed to load dashboard')}
        description={errorMessage(error, t('admin.dashboard.error.fallback', 'Could not load dashboard metrics.'))}
        actionLabel={t('common.retry', 'Retry')}
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
  const offlineUsers = stats.routers.reduce((sum, r) => sum + r.inactiveUsers, 0);
  const attention: { key: string; href: string; label: string; tone: string }[] = [
    stats.expiredCustomers > 0 && {
      key: 'expired',
      href: '/admin/customers?status=expired',
      label: t('admin.dashboard.attention.expired', '{count} expired customers', { count: stats.expiredCustomers }),
      tone: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    stats.customersPaymentPending > 0 && {
      key: 'pending',
      href: '/admin/customer-payments',
      label: t('admin.dashboard.attention.pending', '{amount} pending (last 32 days)', { amount: formatBdtWithSymbol(stats.customersPaymentPending) }),
      tone: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    offlineUsers > 0 && {
      key: 'offline',
      href: '/admin/routers',
      label: t('admin.dashboard.attention.offline', '{count} users offline on routers', { count: offlineUsers }),
      tone: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    stats.ticketStats.open > 0 && {
      key: 'tickets',
      href: '/admin/support',
      label: t('admin.dashboard.attention.tickets', '{count} open tickets', { count: stats.ticketStats.open }),
      tone: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ].filter(Boolean) as { key: string; href: string; label: string; tone: string }[];

  // Month-over-month delta for "Received This Month", derived from the same series the trend chart uses.
  const sortedTrend = stats.monthlyTrend;
  const thisMonthCollected = sortedTrend.at(-1)?.collected ?? null;
  const lastMonthCollected = sortedTrend.at(-2)?.collected ?? null;
  const collectedDeltaPct =
    thisMonthCollected !== null && lastMonthCollected
      ? ((thisMonthCollected - lastMonthCollected) / lastMonthCollected) * 100
      : null;

  const quotaTone = !quota || quota.isUnlimited
    ? ''
    : quota.percent >= 90
      ? 'text-rose-600 dark:text-rose-400'
      : quota.percent >= 70
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';
  const quotaBarTone = !quota || quota.isUnlimited
    ? ''
    : quota.percent >= 90
      ? '[&_[data-slot=progress-indicator]]:bg-rose-500'
      : quota.percent >= 70
        ? '[&_[data-slot=progress-indicator]]:bg-amber-500'
        : '[&_[data-slot=progress-indicator]]:bg-primary/60';

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <PageHeader
          title={t('admin.dashboard.heading', 'Operations Command Center')}
          subtitle={
            stats.generatedAt
              ? t('admin.dashboard.subtitleUpdated', 'Subscribers, billing, routers and support at a glance · updated {time}', {
                  time: formatDateTime(stats.generatedAt),
                })
              : t('admin.dashboard.subtitle', 'Subscribers, billing, routers and support at a glance')
          }
          breadcrumb={[{ label: 'Admin', url: '/admin/dashboard' }, { label: 'Dashboard' }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" className="ui-press text-xs text-muted-foreground" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                {t('admin.dashboard.refresh', 'Refresh')}
              </Button>
              <Can menu="sms_message" action="read">
                <Button size="sm" variant="ghost" className="ui-press text-xs text-muted-foreground" render={<Link href="/admin/sms" />}>
                    <Send className="mr-1.5 h-3.5 w-3.5" /> {t('admin.dashboard.dueSms', 'Due SMS')}
                  </Button>
              </Can>
              <Can menu="customer_payment" action="create">
                <Button size="sm" variant="outline" className="ui-press text-xs" render={<Link href="/admin/customer-payments/new" />}>
                    <Receipt className="mr-1.5 h-3.5 w-3.5" /> {t('admin.dashboard.recordPayment', 'Record payment')}
                  </Button>
              </Can>
              <Can menu="customer" action="create">
                <Button size="sm" className="ui-press text-xs font-medium bg-landing-cta text-white hover:bg-landing-cta-hover" render={<Link href="/admin/customers/new" />}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> {t('admin.dashboard.addCustomer', 'Add customer')}
                  </Button>
              </Can>
            </div>
          }
        />
      </div>

      {/* Needs attention: only what requires action; hidden when all clear */}
      {attention.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="region" aria-label={t('admin.dashboard.attention.title', 'Needs attention')}>
          <span className="text-foreground mr-1 text-sm font-semibold">{t('admin.dashboard.attention.title', 'Needs attention')}</span>
          {attention.map((a) => (
            <Link
              key={a.key}
              href={a.href}
              className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium no-underline transition-colors duration-200 ease-out hover:brightness-110 ${a.tone}`}
            >
              {a.label}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link href="/admin/customers?status=active" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t('admin.dashboard.kpi.activeCustomers', 'Active Customers')}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                <NumberFlow locales={numberLocale()} value={stats.activeCustomers} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">/ {stats.totalCustomers}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>{t('admin.dashboard.kpi.viewDetails', 'View details')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/customer-payments" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t('admin.dashboard.kpi.receivedMonth', 'Received This Month')}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳<NumberFlow locales={numberLocale()} value={stats.monthlyCollectionBdt} format={COMPACT_FORMAT} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersPaymentReceivedCount})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                {t('admin.dashboard.kpi.today', 'Today: {amount}', { amount: formatBdtWithSymbol(stats.todayCollectionBdt) })}
                {collectedDeltaPct !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-xs tabular-nums ${collectedDeltaPct >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
                  >
                    {collectedDeltaPct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {Math.abs(collectedDeltaPct).toFixed(0)}%
                  </span>
                )}
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/customers?status=expired" className="group block no-underline">
          <SpotlightCard className="h-full border border-amber-500/40 p-4 transition hover:border-amber-500/70">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t('admin.dashboard.kpi.paymentDue', 'Payment Due')}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                ৳<NumberFlow locales={numberLocale()} value={stats.customersExpaymentTotal} format={COMPACT_FORMAT} />
              </p>
              <span className="text-muted-foreground text-xs font-normal">({stats.customersExpaymentCount})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span>{t('admin.dashboard.kpi.collectDues', 'Collect dues')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/support" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-rose-500/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t('admin.dashboard.kpi.openTickets', 'Open Tickets')}</span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${stats.ticketStats.open > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}
              >
                {stats.ticketStats.open > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="font-mono text-2xl font-bold text-foreground">
                <NumberFlow locales={numberLocale()} value={stats.ticketStats.open} />
              </p>
              {stats.ticketStats.solvedRate !== null ? (
                <span className="text-muted-foreground text-xs font-normal">
                  {t('admin.dashboard.kpi.resolved', '{rate}% resolved', { rate: stats.ticketStats.solvedRate })}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
              <span>{t('admin.dashboard.kpi.helpdesk', 'Helpdesk')}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/admin/subscription" className="group block no-underline">
          <SpotlightCard className="h-full border border-border/70 p-4 transition hover:border-primary/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t('admin.dashboard.kpi.customerQuota', 'Customer Quota')}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
            </div>
            {quota ? (
              <>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <p className={`font-mono text-2xl font-bold ${quotaTone || 'text-foreground'}`}>{quota.used}</p>
                  <span className="text-muted-foreground text-xs font-normal">/ {quota.isUnlimited ? '∞' : quota.limit}</span>
                  {!quota.isUnlimited && quota.percent >= 70 && (
                    <span className={`text-xs font-medium ${quotaTone}`}>{quota.percent >= 90 ? t('admin.dashboard.kpi.quotaCritical', 'Almost full') : t('admin.dashboard.kpi.quotaWarning', 'Filling up')}</span>
                  )}
                </div>
                <div className="mt-2">
                  <Progress value={quota.isUnlimited ? 0 : quota.percent} className={`h-1.5 ${quotaBarTone}`} />
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{t('admin.dashboard.kpi.quotaUnavailable', 'Not available for this account')}</p>
            )}
          </SpotlightCard>
        </Link>
      </div>

      {/* Metric strips */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<Users className="h-3.5 w-3.5 text-primary" />} title={t('admin.dashboard.customerMetrics.title', 'Customer Metrics')} href="/admin/customers" linkLabel={t('admin.dashboard.customerMetrics.link', 'Manage')}>
          <MetricRow label={t('admin.dashboard.customerMetrics.newThisMonth', 'New this month')} value={`+${stats.newCustomers}`} accent="text-emerald-600 dark:text-emerald-400" />
          <MetricRow label={t('admin.dashboard.customerMetrics.disconnected', 'Disconnected')} value={stats.inactiveCustomers} />
          <MetricRow label={t('admin.dashboard.customerMetrics.expired', 'Expired')} value={stats.expiredCustomers} accent="text-rose-500" />
          <MetricRow label={t('admin.dashboard.customerMetrics.expectedBilling', 'Expected monthly billing')} value={`${formatBdtWithSymbol(stats.customersPaymentTotal)}`} divider />
          <MetricRow label={t('admin.dashboard.customerMetrics.pending32', 'Pending (last 32 days)')} value={`${formatBdtWithSymbol(stats.customersPaymentPending)}`} accent="text-amber-500" />
        </MetricCard>

        <MetricCard icon={<Layers className="h-3.5 w-3.5 text-blue-500" />} title={t('admin.dashboard.coverage.title', 'Package & Coverage')} href="/admin/packages" linkLabel={t('admin.dashboard.coverage.link', 'Plans')}>
          <MetricRow label={t('admin.dashboard.coverage.activePackages', 'Active packages')} value={stats.totalPackages} />
          <MetricRow label={t('admin.dashboard.coverage.activeAreas', 'Active service areas')} value={stats.totalAreas} />
          <MetricRow label={t('admin.dashboard.coverage.topArea', 'Top area')} value={topArea ? topArea.area : '—'} divider />
          <MetricRow label={t('admin.dashboard.coverage.topPlan', 'Top plan')} value={topPlan ? `${topPlan.name} (${topPlan.count})` : '—'} />
        </MetricCard>

        <MetricCard icon={<Briefcase className="h-3.5 w-3.5 text-amber-500" />} title={t('admin.dashboard.staff.title', 'Staff & Payroll')} href="/admin/hr/employees" linkLabel={t('admin.dashboard.staff.link', 'HR Desk')}>
          <MetricRow label={t('admin.dashboard.staff.active', 'Active employees')} value={stats.employeeActive} />
          <MetricRow label={t('admin.dashboard.staff.inactive', 'Inactive')} value={stats.employeeInactive} />
          <MetricRow label={t('admin.dashboard.staff.salariesPaid', 'Salaries paid (all time)')} value={`${formatBdtWithSymbol(stats.employeePaymentReceived)}`} accent="text-emerald-600 dark:text-emerald-400" divider />
          <MetricRow label={t('admin.dashboard.staff.salaryPending', 'Salary pending this month')} value={`${formatBdtWithSymbol(stats.employeePaymentPending)}`} accent="text-amber-500" />
        </MetricCard>

        <MetricCard icon={<Server className="h-3.5 w-3.5 text-emerald-500" />} title={t('admin.dashboard.network.title', 'Network Infrastructure')} href="/admin/routers" linkLabel={t('admin.dashboard.network.link', 'Routers')}>
          <MetricRow label={t('admin.dashboard.network.activeRouters', 'Active routers')} value={stats.routerActive} accent="text-emerald-600 dark:text-emerald-400" />
          <MetricRow label={t('admin.dashboard.network.inactiveRouters', 'Inactive routers')} value={stats.routerInactive} />
          <MetricRow label={t('admin.dashboard.network.popResellers', 'POP resellers')} value={stats.allResellers} />
          <MetricRow label={t('admin.dashboard.network.connectedCustomers', 'Online on routers')} value={stats.connectedCustomers} divider />
        </MetricCard>
      </div>

      {/* Routers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
              <Wifi className="text-primary h-4 w-4" /> {t('admin.dashboard.routers.title', 'Active Routers')}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t('admin.dashboard.routers.subtitle', 'Customers per router (live counts when the router poller has reported)')}
            </p>
          </div>
          <Button size="sm" variant="ghost" className="text-primary text-xs" render={<Link href="/admin/routers" />}>
              {t('admin.dashboard.routers.manage', 'Manage routers')} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
        </div>
        {stats.routers.length === 0 ? (
          <Card className="border border-dashed border-border/70">
            <NoData text={t('admin.dashboard.routers.empty', 'No active routers configured.')} />
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
                    <span className="font-mono text-xs text-muted-foreground">{router.host}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 capitalize">
                    {t(`status.${(router.liveStatus ?? 'active').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, router.liveStatus ?? 'active')}
                  </Badge>
                </CardHeader>
                <CardContent className="px-3.5 pb-3 pt-1">
                  <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted/30 p-2 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">{t('admin.dashboard.routers.total', 'Total')}</div>
                      <div className="font-mono text-xs font-bold text-foreground">{router.totalUsers}</div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('status.online', 'Online')}</div>
                      <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{router.activeUsers}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{t('status.offline', 'Offline')}</div>
                      <div className="font-mono text-xs font-bold text-muted-foreground">{router.inactiveUsers}</div>
                    </div>
                  </div>
                  {router.totalUsers > 0 && (
                    <div
                      className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${router.activeUsers} / ${router.totalUsers}`}
                    >
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(router.activeUsers / router.totalUsers) * 100}%` }} />
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {router.lastUpdated
                        ? t('admin.dashboard.routers.polled', 'Polled {time}', { time: router.lastUpdated })
                        : t('admin.dashboard.routers.fromRecords', 'From customer records')}
                    </span>
                    <Link href="/admin/routers" className="text-primary hover:underline font-medium flex items-center gap-0.5">
                      {t('admin.dashboard.routers.details', 'Details')} <ChevronRight className="h-2.5 w-2.5" />
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
              <CardTitle className="text-base font-bold">{t('admin.dashboard.trend.title', 'Collected vs Pending by Month')}</CardTitle>
              <CardDescription className="text-xs">{t('admin.dashboard.trend.subtitle', 'Customer payments, year to date')}</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                <span className="font-medium">{t('admin.dashboard.collected', 'Collected')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-amber-600 rounded-full" />
                <span className="font-medium text-muted-foreground">{t('admin.dashboard.pending', 'Pending')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80 w-full">
              {stats.monthlyTrend.length ? <CollectionsTrendChart data={stats.monthlyTrend} /> : <NoData />}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
              <Summary label={t('admin.dashboard.collected', 'Collected')} value={bdtK(trendCollected)} />
              <Summary label={t('admin.dashboard.pending', 'Pending')} value={bdtK(trendPending)} muted />
              <Summary label={t('admin.dashboard.trend.rate', 'Collection rate')} value={collectionRate === null ? '—' : `${collectionRate.toFixed(1)}%`} accent />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">{t('admin.dashboard.week.title', 'Last 7 Days')}</CardTitle>
            <CardDescription className="text-xs">{t('admin.dashboard.week.subtitle', 'Daily customer collections')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              {stats.weeklyCollections.length ? <WeeklyCollectionsChart data={stats.weeklyCollections} /> : <NoData />}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <Summary label={t('admin.dashboard.week.total', 'Total')} value={bdtK(weeklyTotal)} />
              <div className="h-8 w-px bg-border/50" />
              <Summary label={t('admin.dashboard.week.avg', 'Avg/Day')} value={bdtK(Math.round(weeklyTotal / Math.max(1, stats.weeklyCollections.length)))} />
              <div className="h-8 w-px bg-border/50" />
              <Summary label={t('admin.dashboard.week.peak', 'Peak')} value={bdtK(weeklyPeak)} accent />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution, methods, support */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <Card className="flex h-full flex-col border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" /> {t('admin.dashboard.packages.title', 'Package Distribution')}
            </CardTitle>
            <CardDescription className="text-xs">{t('admin.dashboard.packages.subtitle', 'Customers by package')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
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

        <Card className="flex h-full flex-col border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> {t('admin.dashboard.methods.title', 'Payment Method Mix')}
              </CardTitle>
              <CardDescription className="text-xs">{t('admin.dashboard.methods.subtitle', 'Customer collections, year to date')}</CardDescription>
            </div>
            <Link href="/admin/customer-payments" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
              {t('admin.dashboard.methods.ledger', 'Ledger')} <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {stats.paymentMethods.length ? (
              stats.paymentMethods.map((method) => (
                <div key={method.name} className="space-y-1.5 p-2 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: method.color }} />
                      {method.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{formatBdtWithSymbol(method.amountBdt)}</span>
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

        <Card className="flex h-full flex-col border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>{t('admin.dashboard.tickets.title', 'Support Tickets')}</span>
              {stats.ticketStats.solvedRate !== null ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t('admin.dashboard.kpi.resolved', '{rate}% resolved', { rate: stats.ticketStats.solvedRate })}
                </span>
              ) : null}
            </CardTitle>
            <CardDescription className="text-xs">{t('admin.dashboard.tickets.subtitle', 'Tickets raised by your customers and staff')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-4">
            <div className="grid grid-cols-2 gap-3 pt-2">
              <TicketTile label={t('admin.dashboard.tickets.open', 'Open')} value={stats.ticketStats.open} tone="text-amber-600 dark:text-amber-400" />
              <TicketTile label={t('admin.dashboard.tickets.ongoing', 'Ongoing')} value={stats.ticketStats.ongoing} tone="text-blue-600 dark:text-blue-400" />
              <TicketTile label={t('admin.dashboard.tickets.solved', 'Solved')} value={stats.ticketStats.solved} tone="text-emerald-600 dark:text-emerald-400" />
              <TicketTile label={t('admin.dashboard.tickets.closed', 'Closed')} value={stats.ticketStats.closed} tone="text-muted-foreground" />
            </div>
            <Button size="sm" variant="outline" className="mt-auto w-full text-xs" render={<Link href="/admin/support" />}>
                {t('admin.dashboard.tickets.openDesk', 'Open Support Desk')} <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
          </CardContent>
        </Card>
      </div>

      {/* Areas + recent payments */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {t('admin.dashboard.areas.title', 'Revenue by Service Area')}
              </CardTitle>
              <CardDescription className="text-xs">{t('admin.dashboard.areas.subtitle', "This month's collections and customers per area")}</CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('admin.dashboard.areas.search', 'Search area...')}
                aria-label={t('admin.dashboard.areas.search', 'Search area...')}
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
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t('admin.dashboard.areas.counts', '{customers} customers ({active} active)', { customers: geo.customers, active: geo.active })}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-xs text-foreground">{formatBdtWithSymbol(geo.revenueBdt)}</div>
                  </div>
                </Link>
              ))
            ) : (
              <NoData
                text={
                  geoSearch
                    ? t('admin.dashboard.areas.noMatch', 'No area matches your search.')
                    : t('admin.dashboard.areas.empty', 'No customers assigned to areas yet.')
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/70 bg-card/90 shadow-[var(--shadow-xs)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>{t('admin.dashboard.recent.title', 'Recent Payments')}</span>
              <Link href="/admin/customer-payments" className="text-xs text-primary hover:underline font-semibold">
                {t('common.viewAll', 'View all')}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">{t('admin.dashboard.recent.subtitle', 'Latest customer payment activity')}</CardDescription>
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
                    <PaymentMethodIcon method={act.method} className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {act.customerName || t('admin.dashboard.recent.customer', 'Customer')} · {formatBdtWithSymbol(act.amountBdt)}{' '}
                      {act.method ? t('admin.dashboard.recent.via', 'via {method}', { method: act.method }) : ''}
                    </p>
                    <span className="text-muted-foreground text-xs capitalize">
                      {t(`status.${act.status.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, act.status)}
                      {act.at ? ` · ${formatDateTime(act.at)}` : ''}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <NoData text={t('admin.dashboard.recent.empty', 'No payments recorded yet.')} />
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
    <Card className="border border-border/70 bg-muted/20 shadow-[var(--shadow-xs)]">
      <CardHeader className="pb-2.5 pt-3.5 px-4 flex flex-row items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          {icon} {title}
        </span>
        <Link href={href} className="text-primary hover:bg-primary/10 -mr-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors">
          {linkLabel} <ArrowRight className="h-3 w-3" />
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
      <span className={`font-semibold text-right truncate ${typeof value === 'number' || /^[+৳\d]/.test(value) ? 'font-mono tabular-nums' : ''} ${accent ?? 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function Summary({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="text-center flex-1">
      <div className="text-xs tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm font-bold font-mono ${accent ? 'text-emerald-500' : muted ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

const MOBILE_BANKING = new Set(['bkash', 'nagad', 'rocket']);

function PaymentMethodIcon({ method, className }: { method: string; className?: string }) {
  const key = method.toLowerCase().trim();
  if (MOBILE_BANKING.has(key)) return <Smartphone className={className} />;
  if (key === 'cash') return <Banknote className={className} />;
  if (key === 'bank') return <Landmark className={className} />;
  if (key) return <CreditCard className={className} />;
  return <Receipt className={className} />;
}

function TicketTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Link href="/admin/support" className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-center block no-underline border border-border/40">
      <span className={`text-xs font-medium ${tone}`}>{label}</span>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </Link>
  );
}
