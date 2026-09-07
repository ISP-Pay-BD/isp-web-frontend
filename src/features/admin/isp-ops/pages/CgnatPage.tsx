'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['cgnatMaps'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.privateCidr).toLowerCase().includes(q) ||
    String(r.publicPool).toLowerCase().includes(q) ||
    String(r.portsPerUser).toLowerCase().includes(q) ||
    String(r.activeSessions).toLowerCase().includes(q)
  );
};

export function CgnatPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'privateCidr',
        header: 'Private',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.privateCidr)}</span>,
      },
      {
        accessorKey: 'publicPool',
        header: 'Public pool',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.publicPool)}</span>,
      },
      {
        accessorKey: 'portsPerUser',
        header: 'Ports/user',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.portsPerUser)}</span>,
      },
      {
        accessorKey: 'activeSessions',
        header: 'Sessions',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.activeSessions)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.cgnatMaps;
  const sessions = rows.reduce((s, r) => s + r.activeSessions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="CGNAT Map"
        subtitle="Private-to-public NAT pools and port budgets"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "CGNAT Map" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} pools · {sessions.toLocaleString()} sessions
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="privateCidr"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
