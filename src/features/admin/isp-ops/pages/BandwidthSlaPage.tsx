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

type Row = IspOpsData['bandwidthSla'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.link).toLowerCase().includes(q) ||
    String(r.committedMbps).toLowerCase().includes(q) ||
    String(r.avgMbps).toLowerCase().includes(q) ||
    String(r.uptimePct).toLowerCase().includes(q)
  );
};

export function BandwidthSlaPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'link',
        header: 'Link',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.link)}</span>,
      },
      {
        accessorKey: 'committedMbps',
        header: 'Committed',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.committedMbps)}</span>,
      },
      {
        accessorKey: 'avgMbps',
        header: 'Avg',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.avgMbps)}</span>,
      },
      {
        accessorKey: 'uptimePct',
        header: 'Uptime %',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.uptimePct)}</span>,
      },
      {
        accessorKey: 'breaches',
        header: 'Breaches',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.breaches)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.bandwidthSla;
  const breaches = rows.reduce((s, r) => s + r.breaches, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth SLA"
        subtitle="Uplink commitment vs delivery"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Bandwidth SLA" }]}
        
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} links · {breaches} breaches
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="link"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
