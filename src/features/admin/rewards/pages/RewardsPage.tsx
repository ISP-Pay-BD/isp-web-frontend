'use client';

import { useState, useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  Gift,
  Trophy,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useRewards } from '../hooks/use-rewards';
import type { ReferralTransaction, TopReferrer } from '@/data/admin/rewards.data';

const txSearchFilter = (
  row: LegacyRow<ReferralTransaction>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const tx = row.original;
  return (
    tx.referrerName.toLowerCase().includes(q) ||
    tx.refereeName.toLowerCase().includes(q) ||
    tx.packageSubscribed.toLowerCase().includes(q) ||
    tx.status.toLowerCase().includes(q)
  );
};

export function RewardsPage() {
  const { data, isLoading, isError, refetch } = useRewards();
  const [programEnabled, setProgramEnabled] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<TopReferrer | null>(null);
  const [bonusPoints, setBonusPoints] = useState('250');

  // Configuration state
  const [pointsPerReferral, setPointsPerReferral] = useState(100);
  const [minRedeem, setMinRedeem] = useState(500);
  const [ratio, setRatio] = useState(0.5);

  useMemo(() => {
    if (data?.transactions && transactions.length === 0) {
      setTransactions(data.transactions);
    }
    if (data?.config) {
      setPointsPerReferral(data.config.pointsPerReferral);
      setMinRedeem(data.config.minPointsToRedeem);
      setRatio(data.config.pointsToBdtRatio);
    }
  }, [data, transactions.length]);

  const txList = transactions.length > 0 ? transactions : (data?.transactions ?? []);
  const topReferrers = data?.topReferrers ?? [];

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    toast.success(`Transaction ${newStatus === 'approved' ? 'Approved & Points Credited' : 'Rejected'}`);
  };

  const handleSaveConfig = () => {
    toast.success('Referral program configuration updated successfully!');
    setConfigModalOpen(false);
  };

  const handleGrantBonus = () => {
    if (!selectedReferrer) return;
    toast.success(`Bonus of ${bonusPoints} loyalty points granted to ${selectedReferrer.name}!`);
    setBonusModalOpen(false);
  };

  const referrerColumns = useMemo<LegacyColumnDef<TopReferrer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Subscriber Advocate',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => {
          const idx = row.index;
          return (
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                    : idx === 1
                      ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40'
                      : 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                }`}
              >
                #{idx + 1}
              </div>
              <div>
                <span className="font-semibold text-xs text-foreground block">{row.original.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.id}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'totalReferrals',
        header: 'Invited',
        size: 90,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.totalReferrals}</span>
        ),
      },
      {
        accessorKey: 'convertedCount',
        header: 'Converted',
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-emerald-500 border-emerald-300 font-mono text-[11px]">
            {row.original.convertedCount} active
          </Badge>
        ),
      },
      {
        accessorKey: 'totalPoints',
        header: 'Points Earned',
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.totalPoints.toLocaleString()} pts
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 80,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:bg-primary/10 gap-1"
            onClick={() => {
              setSelectedReferrer(row.original);
              setBonusModalOpen(true);
            }}
          >
            <Sparkles className="h-3 w-3" />
            Bonus
          </Button>
        ),
      },
    ],
    [],
  );

  const txColumns = useMemo<LegacyColumnDef<ReferralTransaction, unknown>[]>(
    () => [
      {
        accessorKey: 'referrerName',
        header: 'Referrer (Advocate)',
        size: 160,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.referrerName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.packageSubscribed}</span>
          </div>
        ),
      },
      {
        accessorKey: 'refereeName',
        header: 'New Subscriber (Referee)',
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">{row.original.refereeName}</span>
        ),
      },
      {
        accessorKey: 'pointsEarned',
        header: 'Reward Points',
        size: 110,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs font-semibold text-primary">
            +{row.original.pointsEarned} pts
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Verification Status',
        size: 130,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={
                s === 'approved'
                  ? 'default'
                  : s === 'rejected'
                    ? 'destructive'
                    : 'secondary'
              }
              className={`text-[10px] font-mono capitalize gap-1 ${
                s === 'approved' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {s === 'approved' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : s === 'rejected' ? (
                <XCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {s}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 110,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const isPending = row.original.status === 'pending';
          if (!isPending) return null;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-500 hover:bg-emerald-50/10"
                onClick={() => handleUpdateStatus(row.original.id, 'approved')}
                title="Approve & Grant Points"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => handleUpdateStatus(row.original.id, 'rejected')}
                title="Reject Referral"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load rewards"
        description="Could not fetch referral program configuration."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const totalPointsDistributed = txList
    .filter((t) => t.status === 'approved')
    .reduce((sum, t) => sum + t.pointsEarned, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral & Reward Center"
        subtitle="Manage subscriber loyalty incentives, point-to-bill conversion policies, and referral transactions"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Rewards' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setConfigModalOpen(true)}
            >
              <Sliders className="h-3.5 w-3.5 text-primary" />
              Program Rules
            </Button>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Program Status', value: programEnabled ? 'ACTIVE & REWARDING' : 'PAUSED' },
          { label: 'Reward per Referral', value: `${pointsPerReferral} Loyalty Points` },
          { label: 'Min. Redeem Threshold', value: `${minRedeem} Points` },
          { label: 'Point Conversion', value: `1 pt = ৳${ratio.toFixed(2)} BDT` },
          { label: 'Total Distributed Points', value: `${totalPointsDistributed.toLocaleString()} pts` },
        ]}
      />

      {/* Program Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Points per Referral</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary font-mono mt-0.5">
                {pointsPerReferral} pts
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Credited to referrer once referee completes 1st invoice payment
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Min Redeem Threshold</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground font-mono mt-0.5">
                {minRedeem} pts
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Equivalent to <span className="font-semibold text-foreground font-mono">৳{(minRedeem * ratio).toFixed(2)} BDT</span> bill discount
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Referral Program Switch</CardDescription>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={programEnabled ? 'default' : 'secondary'}
                  className={programEnabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-xs' : 'font-mono text-xs'}
                >
                  {programEnabled ? 'Live & Accepting' : 'Paused'}
                </Badge>
              </div>
            </div>
            <Can menu="reward" action="update">
              <Switch
                checked={programEnabled}
                onCheckedChange={(v) => {
                  setProgramEnabled(v);
                  toast.success(`Referral rewards program ${v ? 'activated' : 'paused'}`);
                }}
              />
            </Can>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Customer portal referral links will automatically {programEnabled ? 'earn rewards' : 'hold bonuses'}
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Top Advocates & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Leaderboard (5 cols) */}
        <Card className="lg:col-span-5 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Top Subscriber Advocates
                </CardTitle>
                <CardDescription>Subscribers generating highest customer conversions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={referrerColumns}
              data={topReferrers}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search advocate..."
              emptyTitle="No referrers yet"
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        {/* Right Col: Transactions (7 cols) */}
        <Card className="lg:col-span-7 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Referral Reward Transactions
                </CardTitle>
                <CardDescription>Audit log of awarded and pending referral points</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={txColumns}
              data={txList}
              getRowId={(row) => row.id}
              searchKey="referrerName"
              searchPlaceholder="Search referrer or referee..."
              searchFilterFn={txSearchFilter}
              facetFilters={[{ columnId: 'status', title: 'Status' }]}
              emptyTitle="No transactions found"
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Program Config Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Referral Program Rules
            </DialogTitle>
            <DialogDescription>
              Adjust point rewards and redemption discount values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Points per Successful Referral</Label>
              <Input
                type="number"
                value={pointsPerReferral}
                onChange={(e) => setPointsPerReferral(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Minimum Points to Redeem</Label>
              <Input
                type="number"
                value={minRedeem}
                onChange={(e) => setMinRedeem(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Point to BDT Ratio (1 Pt = BDT)</Label>
              <Input
                type="number"
                step="0.05"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Example: 500 points = ৳{(500 * ratio).toFixed(2)} BDT bill credit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Save Rules
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Bonus Modal */}
      <Dialog open={bonusModalOpen} onOpenChange={setBonusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Grant Advocate Bonus Points
            </DialogTitle>
            <DialogDescription>
              Award discretionary loyalty points to {selectedReferrer?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bonus Points Amount</Label>
              <Input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBonusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantBonus} className="gap-1.5 bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
              Credit Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
