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

type Row = IspOpsData['serviceTypes'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.code).toLowerCase().includes(q) ||
    String(r.customers).toLowerCase().includes(q)
  );
};

export function ServicesPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Service',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.code)}</span>,
      },
      {
        accessorKey: 'customers',
        header: 'Customers',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.customers)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.serviceTypes;
  const customers = rows.reduce((s, r) => s + r.customers, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service Types"
        subtitle="Multi-service plan categories"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Service Types" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "services" },
          { value: customers.toLocaleString(), label: "customers" },
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
