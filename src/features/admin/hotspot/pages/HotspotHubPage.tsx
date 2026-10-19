'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotRouter } from '../hooks/useHotspotRouter';
import { useHotspotDashboard } from '../hooks/useHotspotData';
import { HotspotRouterSelect } from '../components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '../components/HotspotStates';
import { HotspotKpi, HotspotKpiRow, HotspotKpiSkeleton } from '../components/HotspotKpi';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Package,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Activity,
  Ticket,
  ShieldCheck,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { useLocale } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useLocale>['t'];

const quickModules = (t: Translate) => [
  {
    href: '/admin/hotspot/dashboard',
    label: t('admin.hotspot.hub.modDashboard', 'Live Dashboard'),
    icon: LayoutDashboard,
    desc: t(
      'admin.hotspot.hub.modDashboardDesc',
      'Active guest sessions, router health and the hotspot log, refreshed every 30 seconds.',
    ),
    badge: t('admin.hotspot.hub.badgeLive', 'Live'),
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20',
  },
  {
    href: '/admin/hotspot/packages',
    label: t('admin.hotspot.hub.modPackages', 'Hotspot Profiles & Packages'),
    icon: Package,
    desc: t(
      'admin.hotspot.hub.modPackagesDesc',
      'User profiles on the router: rate limit, validity, expiry mode and voucher pricing.',
    ),
    badge: t('admin.hotspot.hub.badgeProfiles', 'Profiles'),
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    href: '/admin/hotspot/users',
    label: t('admin.hotspot.kpi.users', 'Hotspot Users'),
    icon: Users,
    desc: t(
      'admin.hotspot.hub.modUsersDesc',
      'Hotspot logins on the router: bound MAC, time limit, traffic and enable/disable.',
    ),
    badge: t('admin.hotspot.hub.badgeAccounts', 'Accounts'),
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    href: '/admin/hotspot/vouchers',
    label: t('admin.hotspot.hub.modVouchers', 'Voucher Codes'),
    icon: Ticket,
    desc: t(
      'admin.hotspot.hub.modVouchersDesc',
      'Generate voucher codes for a profile and track which ones are unused, used or disabled.',
    ),
    badge: t('admin.hotspot.hub.badgeVouchers', 'Vouchers'),
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    href: '/admin/hotspot/walled-garden',
    label: t('admin.hotspot.hub.modWalled', 'Walled Garden Rules'),
    icon: ShieldCheck,
    desc: t(
      'admin.hotspot.hub.modWalledDesc',
      'Hosts guests can reach before logging in, such as payment gateways and your portal.',
    ),
    badge: t('admin.hotspot.hub.badgePreLogin', 'Pre-login'),
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    href: '/admin/hotspot/reports',
    label: t('admin.hotspot.hub.modReports', 'Voucher Sales Report'),
    icon: BarChart3,
    desc: t(
      'admin.hotspot.hub.modReportsDesc',
      'Voucher sales recorded on the router, by date range, with totals and CSV export.',
    ),
    badge: t('admin.hotspot.hub.badgeSales', 'Sales'),
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
  },
] as const;

export function HotspotHubPage() {
  const { t } = useLocale();
  const hs = useHotspotRouter();
  const dashboard = useHotspotDashboard(hs.routerId);
  const d = dashboard.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.hotspot.hub.title', 'Hotspot & Captive Portal Hub')}
        subtitle={t(
          'admin.hotspot.hub.subtitle',
          'Manage MikroTik hotspot profiles, users, voucher codes, walled garden and sales.',
        )}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.hotspot', 'Hotspot'), href: '/admin/hotspot' },
          { label: t('admin.hotspot.hub.crumb', 'Hub') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            <Button variant="outline" size="sm" className="h-9" render={<Link href="/admin/hotspot/vouchers" />}>
                <Ticket className="mr-2 h-4 w-4" />
                {t('admin.hotspot.hub.generateVouchers', 'Generate Vouchers')}
              </Button>
            <Button size="sm" className="h-9" render={<Link href="/admin/hotspot/packages" />}>
                <Package className="mr-2 h-4 w-4" />
                {t('admin.hotspot.hub.newPackage', 'New Package')}
              </Button>
          </div>
        }
      />

      {/* KPI ribbon — live counters of the selected router */}
      <HotspotRouterGate state={hs} skeleton={<HotspotKpiSkeleton />}>
        {dashboard.isLoading ? (
          <HotspotKpiSkeleton />
        ) : dashboard.isError ? (
          <HotspotQueryError
            error={dashboard.error}
            routerName={hs.router?.name}
            title={t('admin.hotspot.hub.loadFailed', 'Failed to load hotspot overview')}
            onRetry={() => void dashboard.refetch()}
          />
        ) : d ? (
          <HotspotKpiRow>
            <HotspotKpi
              label={t('admin.hotspot.kpi.liveSessions', 'Live Sessions')}
              value={d.activeSessions}
              hint={t('admin.hotspot.kpi.liveSessionsHint', 'Guests online now')}
              icon={<Activity className="h-4 w-4 text-emerald-500" />}
              positive
            />
            <HotspotKpi
              label={t('admin.hotspot.kpi.users', 'Hotspot Users')}
              value={d.totalUsers}
              hint={t('admin.hotspot.kpi.usersHint', 'Accounts & vouchers on the router')}
              icon={<Users className="h-4 w-4 text-sky-500" />}
            />
            <HotspotKpi
              label={t('admin.hotspot.kpi.salesToday', 'Sales Today')}
              value={formatBdtWithSymbol(d.incomeToday)}
              hint={t('admin.hotspot.kpi.salesHint', 'Recorded voucher sales')}
              icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
            />
            <HotspotKpi
              label={t('admin.hotspot.kpi.salesMonth', 'Sales This Month')}
              value={formatBdtWithSymbol(d.incomeMonth)}
              hint={t('admin.hotspot.kpi.salesHint', 'Recorded voucher sales')}
              icon={<CalendarDays className="h-4 w-4 text-primary" />}
            />
          </HotspotKpiRow>
        ) : null}
      </HotspotRouterGate>

      {/* Module Navigation Cards */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {t('admin.hotspot.hub.controlCenter', 'Hotspot Control Center')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickModules(t).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="h-full border-border/60 bg-card/60 backdrop-blur-sm transition duration-200 hover:border-primary/40 hover:bg-card/90 hover:shadow-md group">
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
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-primary" />
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
