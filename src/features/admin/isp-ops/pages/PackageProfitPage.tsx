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

type Row = IspOpsData['packageProfitRows'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.popName).toLowerCase().includes(q) ||
    String(r.packageName).toLowerCase().includes(q) ||
    String(r.customers).toLowerCase().includes(q) ||
    String(r.revenueBdt).toLowerCase().includes(q)
  );
};

export function PackageProfitPage() {
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
        accessorKey: 'packageName',
        header: 'Package',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.packageName)}</span>,
      },
      {
        accessorKey: 'customers',
        header: 'Customers',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.customers)}</span>,
      },
      {
        accessorKey: 'revenueBdt',
        header: 'Revenue',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.revenueBdt)}</span>,
      },
      {
        accessorKey: 'costBdt',
        header: 'Cost',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.costBdt)}</span>,
      },
      {
        accessorKey: 'profitBdt',
        header: 'Profit',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.profitBdt)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.packageProfitRows;
  const profit = rows.reduce((s, r) => s + r.profitBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Package Profit by POP"
        subtitle="Revenue vs cost per package at each POP"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Package Profit by POP" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "rows" },
          { value: profit.toLocaleString(), label: "৳ profit" },
        ]}
      />
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
