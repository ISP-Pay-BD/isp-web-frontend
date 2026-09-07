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

type Row = IspOpsData['inactiveCustomers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.username).toLowerCase().includes(q) ||
    String(r.packageName).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q)
  );
};

export function InactiveCustomersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.username)}</span>,
      },
      {
        accessorKey: 'packageName',
        header: 'Package',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.packageName)}</span>,
      },
      {
        accessorKey: 'area',
        header: 'Area',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.area)}</span>,
      },
      {
        accessorKey: 'daysInactive',
        header: 'Days',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.daysInactive)}</span>,
      },
      {
        accessorKey: 'lastOnline',
        header: 'Last online',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lastOnline)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.inactiveCustomers;
  const over30 = rows.filter((r) => r.daysInactive >= 30).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inactive Customers"
        subtitle="Customers with no recent online session"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Inactive Customers" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} inactive · {over30} over 30 days
      </p>
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
