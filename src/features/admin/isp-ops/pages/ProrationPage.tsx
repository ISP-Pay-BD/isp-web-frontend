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

type Row = IspOpsData['prorationExamples'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.fromPackage).toLowerCase().includes(q) ||
    String(r.toPackage).toLowerCase().includes(q) ||
    String(r.daysUsed).toLowerCase().includes(q) ||
    String(r.creditBdt).toLowerCase().includes(q)
  );
};

export function ProrationPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'fromPackage',
        header: 'From',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.fromPackage)}</span>,
      },
      {
        accessorKey: 'toPackage',
        header: 'To',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.toPackage)}</span>,
      },
      {
        accessorKey: 'daysUsed',
        header: 'Days used',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.daysUsed)}</span>,
      },
      {
        accessorKey: 'creditBdt',
        header: 'Credit',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.creditBdt)}</span>,
      },
      {
        accessorKey: 'chargeBdt',
        header: 'Charge',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.chargeBdt)}</span>,
      },
      {
        accessorKey: 'netBdt',
        header: 'Net',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.netBdt)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.prorationExamples;
  const net = rows.reduce((s, r) => s + r.netBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proration Wizard"
        subtitle="Package change mid-cycle credit / charge examples"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Proration Wizard" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "examples" },
          { value: net.toLocaleString(), label: "৳ net" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="fromPackage"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
