'use client';

import type { SVGProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Users,
  Plus,
  ArrowUpRight,
  FolderTree,
  Puzzle,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatBdt, formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { PlatformPageHeader, compactBdt, platformDate } from '@/features/platform/shared';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';

import { platformService } from '@/lib/api/services/platform.service';

export function PlatformDashboardPage() {
  const t = useTranslations();
  const contactStatus: Record<string, string> = {
    new: t('status.new', 'New'),
    contacted: t('platform.dashboard.page.contacted', 'Contacted'),
    qualified: t('platform.dashboard.page.qualified', 'Qualified'),
    won: t('platform.dashboard.page.won', 'Won'),
    lost: t('platform.dashboard.page.lost', 'Lost'),
  };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: () => platformService.getDashboard(),
  });

  if (isLoading) {
    return <PageSkeleton variant="dashboard" rows={5} />;
  }

  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.dashboard.page.loadFailed', 'Failed to load platform dashboard')}
        description={t('platform.dashboard.page.loadFailedHint', 'Could not connect to the platform data service.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.dashboard.page.title', 'Platform overview')}
        subtitle={t('platform.dashboard.page.subtitle', 'Tenant health, revenue, and support across the network')}
        actions={
          <div className="flex items-center gap-2">
            <Button render={<Link href="/platform/tenants/new" />}>
                <Plus className="mr-1.5 h-4 w-4" /> {t('platform.dashboard.page.createTenant', 'Create tenant')}
              </Button>
          </div>
        }
      />

      {/* KPI summary */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{data.totalTenants}</span>{' '}
          <span className="text-muted-foreground">{t('platform.dashboard.page.kpiTenants', 'ISP tenants')}</span>
          <span className="text-muted-foreground">
            {' '}
            · {t('platform.dashboard.page.tenantBreakdown', '{active} active · {trial} trial · {suspended} suspended', { active: data.activeTenants, trial: data.trialTenants, suspended: data.suspendedTenants })}
          </span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{data.portalsTotal}</span>{' '}
          <span className="text-muted-foreground">{t('platform.dashboard.page.kpiPortals', 'subdomain portals')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">৳{formatBdt(data.monthRevenue)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.dashboard.page.kpiMonth', 'collected this month')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{data.openTickets}</span>{' '}
          <span className="text-muted-foreground">{t('platform.dashboard.page.kpiTickets', 'open tenant tickets')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatCount(data.totalActiveEndUsers)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.dashboard.page.kpiSubscribers', 'active subscribers')}</span>
        </p>
      </div>

      {/* Charts & Operational Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="border-border/60 lg:col-span-4 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t('platform.dashboard.page.trend', 'Revenue trend')}</CardTitle>
                <CardDescription>{t('platform.dashboard.page.trendHint', 'Tenant payments collected per month (last 6 months)')}</CardDescription>
              </div>
              {data.growthPercentage !== null ? (
                <Badge
                  variant="outline"
                  tone={data.growthPercentage >= 0 ? 'success' : 'danger'}
                >
                  {data.growthPercentage >= 0 ? '+' : ''}
                  {t('platform.dashboard.page.vsLastMonth', '{pct}% vs last month', { pct: data.growthPercentage })}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientPlatformRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e85a1a" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#e85a1a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#e85a1a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientPlatformRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e85a1a" />
                      <stop offset="100%" stopColor="#f7a311" />
                    </linearGradient>
                    <filter id="platformGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v: number) => compactBdt(v)}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(val: number) => `৳${formatBdt(val)}`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#gradientPlatformRevenueStroke)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientPlatformRevenue)"
                    filter="url(#platformGlow)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Hub Navigation Cards */}
        <Card className="border-border/60 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('platform.dashboard.page.opsTitle', 'Super-Admin Operations')}</CardTitle>
            <CardDescription>{t('platform.dashboard.page.opsHint', 'Quick administrative actions & system monitoring')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/platform/tenants"
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('platform.dashboard.page.opTenants', 'Manage Tenant Portals')}</div>
                  <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.opTenantsHint', 'Subdomains, branding & status')}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/platform/admins"
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('platform.dashboard.page.opAdmins', 'Second Admins & Packages')}</div>
                  <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.opAdminsHint', 'Tenant owners, pricing tiers')}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/platform/plugins"
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Puzzle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('platform.dashboard.page.opPlugins', 'Plugins & Addons Marketplace')}</div>
                  <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.opPluginsHint', 'Catalog, pricing & publishing')}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/platform/file-manager"
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FolderTree className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('platform.dashboard.page.opFiles', 'Platform File Manager')}</div>
                  <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.opFilesHint', 'Browse uploaded files (read-only)')}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/platform/settings/software"
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t('platform.dashboard.page.opSettings', 'Software Settings')}</div>
                  <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.opSettingsHint', 'Branding, discounts & registration')}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid: Top Tenants & Inbound Leads */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Active Tenants */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('platform.dashboard.page.topTenants', 'Top Tenants by Revenue')}</CardTitle>
              <CardDescription>{t('platform.dashboard.page.topTenantsHint', 'Highest platform payments over the last 6 months')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/platform/admins" />}>
                {t('common.viewAll', 'View all')} <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
          </CardHeader>
          <CardContent>
            {data.topTenants.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('platform.dashboard.page.noTenantPayments', 'No tenant payments in the last 6 months.')}</p>
            ) : (
              <div className="space-y-3">
                {data.topTenants.map((tenant) => (
                  <div
                    key={tenant.adminId}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs"
                        style={tenant.primaryColor ? { backgroundColor: tenant.primaryColor } : undefined}
                      >
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={tenant.tenantId ? `/platform/tenants/${tenant.tenantId}` : `/platform/admins/${tenant.adminId}/billing`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {tenant.name}
                        </Link>
                        <div className="text-xs text-muted-foreground font-mono">{tenant.domain ?? tenant.ownerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-foreground">৳{formatBdt(tenant.revenueBdt)}</div>
                      <div className="text-xs text-muted-foreground">{t('platform.dashboard.page.subs', '{n} subs', { n: formatCount(tenant.customers) })}</div>
                      <Badge
                        variant="outline"
                        tone={tenant.status === 'active' ? 'success' : tenant.status === 'trial' ? 'warning' : 'danger'}
                      >
                        {t(`status.${tenant.status}`, tenant.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inbound Leads / Inquiries */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('platform.dashboard.page.contacts', 'Recent Inbound Contact Requests')}</CardTitle>
              <CardDescription>{t('platform.dashboard.page.contactsHint', 'Potential ISPs seeking platform onboarding')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/platform/contacts" />}>
                {t('common.viewAll', 'View all')} <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
          </CardHeader>
          <CardContent>
            {data.recentContacts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t('platform.dashboard.page.noContacts', 'No contact requests yet.')}</p>
            ) : (
            <div className="space-y-3">
              {data.recentContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.company ? `${c.company} · ` : ''}
                      <span className="font-mono">{c.phone}</span>
                    </div>
                    {c.message ? (
                      <div className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5 max-w-sm">
                        &ldquo;{c.message}&rdquo;
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {contactStatus[c.status] ?? c.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{platformDate(c.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
