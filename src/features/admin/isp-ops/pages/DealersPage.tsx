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

type Row = IspOpsData['dealers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.tier).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.customers).toLowerCase().includes(q)
  );
};

export function DealersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Dealer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'tier',
        header: 'Tier',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.tier)}</span>,
      },
      {
        accessorKey: 'area',
        header: 'Area',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.area)}</span>,
      },
      {
        accessorKey: 'customers',
        header: 'Customers',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.customers)}</span>,
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

  const rows = data.dealers;
  const active = rows.filter((r) => r.status === 'active').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dealers (6-tier)"
        subtitle="Dealer hierarchy and footprint"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Dealers (6-tier)" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "dealers" },
          { value: active, label: "active" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="name"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
