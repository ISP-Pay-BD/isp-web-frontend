'use client';

import Link from 'next/link';
import {
  ArrowRight,
  UserPlus,
  Receipt,
  Wifi,
  AlertTriangle,
  Ticket,
  Clock,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';

function formatBdt(value: number) {
  return `৳${value.toLocaleString('en-BD')}`;
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (isError || !stats) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="Could not load operations data. Retry to continue."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const attention = [
    {
      href: '/admin/customers?status=expired',
      icon: Clock,
      label: 'Payment due',
      value: formatBdt(stats.customersExpaymentTotal ?? 54000),
      meta: `${stats.customersExpaymentCount ?? 45} subscribers`,
    },
    {
      href: '/admin/customers?status=expired',
      icon: AlertTriangle,
      label: 'Expired service',
      value: String(stats.expiredCustomers),
      meta: 'Need reconnect or collect',
    },
    {
      href: '/admin/support',
      icon: Ticket,
      label: 'Open tickets',
      value: String(stats.pendingTickets),
      meta: `${stats.ticketStats?.solvedRate ?? 94}% solved rate`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="What needs action"
        subtitle="Collections, expiry, and tickets for today’s shift."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" render={<Link href="/admin/customers/new" />}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add customer
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/admin/customer-payments/new" />}>
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              Record payment
            </Button>
          </div>
        }
      />

      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 id="attention-heading" className="text-sm font-semibold text-foreground">
            Needs attention
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{formatBdt(stats.monthlyCollectionBdt)}</span>
            {' '}collected ·{' '}
            <span className="font-medium text-foreground">{stats.onlineUsers}</span> online ·{' '}
            <span className="font-medium text-foreground">{stats.routerActive ?? 6}</span> routers
          </p>
        </div>

        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
          {attention.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.meta}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">{item.value}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-labelledby="collections-heading" className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="collections-heading" className="text-sm font-semibold text-foreground">
              Collections vs target
            </h2>
            <Badge variant="secondary" className="font-mono text-[10px]">
              Jan–Sep
            </Badge>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="mb-4 flex items-baseline gap-2">
              <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {formatBdt(stats.monthlyCollectionBdt)}
              </p>
              <p className="text-xs text-muted-foreground">this month</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrend}>
                  <defs>
                    <linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v) => formatBdt(Number(v))} />} />
                  <Area
                    type="monotone"
                    dataKey="collection"
                    stroke="var(--primary)"
                    fill="url(#collectionFill)"
                    strokeWidth={2}
                    name="Collected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section aria-labelledby="sessions-heading" className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="sessions-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wifi className="h-4 w-4 text-muted-foreground" aria-hidden />
              Live POP sessions
            </h2>
            <Link href="/admin/routers" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
            {(stats.routers ?? []).map((router) => (
              <li key={router.id}>
                <Link
                  href="/admin/routers"
                  className="block px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{router.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{router.host}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] text-emerald-700 dark:text-emerald-400">
                      Online
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
                    <span>
                      Online{' '}
                      <span className="font-medium text-foreground">
                        <NumberFlow value={router.activeUsers} />
                      </span>
                    </span>
                    <span>
                      Total{' '}
                      <span className="font-medium text-foreground">
                        <NumberFlow value={router.totalUsers} />
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
