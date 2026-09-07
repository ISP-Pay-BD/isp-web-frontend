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

type Row = IspOpsData['creditNotes'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.number).toLowerCase().includes(q) ||
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.amountBdt).toLowerCase().includes(q) ||
    String(r.reason).toLowerCase().includes(q)
  );
};

export function CreditsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.number)}</span>,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.amountBdt)}</span>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.reason)}</span>,
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

  const rows = data.creditNotes;
  const open = rows.filter((r) => r.status === 'open');
  const openTotal = open.reduce((s, r) => s + r.amountBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Notes"
        subtitle="Refunds and goodwill credit ledger"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Credit Notes" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} notes · {open.length} open · {openTotal.toLocaleString()} ৳ open
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="number"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
