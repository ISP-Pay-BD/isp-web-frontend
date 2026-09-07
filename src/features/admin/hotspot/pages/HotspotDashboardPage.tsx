'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotUserItem } from '@/data/admin/network-ops.data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { formatMac } from '@/lib/format/network';

export function HotspotDashboardPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const routers = data?.routers ?? [];
  const activeSessions = users.filter((u) => u.status === 'active');
  const onlineRouters = routers.filter((r) => r.status === 'online').length;
  const weekRevenue = reports.reduce((s, r) => s + r.priceBdt, 0);

  const columns = useMemo<LegacyColumnDef<HotspotUserItem, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'User',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
      },
      {
        accessorKey: 'profileName',
        header: 'Profile',
      },
      {
        accessorKey: 'macAddress',
        header: 'MAC',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatMac(row.original.macAddress)}</span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ipAddress}</span>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status === 'active' ? 'online' : 'offline'} />
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load hotspot dashboard"
          description="Could not fetch sessions and router health."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Dashboard"
        subtitle="Real-time voucher sessions and router health"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Dashboard' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/hotspot/reports" />}>
            View sales report
          </Button>
        }
      />

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{String(activeSessions.length)}</span>{' '}
          <span className="text-muted-foreground">active sessions</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{`${onlineRouters}/${routers.length}`}</span>{' '}
          <span className="text-muted-foreground">online routers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatBdtWithSymbol(weekRevenue)}</span>{' '}
          <span className="text-muted-foreground">week revenue</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{String(users.filter((u) => u.status === 'expired').length)}</span>{' '}
          <span className="text-muted-foreground">expired today</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live hotspot sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={activeSessions}
            getRowId={(row) => row.id}
            searchKey="username"
            searchPlaceholder="Search live sessions..."
            emptyTitle="No active sessions"
            emptyDescription="Active voucher sessions will appear here."
            enableColumnVisibility={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
