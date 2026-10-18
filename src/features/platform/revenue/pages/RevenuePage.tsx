'use client';

import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, compactBdt } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { DataTable } from '@/features/shared/data-table';
import { formatBdt } from '@/lib/format';

const COLORS = ['#e85a1a', '#2563eb', '#16a34a', '#9333ea'];

type TierRow = { plan: string; planType: string | null; tenants: number; mrrBdt: number };

const tierColumns: LegacyColumnDef<TierRow, unknown>[] = [
  {
    accessorKey: 'plan',
    header: 'Plan',
    size: 160,
    enableHiding: false,
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.plan}
        {row.original.planType ? (
          <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">{row.original.planType}</span>
        ) : null}
      </span>
    ),
  },
  {
    accessorKey: 'tenants',
    header: 'Active tenants',
    size: 120,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.tenants}</span>
    ),
  },
  {
    accessorKey: 'mrrBdt',
    header: 'MRR (BDT)',
    size: 160,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">৳{formatBdt(row.original.mrrBdt)}</span>
    ),
  },
];

export function RevenuePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'revenue'],
    queryFn: () => platformService.getPlatformRevenue(),
  });

  if (isLoading) return <PageSkeleton variant="dashboard" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load revenue"
        description={error instanceof Error ? error.message : 'Could not retrieve platform revenue analytics.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Platform Revenue"
        subtitle="Tenant subscription value, collected payments, payment methods and tier analytics"
      />

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{`৳${formatBdt(data.mrrBdt)}`}</span>{' '}
          <span className="text-muted-foreground">monthly recurring (active subscriptions)</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`৳${formatBdt(data.arrBdt)}`}</span>{' '}
          <span className="text-muted-foreground">annual run rate</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{data.activeTenants}</span>{' '}
          <span className="text-muted-foreground">active tenants</span>
          <span className="text-muted-foreground"> · {data.trialTenants} trial · {data.suspendedTenants} suspended</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`৳${formatBdt(data.monthRevenue)}`}</span>{' '}
          <span className="text-muted-foreground">collected this month</span>
          {data.growthPercentage !== null ? (
            <span className={data.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {' '}
              ({data.growthPercentage >= 0 ? '+' : ''}
              {data.growthPercentage}%)
            </span>
          ) : null}
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`৳${formatBdt(data.totalRevenue)}`}</span>{' '}
          <span className="text-muted-foreground">collected all time</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`৳${formatBdt(data.averageRevenuePerTenant)}`}</span>{' '}
          <span className="text-muted-foreground">avg revenue / tenant</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Tenant payments collected per month (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRevenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e85a1a" stopOpacity={1} />
                      <stop offset="100%" stopColor="#c44103" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="revenueBarShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#e85a1a" floodOpacity="0.3" />
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
                      <ChartTooltip formatter={(val: number) => `৳${formatBdt(val)}`} />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#gradientRevenueBar)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <CardDescription>Collected by payment method (last {data.methodWindowMonths} months)</CardDescription>
          </CardHeader>
          <CardContent>
            {data.methodBreakdown.length === 0 ? (
              <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No tenant payments in this window.
              </p>
            ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.methodBreakdown}
                    dataKey="amountBdt"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {data.methodBreakdown.map((_, i) => (
                      <Cell key={i} fill={`url(#pieGradient${i % COLORS.length})`} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltip formatter={(val: number) => `৳${formatBdt(val)}`} />
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Monthly recurring value by package</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tierColumns}
            data={data.tierBreakdown}
            getRowId={(row) => row.plan}
            searchKey="plan"
            searchPlaceholder="Filter plan..."
            emptyTitle="No tier data"
            emptyDescription="No active tenant subscriptions."
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
