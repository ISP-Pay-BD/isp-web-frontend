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

type Row = IspOpsData['acsDevices'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.serial).toLowerCase().includes(q) ||
    String(r.manufacturer).toLowerCase().includes(q) ||
    String(r.model).toLowerCase().includes(q) ||
    String(r.lastInform).toLowerCase().includes(q)
  );
};

export function AcsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'serial',
        header: 'Serial',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.serial)}</span>,
      },
      {
        accessorKey: 'manufacturer',
        header: 'Mfr',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.manufacturer)}</span>,
      },
      {
        accessorKey: 'model',
        header: 'Model',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.model)}</span>,
      },
      {
        accessorKey: 'lastInform',
        header: 'Last inform',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.lastInform)}</span>,
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

  const rows = data.acsDevices;
  const online = rows.filter((r) => r.status === 'online').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="TR-069 / ACS"
        subtitle="CPE inform status from ACS"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "TR-069 / ACS" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "devices" },
          { value: online, label: "online" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="serial"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
