'use client';

/**
 * Recharts-based dashboard charts. Imported only through next/dynamic from
 * AdminDashboardPage so recharts stays out of the initial bundle.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/shared/charts/ChartTooltip';
import type { AdminDashboardResult } from '@/lib/api/adapters/admin.adapter';

const bdt = (val: number) => `৳${val.toLocaleString()}`;
const compactK = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v));

export function CollectionsTrendChart({ data }: { data: AdminDashboardResult['monthlyTrend'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={compactK} tick={{ fill: 'hsl(var(--muted-foreground))' }} dx={-5} />
        <Tooltip content={<ChartTooltip formatter={(val: number) => bdt(val)} />} cursor={{ fill: 'rgba(56, 189, 248, 0.06)' }} />
        <Bar dataKey="collected" name="Collected" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={28} animationDuration={900} />
        <Line type="monotone" dataKey="pending" name="Pending" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function WeeklyCollectionsChart({ data }: { data: AdminDashboardResult['weeklyCollections'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f75803" stopOpacity={1} />
            <stop offset="100%" stopColor="#c44103" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={5} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `৳${compactK(v)}`} tick={{ fill: 'hsl(var(--muted-foreground))' }} dx={-5} />
        <Tooltip content={<ChartTooltip formatter={(val: number) => bdt(val)} />} cursor={{ fill: 'rgba(247, 88, 3, 0.08)' }} />
        <Bar dataKey="amount" name="Collected" fill="url(#gradientBar)" radius={[6, 6, 0, 0]} animationDuration={900} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PackageDonutChart({ data }: { data: AdminDashboardResult['packageDistribution'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="count" nameKey="name">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={(val: number) => `${val} customers`} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
