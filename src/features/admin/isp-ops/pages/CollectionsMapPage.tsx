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

type Row = IspOpsData['collectionPoints'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.collector).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.stops).toLowerCase().includes(q) ||
    String(r.collectedBdt).toLowerCase().includes(q)
  );
};

export function CollectionsMapPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'collector',
        header: 'Collector',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.collector)}</span>,
      },
      {
        accessorKey: 'area',
        header: 'Area',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.area)}</span>,
      },
      {
        accessorKey: 'stops',
        header: 'Stops',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.stops)}</span>,
      },
      {
        accessorKey: 'collectedBdt',
        header: 'Collected',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.collectedBdt)}</span>,
      },
      {
        accessorKey: 'lat',
        header: 'Lat',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lat)}</span>,
      },
      {
        accessorKey: 'lng',
        header: 'Lng',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lng)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.collectionPoints;
  const stops = rows.reduce((s, r) => s + r.stops, 0);
  const collected = rows.reduce((s, r) => s + r.collectedBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collections Map"
        subtitle="Collector routes and GPS stops (mock coordinates)"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Collections Map" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} collectors · {stops} stops · {collected.toLocaleString()} ৳
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="collector"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
