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

type Row = IspOpsData['contracts'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.title).toLowerCase().includes(q) ||
    String(r.status).toLowerCase().includes(q) ||
    String(r.signedAt).toLowerCase().includes(q)
  );
};

export function ContractsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.title)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.status)}</Badge>
        ),
      },
      {
        accessorKey: 'signedAt',
        header: 'Signed',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.signedAt)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.contracts;
  const signed = rows.filter((r) => r.status === 'signed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        subtitle="E-sign service agreements"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Contracts" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} contracts · {signed} signed
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="customerName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
