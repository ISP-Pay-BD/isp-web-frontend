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

type Row = IspOpsData['nocHooks'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.type).toLowerCase().includes(q) ||
    String(r.target).toLowerCase().includes(q) ||
    String(r.enabled).toLowerCase().includes(q)
  );
};

export function NocPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Hook',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.type)}</Badge>
        ),
      },
      {
        accessorKey: 'target',
        header: 'Target',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.target)}</span>,
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.enabled)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.nocHooks;
  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="NOC Hooks"
        subtitle="SNMP and webhook alerting endpoints"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "NOC Hooks" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} hooks · {enabled} enabled
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
