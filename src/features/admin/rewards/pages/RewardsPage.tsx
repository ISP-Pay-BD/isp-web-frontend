'use client';

import { useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Gift, Trophy } from 'lucide-react';
import { useRewards } from '../hooks/use-rewards';
import type { ReferralTransaction, TopReferrer } from '@/data/admin/rewards.data';

const referrerColumns: LegacyColumnDef<TopReferrer, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableHiding: false,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'totalReferrals',
    header: 'Referrals',
    cell: ({ row }) => (
      <span className="font-mono">{row.original.totalReferrals}</span>
    ),
  },
  {
    accessorKey: 'convertedCount',
    header: 'Converted',
    cell: ({ row }) => (
      <span className="font-mono">{row.original.convertedCount}</span>
    ),
  },
  {
    accessorKey: 'totalPoints',
    header: 'Points',
    cell: ({ row }) => (
      <span className="font-mono text-primary">{row.original.totalPoints}</span>
    ),
  },
];

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
    tx.packageSubscribed.toLowerCase().includes(q)
  );
};

const txColumns: LegacyColumnDef<ReferralTransaction, unknown>[] = [
  {
    accessorKey: 'referrerName',
    header: 'Referrer',
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">{row.original.referrerName}</div>
        <div className="text-xs text-muted-foreground">{row.original.packageSubscribed}</div>
      </div>
    ),
  },
  {
    accessorKey: 'refereeName',
    header: 'Referee',
    cell: ({ row }) => <span className="text-sm">{row.original.refereeName}</span>,
  },
  {
    accessorKey: 'pointsEarned',
    header: 'Points',
    cell: ({ row }) => (
      <span className="font-mono">+{row.original.pointsEarned}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'approved'
            ? 'default'
            : row.original.status === 'rejected'
              ? 'destructive'
              : 'secondary'
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
];

export function RewardsPage() {
  const { data, isLoading, isError, refetch } = useRewards();
  const [programEnabled, setProgramEnabled] = useState(true);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load rewards" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const cfg = data.config;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral & Reward Center"
        subtitle="Manage referral program configuration and point transactions"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Rewards' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Points per Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{cfg.pointsPerReferral}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">Min Redeem Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cfg.minPointsToRedeem}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-muted-foreground font-normal">Program Status</CardTitle>
            <Can menu="reward" action="update">
              <Switch
                checked={programEnabled}
                onCheckedChange={(v) => {
                  setProgramEnabled(v);
                  toast.success('Program status updated');
                }}
              />
            </Can>
          </CardHeader>
          <CardContent>
            <Badge variant={programEnabled ? 'default' : 'secondary'}>
              {programEnabled ? 'Active' : 'Paused'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={referrerColumns}
              data={data.topReferrers}
              getRowId={(row) => row.id}
              searchKey="name"
              searchPlaceholder="Search referrer..."
              emptyTitle="No referrers yet"
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Referral point awards and redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={txColumns}
              data={data.transactions}
              getRowId={(row) => row.id}
              searchKey="referrerName"
              searchPlaceholder="Search referrer or referee..."
              searchFilterFn={txSearchFilter}
              facetFilters={[{ columnId: 'status', title: 'Status' }]}
              emptyTitle="No transactions"
              enableColumnVisibility={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Point conversion: 1 point = <CurrencyDisplay amount={cfg.pointsToBdtRatio} /> discount on
          next bill.
        </CardContent>
      </Card>
    </div>
  );
}
