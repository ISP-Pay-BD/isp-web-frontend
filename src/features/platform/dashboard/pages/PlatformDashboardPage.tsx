'use client';

import type { SVGProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import {
  Globe,
  Users,
  TrendingUp,
  Ticket,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  FolderTree,
  Puzzle,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatBdt } from '@/lib/format';
import { PlatformPageHeader } from '@/features/platform/shared';
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

export function PlatformDashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: () => mockFetch('platform.dashboard'),
  });

  if (isLoading) {
    return <PageSkeleton rows={5} />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load platform dashboard"
        description="Could not connect to the platform data service."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Platform Overview"
        subtitle="Super-admin control center — tenant telemetry, revenue analytics, and system status"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/platform/tenants/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-1.5 h-4 w-4" /> Create Tenant Portal
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenant Portals"
          value={data.totalTenants}
          description={`${data.activeTenants} active · ${data.trialTenants} on trial`}
          icon={Globe}
          trend={{ value: '+14% MoM growth', positive: true }}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={`৳${formatBdt(data.mrrBdt)}`}
          description="Billed platform SaaS subscriptions"
          icon={TrendingUp}
          trend={{ value: `ARR: ৳${formatBdt(data.arrBdt)}`, positive: true }}
        />
        <StatCard
          title="Active Tenants"
          value={data.activeTenants}
          description={`${data.suspendedTenants} suspended portals`}
          icon={ShieldCheck}
          trend={{ value: `${Math.round((data.activeTenants / Math.max(1, data.totalTenants)) * 100)}% operational`, positive: true }}
        />
        <StatCard
          title="Open Platform Tickets"
          value={data.openTickets}
          description="Tenant inquiries awaiting support"
          icon={Ticket}
          trend={{ value: 'Response SLA: <2 hours', positive: true }}
        />
      </div>

      {/* Charts & Operational Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="border-border/60 lg:col-span-4 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Platform Revenue Trend</CardTitle>
                <CardDescription>Monthly BDT volume over the last 6 months</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                +{data.growthPercentage}% growth
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientPlatformRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f75803" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#f75803" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#f75803" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientPlatformRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f75803" />
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
                    tickFormatter={(v) => `৳${(v / 1000000).toFixed(1)}M`}
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
            <CardTitle className="text-base font-semibold">Super-Admin Operations</CardTitle>
            <CardDescription>Quick administrative actions & system monitoring</CardDescription>
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
                  <div className="text-sm font-medium">Manage Tenant Portals</div>
                  <div className="text-xs text-muted-foreground">Subdomains, branding & status</div>
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
                  <div className="text-sm font-medium">Second Admins & Packages</div>
                  <div className="text-xs text-muted-foreground">Tenant owners, pricing tiers</div>
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
                  <div className="text-sm font-medium">Plugins & Addons Marketplace</div>
                  <div className="text-xs text-muted-foreground">OLT, bKash Plus, WhatsApp Business</div>
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
                  <div className="text-sm font-medium">Platform File Manager</div>
                  <div className="text-xs text-muted-foreground">Tenant logos, documents & assets</div>
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
                  <div className="text-sm font-medium">Software Settings</div>
                  <div className="text-xs text-muted-foreground">Base domain, discounts & auth</div>
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
              <CardTitle className="text-base font-semibold">Top Tenants by Subscribers</CardTitle>
              <CardDescription>Highest subscriber volume networks</CardDescription>
            </div>
            <Link href="/platform/tenants">
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topTenants.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-md flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: t.primaryColor || '#f75803' }}
                    >
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/platform/tenants/${t.id}`} className="font-semibold text-sm hover:underline">
                        {t.name}
                      </Link>
                      <div className="text-xs text-muted-foreground font-mono">{t.slug}.isppaybd.com</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-foreground">{t.customers.toLocaleString()} subs</div>
                    <Badge
                      variant="outline"
                      className={
                        t.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs'
                          : t.status === 'trial'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs'
                          : 'border-red-500/30 text-red-600 bg-red-500/10 text-xs'
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inbound Leads / Inquiries */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Inbound Contact Requests</CardTitle>
              <CardDescription>Potential ISPs seeking platform onboarding</CardDescription>
            </div>
            <Link href="/platform/contacts">
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.company} · <span className="font-mono">{c.phone}</span>
                    </div>
                    {c.message ? (
                      <div className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5 max-w-sm">
                        &ldquo;{c.message}&rdquo;
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {c.status}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-1">{c.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
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
