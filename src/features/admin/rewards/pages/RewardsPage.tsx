'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { toast } from 'sonner';
import { Gift, Trophy } from 'lucide-react';
import { useRewards } from '../hooks/use-rewards';

export function RewardsPage() {
  const { data, isLoading, isError, refetch } = useRewards();
  const [programEnabled, setProgramEnabled] = useState(true);

  if (isLoading) return <PageSkeleton />;
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
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Points per Referral</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{cfg.pointsPerReferral}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Min Redeem Points</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{cfg.minPointsToRedeem}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-muted-foreground font-normal">Program Status</CardTitle>
            <Can menu="reward" action="update">
              <Switch checked={programEnabled} onCheckedChange={(v) => { setProgramEnabled(v); toast.success('Program status updated'); }} />
            </Can>
          </CardHeader>
          <CardContent>
            <Badge variant={programEnabled ? 'default' : 'secondary'}>{programEnabled ? 'Active' : 'Paused'}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" />Top Referrers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topReferrers.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="font-mono">{r.totalReferrals}</TableCell>
                    <TableCell className="font-mono">{r.convertedCount}</TableCell>
                    <TableCell className="font-mono text-primary">{r.totalPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4 text-primary" />Recent Transactions</CardTitle>
            <CardDescription>Referral point awards and redemptions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referee</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{tx.referrerName}</div>
                      <div className="text-xs text-muted-foreground">{tx.packageSubscribed}</div>
                    </TableCell>
                    <TableCell className="text-sm">{tx.refereeName}</TableCell>
                    <TableCell className="font-mono">+{tx.pointsEarned}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'approved' ? 'default' : tx.status === 'rejected' ? 'destructive' : 'secondary'}>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Point conversion: 1 point = <CurrencyDisplay amount={cfg.pointsToBdtRatio} /> discount on next bill.
        </CardContent>
      </Card>
    </div>
  );
}
