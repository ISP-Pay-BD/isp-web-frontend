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

type Row = IspOpsData['stockTransfers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.item).toLowerCase().includes(q) ||
    String(r.fromLocation).toLowerCase().includes(q) ||
    String(r.toLocation).toLowerCase().includes(q) ||
    String(r.qty).toLowerCase().includes(q)
  );
};

export function StockTransfersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'item',
        header: 'Item',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.item)}</span>,
      },
      {
        accessorKey: 'fromLocation',
        header: 'From',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.fromLocation)}</span>,
      },
      {
        accessorKey: 'toLocation',
        header: 'To',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.toLocation)}</span>,
      },
      {
        accessorKey: 'qty',
        header: 'Qty',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.qty)}</span>,
      },
      {
        accessorKey: 'at',
        header: 'Date',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.at)}</span>,
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

  const rows = data.stockTransfers;
  const pending = rows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock Transfers"
        subtitle="Warehouse and field stock movement"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Stock Transfers" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "transfers" },
          { value: pending, label: "pending" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="item"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
