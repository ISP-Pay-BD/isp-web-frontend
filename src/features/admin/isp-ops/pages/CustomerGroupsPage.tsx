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

type Row = IspOpsData['customerGroups'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.parentName).toLowerCase().includes(q) ||
    String(r.members).toLowerCase().includes(q) ||
    String(r.billingMode).toLowerCase().includes(q)
  );
};

export function CustomerGroupsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Group',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'parentName',
        header: 'Parent',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.parentName)}</span>,
      },
      {
        accessorKey: 'members',
        header: 'Members',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.members)}</span>,
      },
      {
        accessorKey: 'billingMode',
        header: 'Billing',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.billingMode)}</Badge>
        ),
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.customerGroups;
  const members = rows.reduce((s, r) => s + r.members, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Groups"
        subtitle="Parent–child and consolidated billing groups"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Customer Groups" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} groups · {members.toLocaleString()} members
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
