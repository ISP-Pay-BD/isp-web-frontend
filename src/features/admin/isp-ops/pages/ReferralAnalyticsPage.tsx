'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Trophy,
  TrendingUp,
  Users,
  Download,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['referralAnalytics'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.referrer).toLowerCase().includes(q) ||
    String(r.referrals).toLowerCase().includes(q) ||
    String(r.converted).toLowerCase().includes(q) ||
    String(r.rewardBdt).toLowerCase().includes(q)
  );
};

export function ReferralAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [selectedAdvocate, setSelectedAdvocate] = useState<Row | null>(null);
  const [bonusPoints, setBonusPoints] = useState('500');

  const handleExportCSV = () => {
    toast.success('Referral growth analytics exported to CSV');
  };

  const handleGrantBonus = () => {
    if (!selectedAdvocate) return;
    toast.success(`Special bonus reward of ৳${bonusPoints} granted to ${selectedAdvocate.referrer}!`);
    setSelectedAdvocate(null);
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'referrer',
        header: 'Subscriber Advocate',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {String(row.original.referrer).charAt(0)}
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{String(row.original.referrer)}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Advocate ID #{row.index + 101}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'referrals',
        header: 'Invites Sent',
        size: 110,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{String(row.original.referrals)} users</span>
        ),
      },
      {
        accessorKey: 'converted',
        header: 'Active Conversions',
        size: 180,
        cell: ({ row }) => {
          const total = row.original.referrals || 1;
          const conv = row.original.converted;
          const pct = Math.round((conv / total) * 100);
          return (
            <div className="space-y-1 w-full max-w-[140px]">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-500 font-semibold">{conv} active</span>
                <span className="text-muted-foreground font-semibold">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rewardBdt',
        header: 'Total Rewards Paid',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            ৳{Number(row.original.rewardBdt).toLocaleString()} BDT
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:bg-primary/10 gap-1"
            onClick={() => setSelectedAdvocate(row.original)}
          >
            <Sparkles className="h-3 w-3" />
            Bonus
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load analytics" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.referralAnalytics;
  const totalRewards = rows.reduce((s, r) => s + r.rewardBdt, 0);
  const totalInvites = rows.reduce((s, r) => s + r.referrals, 0);
  const totalConverted = rows.reduce((s, r) => s + r.converted, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Growth & Analytics"
        subtitle="Deep-dive subscriber acquisition metrics, conversion funnels, and reward ROI"
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
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Advocates', value: rows.length },
          { label: 'Total Invitations Sent', value: `${totalInvites} Invites` },
          { label: 'Active Subscribers Converted', value: `${totalConverted} Users` },
          { label: 'Overall Conversion Efficiency', value: `${Math.round((totalConverted / (totalInvites || 1)) * 100)}%` },
          { label: 'Total Paid Rewards', value: `৳${totalRewards.toLocaleString()} BDT` },
          { label: 'Viral Coefficient (K-Factor)', value: '1.24 (High Growth)' },
        ]}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Viral Coefficient (K)</CardDescription>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500">1.24x</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Every subscriber refers 1.24 new users</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">Referred User LTV</CardDescription>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">৳14,500</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Estimated 12-month subscriber lifetime value</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">CAC via Referrals</CardDescription>
            <Gift className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-500">৳500 / user</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">70% cheaper than digital ad acquisition</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardDescription className="text-xs">6-Month Retention</CardDescription>
            <Trophy className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-sky-500">94.2%</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Referred subscribers have ultra-low churn</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Advocate Performance & Conversion Funnel
              </CardTitle>
              <CardDescription>
                Detailed breakdown of subscriber referrals and cash rewards earned
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            searchKey="referrer"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search advocates by name or conversion..."
          />
        </CardContent>
      </Card>

      {/* Bonus Modal */}
      <Dialog open={!!selectedAdvocate} onOpenChange={(open) => !open && setSelectedAdvocate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Award Advocate Special Bonus
            </DialogTitle>
            <DialogDescription>
              Credit bonus reward balance directly to {selectedAdvocate?.referrer}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bonus Amount (BDT)</Label>
              <Input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAdvocate(null)}>
              Cancel
            </Button>
            <Button onClick={handleGrantBonus} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Award Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
