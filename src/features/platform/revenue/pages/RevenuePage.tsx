'use client';

import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
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
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import { DataTable } from '@/features/shared/data-table';
import { formatBdt } from '@/lib/format';

const COLORS = ['#f75803', '#2563eb', '#16a34a', '#9333ea'];

type TierRow = { plan: string; tenants: number; mrrBdt: number };

const tierColumns: LegacyColumnDef<TierRow, unknown>[] = [
  {
    accessorKey: 'plan',
    header: 'Plan',
    size: 160,
    enableHiding: false,
    cell: ({ row }) => <span className="font-medium">{row.original.plan}</span>,
  },
  {
    accessorKey: 'tenants',
    header: 'Tenants',
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
    queryFn: () => mockFetch('platform.revenue'),
  });

  if (isLoading) return <PageSkeleton variant="dashboard" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load revenue"
        description="Could not retrieve platform revenue analytics."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Platform Revenue"
        subtitle="SaaS subscription MRR, payment method breakdown, and tier analytics"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`৳${formatBdt(data.mrrBdt)}`}
          icon={TrendingUp}
          trend={{ value: `+${data.growthPercentage}% MoM`, positive: true }}
        />
        <StatCard title="Annual Run Rate" value={`৳${formatBdt(data.arrBdt)}`} icon={DollarSign} />
        <StatCard title="Active Tenants" value={data.activeTenants} icon={Users} />
        <StatCard
          title="Avg Revenue / Tenant"
          value={`৳${formatBdt(data.averageRevenuePerTenant)}`}
          description="Per month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Monthly BDT volume (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRevenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f75803" stopOpacity={1} />
                      <stop offset="100%" stopColor="#c44103" stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="revenueBarShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f75803" floodOpacity="0.3" />
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
            <CardDescription>Revenue by gateway</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <Cell key={i} fill={`url(#pieGradient${i})`} stroke="hsl(var(--background))" strokeWidth={2} />
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
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Revenue by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tierColumns}
            data={data.tierBreakdown}
            getRowId={(row) => row.plan}
            searchKey="plan"
            searchPlaceholder="Filter plan..."
            emptyTitle="No tier data"
            emptyDescription="Revenue tier breakdown is unavailable."
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
