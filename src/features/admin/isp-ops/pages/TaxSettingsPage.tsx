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

type Row = IspOpsData['taxSettings'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.ratePct).toLowerCase().includes(q) ||
    String(r.inclusive).toLowerCase().includes(q) ||
    String(r.applyTo).toLowerCase().includes(q)
  );
};

export function TaxSettingsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tax',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'ratePct',
        header: 'Rate %',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.ratePct)}</span>,
      },
      {
        accessorKey: 'inclusive',
        header: 'Inclusive',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.inclusive)}</span>,
      },
      {
        accessorKey: 'applyTo',
        header: 'Apply to',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.applyTo)}</Badge>
        ),
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

  const rows = data.taxSettings;
  const active = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Settings"
        subtitle="VAT and service tax applied to invoices and OTC"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Tax Settings" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} taxes · {active} active
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
