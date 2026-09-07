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

type Row = IspOpsData['popCommissions'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.popName).toLowerCase().includes(q) ||
    String(r.period).toLowerCase().includes(q) ||
    String(r.collectedBdt).toLowerCase().includes(q) ||
    String(r.ratePct).toLowerCase().includes(q)
  );
};

export function PopCommissionsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'popName',
        header: 'POP',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.popName)}</span>,
      },
      {
        accessorKey: 'period',
        header: 'Period',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.period)}</span>,
      },
      {
        accessorKey: 'collectedBdt',
        header: 'Collected',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.collectedBdt)}</span>,
      },
      {
        accessorKey: 'ratePct',
        header: 'Rate %',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.ratePct)}</span>,
      },
      {
        accessorKey: 'commissionBdt',
        header: 'Commission',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.commissionBdt)}</span>,
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

  const rows = data.popCommissions;
  const pending = rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.commissionBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="POP Commissions"
        subtitle="Reseller commission by collection period"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "POP Commissions" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} periods · {pending.toLocaleString()} ৳ pending
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="popName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
