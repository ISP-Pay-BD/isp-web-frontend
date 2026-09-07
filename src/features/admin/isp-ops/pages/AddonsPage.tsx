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

type Row = IspOpsData['addons'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.category).toLowerCase().includes(q) ||
    String(r.priceBdt).toLowerCase().includes(q) ||
    String(r.active).toLowerCase().includes(q)
  );
};

export function AddonsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Addon',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.category)}</Badge>
        ),
      },
      {
        accessorKey: 'priceBdt',
        header: 'Price',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.priceBdt)}</span>,
      },
      {
        accessorKey: 'active',
        header: 'Active',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.active)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.addons;
  const active = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OTT / IPTV Addons"
        subtitle="Sellable add-on products on packages"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "OTT / IPTV Addons" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} addons · {active} active
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
