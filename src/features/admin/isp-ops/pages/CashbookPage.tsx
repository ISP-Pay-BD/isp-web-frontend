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

type Row = IspOpsData['cashbookEntries'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.at).toLowerCase().includes(q) ||
    String(r.collector).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.amountBdt).toLowerCase().includes(q)
  );
};

export function CashbookPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.at)}</span>,
      },
      {
        accessorKey: 'collector',
        header: 'Collector',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.collector)}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.amountBdt)}</span>,
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.method)}</Badge>
        ),
      },
      {
        accessorKey: 'note',
        header: 'Note',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.note)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.cashbookEntries;
  const total = rows.reduce((s, r) => s + r.amountBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collector Cash Book"
        subtitle="Field and counter collections pending bank deposit"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Collector Cash Book" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} entries · {total.toLocaleString()} ৳ collected
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
