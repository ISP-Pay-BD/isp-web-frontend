'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Gift, Trophy, Sliders, CheckCircle2, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';
import {
  useApproveReferral,
  useReferrals,
  useRejectReferral,
  useRewardsConfig,
  useRewardsReport,
  useSaveRewardsConfig,
} from '../hooks/use-rewards';
import { REFERRAL_STATUSES, type ReferralRow, type ReferralStatus, type TopReferrer } from '../types';
import { GrantPointsDialog } from '../components/GrantPointsDialog';

const statusBadge: Record<ReferralStatus, { variant: 'default' | 'destructive' | 'secondary'; className: string }> = {
  verified: { variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-600 text-white' },
  rejected: { variant: 'destructive', className: '' },
  pending: { variant: 'secondary', className: '' },
  flagged: { variant: 'secondary', className: 'text-amber-600 dark:text-amber-400' },
};

export function RewardsPage() {
  const configQuery = useRewardsConfig();
  const reportQuery = useRewardsReport();
  const saveConfig = useSaveRewardsConfig();
  const { mutate: approve, isPending: approving } = useApproveReferral();
  const { mutate: reject, isPending: rejecting } = useRejectReferral();
  const [grantOpen, setGrantOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReferralStatus | ''>('');
  const referralsQuery = useReferrals({ page, pageSize, search, status });

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [draft, setDraft] = useState({ pointsPerReferral: '', maxRedeemPercent: '', pointValueBdt: '' });

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const config = configQuery.data;
  const report = reportQuery.data;

  const openConfig = () => {
    if (!config) return;
    setDraft({
      pointsPerReferral: String(config.pointsPerReferral),
      maxRedeemPercent: String(config.maxRedeemPercent),
      pointValueBdt: String(config.pointValueBdt),
    });
    setConfigModalOpen(true);
  };

  const handleSaveConfig = () => {
    saveConfig.mutate(
      {
        referral_points: Number(draft.pointsPerReferral),
        max_redeem_percent: Number(draft.maxRedeemPercent),
        point_value_bdt: Number(draft.pointValueBdt),
      },
      {
        onSuccess: () => {
          setConfigModalOpen(false);
          toast.success('Referral program rules saved');
        },
      },
    );
  };

  const handleToggleProgram = (enabled: boolean) => {
    saveConfig.mutate(
      { referral_enabled: enabled ? 1 : 0 },
      { onSuccess: () => toast.success(`Referral rewards ${enabled ? 'activated' : 'paused'}`) },
    );
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
                <span className="font-semibold text-xs text-foreground block">{row.original.name || '—'}</span>
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
        cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.totalReferrals}</span>,
      },
      {
        accessorKey: 'verified',
        header: 'Converted',
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-emerald-500 border-emerald-300 font-mono text-[11px]">
            {row.original.verified} verified
          </Badge>
        ),
      },
      {
        accessorKey: 'points',
        header: 'Points Earned',
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">{row.original.points.toLocaleString()} pts</span>
        ),
      },
    ],
    [],
  );

  const txColumns = useMemo<LegacyColumnDef<ReferralRow, unknown>[]>(
    () => [
      {
        accessorKey: 'referrerName',
        header: 'Referrer (Advocate)',
        size: 160,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.referrerName || '—'}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.packageName || 'No package selected'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'refereeName',
        header: 'New Subscriber (Referee)',
        size: 160,
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-medium text-foreground block">{row.original.refereeName || '—'}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{row.original.refereeMobile}</span>
          </div>
        ),
      },
      {
        accessorKey: 'pointsAwarded',
        header: 'Reward Points',
        size: 110,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs font-semibold text-primary">
            +{row.original.pointsAwarded} pts
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Verification Status',
        size: 130,
        cell: ({ row }) => {
          const s = row.original.status;
          const style = statusBadge[s];
          return (
            <Badge variant={style.variant} className={`text-[10px] font-mono capitalize gap-1 ${style.className}`}>
              {s === 'verified' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : s === 'rejected' ? (
                <XCircle className="h-3 w-3" />
              ) : s === 'flagged' ? (
                <AlertTriangle className="h-3 w-3" />
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
          const s = row.original.status;
          if (s !== 'pending' && s !== 'flagged') return null;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-500 hover:bg-emerald-50/10"
                disabled={approving}
                onClick={() => approve(row.original.id)}
                title="Approve & Grant Points"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                disabled={rejecting}
                onClick={() => reject({ referralId: row.original.id, reason: 'Rejected from rewards console' })}
                title="Reject Referral"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [approve, approving, reject, rejecting],
  );

  if (configQuery.isLoading || reportQuery.isLoading) return <PageSkeleton variant="table" />;
  if (configQuery.isError || reportQuery.isError || !config || !report) {
    return (
      <EmptyState
        title="Failed to load rewards"
        description={(configQuery.error ?? reportQuery.error)?.message ?? 'Could not fetch the referral program.'}
        actionLabel="Retry"
        onAction={() => {
          configQuery.refetch();
          reportQuery.refetch();
        }}
      />
    );
  }

  const draftRatio = Number(draft.pointValueBdt) || 0;
  const draftPoints = Number(draft.pointsPerReferral) || 0;

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
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setGrantOpen(true)}>
              <Gift className="h-3.5 w-3.5 text-primary" />
              Grant points
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={openConfig}>
              <Sliders className="h-3.5 w-3.5 text-primary" />
              Program Rules
            </Button>
          </div>
        }
      />
      <GrantPointsDialog open={grantOpen} onOpenChange={setGrantOpen} />

      <OpsSummaryStrip
        items={[
          { label: 'Program Status', value: config.referralEnabled ? 'ACTIVE & REWARDING' : 'PAUSED' },
          { label: 'Reward per Referral', value: `${config.pointsPerReferral} Loyalty Points` },
          { label: 'Max. Redeem per Bill', value: `${config.maxRedeemPercent}%` },
          { label: 'Point Conversion', value: `1 pt = ৳${config.pointValueBdt.toFixed(2)} BDT` },
          { label: 'Total Points Issued', value: `${report.rewards.pointsIssued.toLocaleString()} pts` },
        ]}
      />

      {/* Program Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Points per Referral</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary font-mono mt-0.5">
                {config.pointsPerReferral} pts
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Credited to the referrer when the referral is approved
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Max Redeem per Bill</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground font-mono mt-0.5">
                {config.maxRedeemPercent}%
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Points can pay up to this share of a bill ·{' '}
            <span className="font-semibold text-foreground font-mono">
              {report.rewards.pointsRedeemed.toLocaleString()} pts
            </span>{' '}
            redeemed so far
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">Referral Program Switch</CardDescription>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={config.referralEnabled ? 'default' : 'secondary'}
                  className={config.referralEnabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-xs' : 'font-mono text-xs'}
                >
                  {config.referralEnabled ? 'Live & Accepting' : 'Paused'}
                </Badge>
              </div>
            </div>
            <Can menu="reward" action="update">
              <Switch
                checked={config.referralEnabled}
                disabled={saveConfig.isPending}
                onCheckedChange={handleToggleProgram}
              />
            </Can>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground pt-0">
            Approved referrals {config.referralEnabled ? 'earn points for the referrer' : 'are activated without awarding points'}
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Top Advocates & Referral Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Subscriber Advocates
            </CardTitle>
            <CardDescription>Subscribers generating the most verified referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={referrerColumns}
              data={report.topReferrers}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search advocate..."
              emptyTitle="No referrers yet"
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Referral Reward Transactions
            </CardTitle>
            <CardDescription>Audit log of awarded and pending referral points</CardDescription>
          </CardHeader>
          <CardContent>
            {referralsQuery.isError ? (
              <EmptyState
                title="Failed to load referrals"
                description={referralsQuery.error?.message}
                actionLabel="Retry"
                onAction={() => referralsQuery.refetch()}
              />
            ) : (
              <DataTable
                columns={txColumns}
                data={referralsQuery.data?.items ?? []}
                isLoading={referralsQuery.isLoading}
                getRowId={(row) => row.id}
                searchPlaceholder="Search referee, mobile, code or referrer..."
                emptyTitle={search || status ? 'No referrals match your filters' : 'No referrals yet'}
                enableColumnVisibility={false}
                server={{
                  page,
                  pageSize,
                  total: referralsQuery.data?.meta.total ?? 0,
                  onPageChange: setPage,
                  onPageSizeChange: (size) => {
                    setPageSize(size);
                    setPage(1);
                  },
                  search,
                  onSearchChange,
                }}
                toolbarActions={
                  <Select
                    value={status || 'all'}
                    onValueChange={(v) => {
                      setStatus(v && v !== 'all' ? (v as ReferralStatus) : '');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[140px] text-xs capitalize">
                      <SelectValue>{(v: string | null) => (v && v !== 'all' ? v : 'All statuses')}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {REFERRAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
            )}
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
            <DialogDescription>Adjust point rewards and redemption discount values.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Points per Successful Referral</Label>
              <Input
                type="number"
                min={0}
                value={draft.pointsPerReferral}
                onChange={(e) => setDraft({ ...draft, pointsPerReferral: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Max Share of a Bill Payable with Points (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={draft.maxRedeemPercent}
                onChange={(e) => setDraft({ ...draft, maxRedeemPercent: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Point to BDT Ratio (1 Pt = BDT)</Label>
              <Input
                type="number"
                min={0}
                step="0.05"
                value={draft.pointValueBdt}
                onChange={(e) => setDraft({ ...draft, pointValueBdt: e.target.value })}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                One referral ({draftPoints} pts) = ৳{(draftPoints * draftRatio).toFixed(2)} BDT bill credit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={saveConfig.isPending}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Rules
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
