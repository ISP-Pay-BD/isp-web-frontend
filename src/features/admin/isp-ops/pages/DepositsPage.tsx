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

type Row = IspOpsData['deposits'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.type).toLowerCase().includes(q) ||
    String(r.amountBdt).toLowerCase().includes(q) ||
    String(r.at).toLowerCase().includes(q)
  );
};

export function DepositsPage() {
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
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.type)}</Badge>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.amountBdt)}</span>,
      },
      {
        accessorKey: 'at',
        header: 'Date',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.at)}</span>,
      },
      {
        accessorKey: 'refundable',
        header: 'Refundable',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.refundable)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.deposits;
  const total = rows.reduce((s, r) => s + r.amountBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deposits / OTC"
        subtitle="Security deposits and one-time charges"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Deposits / OTC" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "deposits" },
          { value: total.toLocaleString(), label: "৳" },
        ]}
      />
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
