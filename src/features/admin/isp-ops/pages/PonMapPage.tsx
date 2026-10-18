'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { usePonPorts, type PonPort } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';

/** PON / splitter map from the synchronized ONUs of the tenant's OLTs. */
export function PonMapPage() {
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = usePonPorts({ page: table.page, pageSize: table.pageSize, search: table.search });

  const columns = useMemo<LegacyColumnDef<PonPort, unknown>[]>(
    () => [
      {
        accessorKey: 'oltName',
        header: 'OLT',
        enableHiding: false,
        cell: ({ row }) => <span className="text-foreground font-medium">{row.original.oltName}</span>,
      },
      {
        accessorKey: 'ponPort',
        header: 'PON',
        cell: ({ row }) => <span className="text-foreground font-mono text-xs tabular-nums">{row.original.ponPort}</span>,
      },
      {
        id: 'splitters',
        header: 'Splitter',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.splitters.join(', ') || '—'}</span>,
      },
      {
        accessorKey: 'onlineOnus',
        header: 'Online',
        cell: ({ row }) => {
          const { onlineOnus, totalOnus } = row.original;
          const pct = totalOnus > 0 ? Math.round((onlineOnus / totalOnus) * 100) : 0;
          return (
            <span className="text-foreground font-mono text-xs tabular-nums">
              {onlineOnus}
              <span className="text-muted-foreground/60">/{totalOnus}</span>
              <span className={`ml-1.5 text-[10px] ${pct < 50 ? 'text-red-500' : pct < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{pct}%</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'avgRxDbm',
        header: 'Avg Rx dBm',
        cell: ({ row }) => {
          const dbm = row.original.avgRxDbm;
          if (dbm === null) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <span className={`font-mono text-xs tabular-nums ${dbm < -25 ? 'text-amber-500' : dbm < -20 ? 'text-sky-500' : 'text-emerald-500'}`}>
              {dbm.toFixed(2)} dBm
            </span>
          );
        },
      },
    ],
    [],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load PON ports" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="PON / Splitter Map"
        subtitle="ONUs per PON port and average optical levels, from the latest OLT sync"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'PON / Splitter Map' }]}
      />
      <OpsSummaryStrip
        items={[
          { value: (data?.meta.total ?? 0).toLocaleString(), label: 'PONs' },
          { value: `${(data?.summary.onlineOnus ?? 0).toLocaleString()} / ${(data?.summary.totalOnus ?? 0).toLocaleString()}`, label: 'ONUs online' },
        ]}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder="Search OLT, PON or splitter…"
        emptyTitle={table.search ? 'No PON ports match your search' : 'No synchronized ONUs'}
        emptyDescription="Sync an OLT to populate its PON ports."
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
