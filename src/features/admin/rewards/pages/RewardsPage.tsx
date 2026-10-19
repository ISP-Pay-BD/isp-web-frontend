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

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const statusBadge: Record<ReferralStatus, { variant: 'default' | 'destructive' | 'secondary'; className: string }> = {
  verified: { variant: 'default', className: 'bg-emerald-700 hover:bg-emerald-800 text-white' },
  rejected: { variant: 'destructive', className: '' },
  pending: { variant: 'secondary', className: '' },
  flagged: { variant: 'secondary', className: 'text-amber-600 dark:text-amber-400' },
};

export function RewardsPage() {
  const t = useTranslations();
  const statusLabel = useCallback(
    (s: ReferralStatus) => {
      if (s === 'verified') return t('status.verified', 'Verified');
      if (s === 'rejected') return t('status.rejected', 'Rejected');
      if (s === 'flagged') return t('admin.rewards.status.flagged', 'Flagged');
      return t('status.pending', 'Pending');
    },
    [t],
  );
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
          toast.success(t('admin.rewards.toast.rulesSaved', 'Referral program rules saved'));
        },
      },
    );
  };

  const handleToggleProgram = (enabled: boolean) => {
    saveConfig.mutate(
      { referral_enabled: enabled ? 1 : 0 },
      {
        onSuccess: () =>
          toast.success(
            enabled
              ? t('admin.rewards.toast.activated', 'Referral rewards activated')
              : t('admin.rewards.toast.paused', 'Referral rewards paused'),
          ),
      },
    );
  };

  const referrerColumns = useMemo<LegacyColumnDef<TopReferrer, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.rewards.colAdvocate', 'Subscriber Advocate'),
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
                <span className="text-xs text-muted-foreground font-mono">{t('admin.rewards.idLabel', 'ID: {id}', { id: row.original.id })}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'totalReferrals',
        header: t('admin.rewards.colInvited', 'Invited'),
        size: 90,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.totalReferrals}</span>,
      },
      {
        accessorKey: 'verified',
        header: t('admin.rewards.colConverted', 'Converted'),
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline" tone="success" className="font-mono text-xs">
            {t('admin.rewards.verifiedCount', '{n} verified', { n: row.original.verified })}
          </Badge>
        ),
      },
      {
        accessorKey: 'points',
        header: t('admin.rewards.colEarned', 'Points Earned'),
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">{t('admin.rewards.pts', '{n} pts', { n: formatCount(row.original.points) })}</span>
        ),
      },
    ],
    [t],
  );

  const txColumns = useMemo<LegacyColumnDef<ReferralRow, unknown>[]>(
    () => [
      {
        accessorKey: 'referrerName',
        header: t('admin.rewards.colReferrer', 'Referrer (Advocate)'),
        size: 160,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block">{row.original.referrerName || '—'}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.packageName || t('admin.rewards.noPackage', 'No package selected')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'refereeName',
        header: t('admin.rewards.colReferee', 'New Subscriber (Referee)'),
        size: 160,
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-medium text-foreground block">{row.original.refereeName || '—'}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.refereeMobile}</span>
          </div>
        ),
      },
      {
        accessorKey: 'pointsAwarded',
        header: t('admin.rewards.colReward', 'Reward Points'),
        size: 110,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs font-semibold text-primary">
            {t('admin.rewards.ptsPlus', '+{n} pts', { n: row.original.pointsAwarded })}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.rewards.colVerification', 'Verification Status'),
        size: 130,
        cell: ({ row }) => {
          const s = row.original.status;
          const style = statusBadge[s];
          return (
            <Badge variant={style.variant} className={`text-xs font-mono capitalize gap-1 ${style.className}`}>
              {s === 'verified' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : s === 'rejected' ? (
                <XCircle className="h-3 w-3" />
              ) : s === 'flagged' ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {statusLabel(s)}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
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
                title={t('admin.rewards.approve', 'Approve & Grant Points')}
                aria-label={t('admin.rewards.approve', 'Approve & Grant Points')}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                disabled={rejecting}
                onClick={() => reject({ referralId: row.original.id, reason: 'Rejected from rewards console' })}
                title={t('admin.rewards.reject', 'Reject Referral')}
                aria-label={t('admin.rewards.reject', 'Reject Referral')}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [approve, approving, reject, rejecting, statusLabel, t],
  );

  if (configQuery.isLoading || reportQuery.isLoading) return <PageSkeleton variant="table" />;
  if (configQuery.isError || reportQuery.isError || !config || !report) {
    return (
      <EmptyState variant="error"
        title={t('admin.rewards.loadFailed', 'Failed to load rewards')}
        description={(configQuery.error ?? reportQuery.error)?.message ?? t('admin.rewards.loadFailedDesc', 'Could not fetch the referral program.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
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
        title={t('admin.rewards.title', 'Referral & Reward Center')}
        subtitle={t('admin.rewards.subtitle', 'Manage subscriber loyalty incentives, point-to-bill conversion policies, and referral transactions')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('nav.rewards', 'Rewards') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setGrantOpen(true)}>
              <Gift className="h-3.5 w-3.5 text-primary" />
              {t('admin.rewards.grantPoints', 'Grant points')}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={openConfig}>
              <Sliders className="h-3.5 w-3.5 text-primary" />
              {t('admin.rewards.programRules', 'Program Rules')}
            </Button>
          </div>
        }
      />
      <GrantPointsDialog open={grantOpen} onOpenChange={setGrantOpen} />

      <OpsSummaryStrip
        items={[
          {
            label: t('admin.rewards.kpiStatus', 'Program Status'),
            value: config.referralEnabled ? t('admin.rewards.kpiActive', 'ACTIVE & REWARDING') : t('admin.rewards.kpiPaused', 'PAUSED'),
          },
          { label: t('admin.rewards.kpiReward', 'Reward per Referral'), value: t('admin.rewards.kpiLoyalty', '{n} Loyalty Points', { n: config.pointsPerReferral }) },
          { label: t('admin.rewards.kpiMaxRedeem', 'Max. Redeem per Bill'), value: `${config.maxRedeemPercent}%` },
          { label: t('admin.rewards.kpiConversion', 'Point Conversion'), value: t('admin.rewards.kpiRatio', '1 pt = ৳{value} BDT', { value: config.pointValueBdt.toFixed(2) }) },
          { label: t('admin.rewards.kpiIssued', 'Total Points Issued'), value: t('admin.rewards.pts', '{n} pts', { n: formatCount(report.rewards.pointsIssued) }) },
        ]}
      />

      {/* Program Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">{t('admin.rewards.cardPerReferral', 'Points per Referral')}</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary font-mono mt-0.5">
                {t('admin.rewards.pts', '{n} pts', { n: config.pointsPerReferral })}
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            {t('admin.rewards.cardPerReferralHint', 'Credited to the referrer when the referral is approved')}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">{t('admin.rewards.cardMaxRedeem', 'Max Redeem per Bill')}</CardDescription>
              <CardTitle className="text-2xl font-bold text-foreground font-mono mt-0.5">
                {config.maxRedeemPercent}%
              </CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            {t('admin.rewards.cardMaxRedeemHint', 'Points can pay up to this share of a bill ·')}{' '}
            <span className="font-semibold text-foreground font-mono">
              {t('admin.rewards.pts', '{n} pts', { n: formatCount(report.rewards.pointsRedeemed) })}
            </span>{' '}
            {t('admin.rewards.redeemedSoFar', 'redeemed so far')}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-xs">{t('admin.rewards.cardSwitch', 'Referral Program Switch')}</CardDescription>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={config.referralEnabled ? 'default' : 'secondary'}
                  tone={config.referralEnabled ? 'success' : undefined}
                >
                  {config.referralEnabled ? t('admin.rewards.live', 'Live & Accepting') : t('admin.rewards.paused', 'Paused')}
                </Badge>
              </div>
            </div>
            <Can menu="reward" action="update">
              <Switch
                checked={config.referralEnabled}
                disabled={saveConfig.isPending}
                onCheckedChange={handleToggleProgram}
                aria-label={t('admin.rewards.cardSwitch', 'Referral Program Switch')}
              />
            </Can>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            {config.referralEnabled
              ? t('admin.rewards.switchOn', 'Approved referrals earn points for the referrer')
              : t('admin.rewards.switchOff', 'Approved referrals are activated without awarding points')}
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Top Advocates & Referral Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              {t('admin.rewards.topTitle', 'Top Subscriber Advocates')}
            </CardTitle>
            <CardDescription>{t('admin.rewards.topDesc', 'Subscribers generating the most verified referrals')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={referrerColumns}
              data={report.topReferrers}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder={t('admin.rewards.searchAdvocate', 'Search advocate...')}
              emptyTitle={t('admin.rewards.noReferrers', 'No referrers yet')}
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              {t('admin.rewards.txTitle', 'Referral Reward Transactions')}
            </CardTitle>
            <CardDescription>{t('admin.rewards.txDesc', 'Audit log of awarded and pending referral points')}</CardDescription>
          </CardHeader>
          <CardContent>
            {referralsQuery.isError ? (
              <EmptyState variant="error"
                title={t('admin.rewards.referralsFailed', 'Failed to load referrals')}
                description={referralsQuery.error?.message}
                actionLabel={t('admin.customers.list.retry', 'Retry')}
                onAction={() => referralsQuery.refetch()}
              />
            ) : (
              <DataTable
                columns={txColumns}
                data={referralsQuery.data?.items ?? []}
                isLoading={referralsQuery.isLoading}
                getRowId={(row) => row.id}
                searchPlaceholder={t('admin.rewards.searchReferrals', 'Search referee, mobile, code or referrer...')}
                emptyTitle={search || status ? t('admin.rewards.emptyFiltered', 'No referrals match your filters') : t('admin.rewards.emptyNone', 'No referrals yet')}
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
                    items={{
                      all: t('admin.rewards.allStatuses', 'All statuses'),
                      pending: statusLabel('pending'),
                      verified: statusLabel('verified'),
                      rejected: statusLabel('rejected'),
                      flagged: statusLabel('flagged'),
                    }}
                  >
                    <SelectTrigger aria-label={t('admin.rewards.filterStatus', 'Filter by status')} className="h-9 min-w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.rewards.allStatuses', 'All statuses')}</SelectItem>
                      {REFERRAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel(s)}
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
              {t('admin.rewards.rulesTitle', 'Referral Program Rules')}
            </DialogTitle>
            <DialogDescription>{t('admin.rewards.rulesDesc', 'Adjust point rewards and redemption discount values.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="points-per-successful-referr" className="text-xs font-semibold">{t('admin.rewards.ruleReferral', 'Points per Successful Referral')}</Label>
              <Input id="points-per-successful-referr"
                type="number"
                min={0}
                value={draft.pointsPerReferral}
                onChange={(e) => setDraft({ ...draft, pointsPerReferral: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-share-of-a-bill-payable-" className="text-xs font-semibold">{t('admin.rewards.ruleMaxShare', 'Max Share of a Bill Payable with Points (%)')}</Label>
              <Input id="max-share-of-a-bill-payable-"
                type="number"
                min={0}
                max={100}
                value={draft.maxRedeemPercent}
                onChange={(e) => setDraft({ ...draft, maxRedeemPercent: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="point-to-bdt-ratio-1-pt-bdt" className="text-xs font-semibold">{t('admin.rewards.ruleRatio', 'Point to BDT Ratio (1 Pt = BDT)')}</Label>
              <Input id="point-to-bdt-ratio-1-pt-bdt"
                type="number"
                min={0}
                step="0.05"
                value={draft.pointValueBdt}
                onChange={(e) => setDraft({ ...draft, pointValueBdt: e.target.value })}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.rewards.ruleExample', 'One referral ({pts} pts) = ৳{value} BDT bill credit.', { pts: draftPoints, value: (draftPoints * draftRatio).toFixed(2) })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={saveConfig.isPending}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('admin.rewards.saveRules', 'Save Rules')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
