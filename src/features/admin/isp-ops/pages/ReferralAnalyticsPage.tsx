'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { ChartCard } from '@/components/shared/ChartCard';
import { DataTable } from '@/features/shared/data-table';
import { Trophy, TrendingUp, Download, Gift, Coins, Wallet } from 'lucide-react';
import { useRewardsReport } from '@/features/admin/rewards/hooks/use-rewards';
import type { TopReferrer } from '@/features/admin/rewards/types';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y && m ? new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : ym;
};

export function ReferralAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useRewardsReport();

  const columns = useMemo<LegacyColumnDef<TopReferrer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Subscriber Advocate',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {(row.original.name || '?').charAt(0)}
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.name || '—'}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Customer ID #{row.original.id}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'totalReferrals',
        header: 'Referrals',
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.totalReferrals} leads</span>,
      },
      {
        accessorKey: 'verified',
        header: 'Verified Conversions',
        size: 180,
        cell: ({ row }) => {
          const rate = pct(row.original.verified, row.original.totalReferrals);
          return (
            <div className="space-y-1 w-full max-w-[140px]">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-500 font-semibold">{row.original.verified} verified</span>
                <span className="text-muted-foreground font-semibold">{rate}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'points',
        header: 'Referral Points Earned',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">{row.original.points.toLocaleString()} pts</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load analytics"
        description={error?.message}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { referrals, rewards, topReferrers, monthly } = data;
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.total));
  const funnel = [
    { label: 'Referred leads', value: referrals.total, bar: 'bg-primary' },
    { label: 'Pending review', value: referrals.pending, bar: 'bg-amber-500' },
    { label: 'Verified & activated', value: referrals.verified, bar: 'bg-emerald-500' },
    { label: 'Rejected', value: referrals.rejected, bar: 'bg-destructive' },
  ];

  const handleExportCsv = () =>
    downloadCsv(
      `referral_analytics_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Referrer ID', 'Referrer', 'Referrals', 'Verified', 'Points Earned'],
      topReferrers.map((r) => [r.id, r.name, r.totalReferrals, r.verified, r.points]),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Growth & Analytics"
        subtitle="Subscriber acquisition through referrals: conversion funnel, monthly trend and reward cost"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Referral Analytics' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleExportCsv}
            disabled={topReferrers.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Referrals', value: referrals.total },
          { label: 'Verified', value: referrals.verified },
          { label: 'Pending', value: referrals.pending },
          { label: 'Rejected', value: referrals.rejected },
          { label: 'Conversion', value: `${referrals.conversionRate}%` },
          { label: 'Reward Cost', value: `৳${rewards.rewardCostBdt.toLocaleString()} BDT` },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Conversion Rate</CardDescription>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500">{referrals.conversionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Verified out of all referred leads</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Points Issued</CardDescription>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{rewards.pointsIssued.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">All reward points credited to customers</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Points Redeemed</CardDescription>
            <Gift className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-500">{rewards.pointsRedeemed.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pct(rewards.pointsRedeemed, rewards.pointsIssued)}% of issued points spent on bills
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Reward Cost</CardDescription>
            <Wallet className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-sky-500">৳{rewards.rewardCostBdt.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Redeemed points × ৳{rewards.pointValueBdt.toFixed(2)} per point
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Referral Status Funnel" description="Every referral by its current verification state">
          <div className="space-y-3 pt-2">
            {funnel.map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{step.label}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {step.value} <span className="text-muted-foreground">({pct(step.value, referrals.total)}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${step.bar}`} style={{ width: `${pct(step.value, referrals.total)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Monthly Referrals" description="Last 12 months by registration date (verified highlighted)">
          {monthly.every((m) => m.total === 0) ? (
            <p className="py-10 text-center text-xs text-muted-foreground">No referrals in the last 12 months</p>
          ) : (
            <div className="flex h-44 items-end gap-1.5 pt-4" role="img" aria-label="Monthly referrals bar chart">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${m.total} referrals, ${m.verified} verified`}>
                  <span className="text-[9px] font-mono text-muted-foreground">{m.total || ''}</span>
                  <div className="relative w-full rounded-t bg-primary/20" style={{ height: `${(m.total / maxMonthly) * 120}px` }}>
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t bg-emerald-500"
                      style={{ height: `${pct(m.verified, m.total)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Top Advocates
          </CardTitle>
          <CardDescription>The ten referrers with the most verified conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={topReferrers}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search advocates by name..."
            emptyTitle="No referrers yet"
          />
        </CardContent>
      </Card>
    </div>
  );
}
