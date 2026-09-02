'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatBdt } from '@/lib/format';
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

const COLORS = ['#f75803', '#2563eb', '#16a34a', '#9333ea'];

export function RevenuePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'revenue'],
    queryFn: () => mockFetch('platform.revenue'),
  });

  if (isLoading) return <PageSkeleton rows={5} />;
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
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Monthly BDT volume (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis
                    tickFormatter={(v) => `৳${(v / 1000000).toFixed(1)}M`}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <Tooltip formatter={(val) => [`৳${formatBdt(Number(val))}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#f75803" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <CardDescription>Revenue by gateway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.methodBreakdown}
                    dataKey="amountBdt"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {data.methodBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `৳${formatBdt(Number(val))}`} />
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="py-2 text-left">Plan</th>
                  <th className="py-2 text-right">Tenants</th>
                  <th className="py-2 text-right">MRR (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.tierBreakdown.map((t) => (
                  <tr key={t.plan}>
                    <td className="py-2 font-medium">{t.plan}</td>
                    <td className="py-2 text-right">{t.tenants}</td>
                    <td className="py-2 text-right font-semibold">৳{formatBdt(t.mrrBdt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
