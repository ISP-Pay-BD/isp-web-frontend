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

type Row = IspOpsData['cpeAssignments'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.serial).toLowerCase().includes(q) ||
    String(r.model).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.assignedAt).toLowerCase().includes(q)
  );
};

export function CpeAssignPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'serial',
        header: 'Serial',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.serial)}</span>,
      },
      {
        accessorKey: 'model',
        header: 'Model',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.model)}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'assignedAt',
        header: 'Assigned',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.assignedAt)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.status)}</Badge>
        ),
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.cpeAssignments;
  const spare = rows.filter((r) => r.status === 'spare').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CPE Assignment"
        subtitle="Assign inventory CPE serials to customers"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "CPE Assignment" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} CPE · {spare} spare
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="serial"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
