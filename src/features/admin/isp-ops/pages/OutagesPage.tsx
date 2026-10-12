'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useOutages, type Outage } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { fmtDateTime } from '../components/NetOpsControls';

const severityBadgeClass: Record<string, string> = {
  minor: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  major: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25',
};

/**
 * Outage board: every OLT PON that has offline ONUs right now (from the last
 * OLT sync). Severity is the share of the PON that is down.
 */
export function OutagesPage() {
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useOutages({ page: table.page, pageSize: table.pageSize, search: table.search });

  const columns = useMemo<LegacyColumnDef<Outage, unknown>[]>(
    () => [
      {
        id: 'pon',
        accessorKey: 'ponPort',
        header: 'Incident',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-medium">
            {row.original.oltName} · {row.original.ponPort}
          </span>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => (
          <Badge variant="outline" className={`capitalize ${severityBadgeClass[row.original.severity] ?? ''}`}>
            {row.original.severity}
          </Badge>
        ),
      },
      {
        id: 'reasons',
        header: 'Reason',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.reasons.join(', ') || '—'}</span>,
      },
      {
        accessorKey: 'affected',
        header: 'Affected',
        cell: ({ row }) => (
          <span className="text-foreground font-medium tabular-nums">
            {row.original.affected}
            <span className="text-muted-foreground/60"> / {row.original.totalOnus} ONUs</span>
          </span>
        ),
      },
      {
        accessorKey: 'since',
        header: 'Down since',
        cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{fmtDateTime(row.original.since)}</span>,
      },
      {
        accessorKey: 'lastSync',
        header: 'Last OLT sync',
        cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{fmtDateTime(row.original.lastSync)}</span>,
      },
    ],
    [],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load outages" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const summary = data?.summary;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Outage Board"
        subtitle="PON ports with offline ONUs and customer impact, from the latest OLT sync"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Outage Board' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: (summary?.outages ?? 0).toLocaleString(), label: 'PONs affected' },
          { value: (summary?.affectedOnus ?? 0).toLocaleString(), label: 'ONUs offline' },
          { value: (summary?.totalOnus ?? 0).toLocaleString(), label: 'ONUs monitored' },
        ]}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder="Search OLT, PON or reason…"
        emptyTitle={table.search ? 'No outages match your search' : 'No offline ONUs'}
        emptyDescription="Every synchronized ONU reported online at the last OLT sync."
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
