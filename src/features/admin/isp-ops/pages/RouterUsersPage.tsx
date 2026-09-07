'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { PppoeSession } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<PppoeSession>, _c: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.username.toLowerCase().includes(q) || r.ip.includes(q) || r.mac.toLowerCase().includes(q);
};

export function RouterUsersPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<PppoeSession, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.username}</span>,
      },
      {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ip}</span>,
      },
      {
        accessorKey: 'mac',
        header: 'MAC',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.mac}</span>,
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.uptime}</span>,
      },
      {
        accessorKey: 'rxMbps',
        header: 'RX Mbps',
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.rxMbps}</span>,
      },
      {
        accessorKey: 'txMbps',
        header: 'TX Mbps',
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.txMbps}</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`CoA disconnect sent for ${row.original.username} (mock)`)}
          >
            Kick
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load sessions" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const router = data.routerDetails.find((r) => r.id === params.id) ?? data.routerDetails[0];
  const sessions = data.pppoeSessions.filter((s) => s.routerId === (router?.id ?? params.id));
  const totalRx = sessions.reduce((s, x) => s + x.rxMbps, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`PPPoE users · ${router?.name ?? params.id}`}
        subtitle="Live sessions — kick sends mock RADIUS CoA / PoD"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Routers', url: '/admin/routers' },
          { label: router?.name ?? 'Router', url: `/admin/routers/${router?.id ?? params.id}` },
          { label: 'Users' },
        ]}
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {sessions.length} sessions · {totalRx.toFixed(1)} Mbps RX
      </p>
      <DataTable
        columns={columns}
        data={sessions}
        searchKey="username"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search username, IP, MAC…"
      />
    </div>
  );
}
