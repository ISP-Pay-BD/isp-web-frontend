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

type Row = IspOpsData['leads'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.phone).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.packageInterest).toLowerCase().includes(q)
  );
};

export function LeadsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Lead',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.phone)}</span>,
      },
      {
        accessorKey: 'area',
        header: 'Area',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.area)}</span>,
      },
      {
        accessorKey: 'packageInterest',
        header: 'Interest',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.packageInterest)}</span>,
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.stage)}</Badge>
        ),
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.owner)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.leads;
  const open = rows.filter((r) => r.stage !== 'won' && r.stage !== 'lost').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Pipeline"
        subtitle="Sales leads and conversion stages"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Leads Pipeline" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} leads · {open} open
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
