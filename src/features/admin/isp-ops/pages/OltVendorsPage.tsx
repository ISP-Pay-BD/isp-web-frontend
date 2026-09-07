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

type Row = IspOpsData['oltVendors'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.models).toLowerCase().includes(q) ||
    String(r.profileCount).toLowerCase().includes(q) ||
    String(r.lastSync).toLowerCase().includes(q)
  );
};

export function OltVendorsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Vendor',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'models',
        header: 'Models',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.models)}</span>,
      },
      {
        accessorKey: 'profileCount',
        header: 'Profiles',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.profileCount)}</span>,
      },
      {
        accessorKey: 'lastSync',
        header: 'Last sync',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lastSync)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.oltVendors;
  const profiles = rows.reduce((s, r) => s + r.profileCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="OLT Vendors"
        subtitle="Multi-vendor OLT profiles and sync status"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "OLT Vendors" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} vendors · {profiles} profiles
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
