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

type Row = IspOpsData['ponPorts'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.oltName).toLowerCase().includes(q) ||
    String(r.pon).toLowerCase().includes(q) ||
    String(r.splitter).toLowerCase().includes(q) ||
    String(r.usedOnus).toLowerCase().includes(q)
  );
};

export function PonMapPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'oltName',
        header: 'OLT',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.oltName)}</span>,
      },
      {
        accessorKey: 'pon',
        header: 'PON',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.pon)}</span>,
      },
      {
        accessorKey: 'splitter',
        header: 'Splitter',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.splitter)}</span>,
      },
      {
        accessorKey: 'usedOnus',
        header: 'Used',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.usedOnus)}</span>,
      },
      {
        accessorKey: 'capacity',
        header: 'Capacity',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.capacity)}</span>,
      },
      {
        accessorKey: 'avgRxDbm',
        header: 'Avg Rx dBm',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.avgRxDbm)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.ponPorts;
  const used = rows.reduce((s, r) => s + r.usedOnus, 0);
  const capacity = rows.reduce((s, r) => s + r.capacity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="PON / Splitter Map"
        subtitle="PON port utilization and average optical levels"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "PON / Splitter Map" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} PONs · {used}/{capacity} ONUs
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="oltName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
