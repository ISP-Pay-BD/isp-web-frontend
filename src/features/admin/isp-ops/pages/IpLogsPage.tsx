'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['ipNatLogs'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.at).toLowerCase().includes(q) ||
    String(r.username).toLowerCase().includes(q) ||
    String(r.publicIp).toLowerCase().includes(q) ||
    String(r.privateIp).toLowerCase().includes(q)
  );
};

export function IpLogsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.at)}</span>,
      },
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.username)}</span>,
      },
      {
        accessorKey: 'publicIp',
        header: 'Public IP',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.publicIp)}</span>,
      },
      {
        accessorKey: 'privateIp',
        header: 'Private IP',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.privateIp)}</span>,
      },
      {
        accessorKey: 'port',
        header: 'Port',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.port)}</span>,
      },
      {
        accessorKey: 'protocol',
        header: 'Proto',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.protocol)}</Badge>
        ),
      },
      {
        accessorKey: 'bytes',
        header: 'Bytes',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.bytes)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.ipNatLogs;

  return (
    <div className="space-y-5">
      <PageHeader
        title="BTRC IP / NAT Logs"
        subtitle="Compliance session NAT mapping for regulatory export"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "BTRC IP / NAT Logs" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "NAT logs" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="username"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
