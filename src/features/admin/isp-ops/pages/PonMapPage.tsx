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

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

/** PON / splitter map from the synchronized ONUs of the tenant's OLTs. */
export function PonMapPage() {
  const t = useTranslations();
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
        header: t('admin.ops.ponMap.colSplitter', 'Splitter'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.splitters.join(', ') || '—'}</span>,
      },
      {
        accessorKey: 'onlineOnus',
        header: t('status.online', 'Online'),
        cell: ({ row }) => {
          const { onlineOnus, totalOnus } = row.original;
          const pct = totalOnus > 0 ? Math.round((onlineOnus / totalOnus) * 100) : 0;
          return (
            <span className="text-foreground font-mono text-xs tabular-nums">
              {onlineOnus}
              <span className="text-muted-foreground/60">/{totalOnus}</span>
              <span className={`ml-1.5 text-xs ${pct < 50 ? 'text-red-500' : pct < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{pct}%</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'avgRxDbm',
        header: t('admin.ops.ponMap.colAvgRx', 'Avg Rx dBm'),
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
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.ponMap.loadFailed', 'Failed to load PON ports')} description={errorMessage(error)} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.ops.ponMap.title', 'PON / Splitter Map')}
        subtitle={t('admin.ops.ponMap.subtitle', 'ONUs per PON port and average optical levels, from the latest OLT sync')}
        breadcrumb={[{ label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' }, { label: t('admin.ops.ponMap.title', 'PON / Splitter Map') }]}
      />
      <OpsSummaryStrip
        items={[
          { value: formatCount((data?.meta.total ?? 0)), label: t('admin.ops.ponMap.kpiPons', 'PONs') },
          { value: `${formatCount((data?.summary.onlineOnus ?? 0))} / ${formatCount((data?.summary.totalOnus ?? 0))}`, label: t('admin.ops.ponMap.kpiOnus', 'ONUs online') },
        ]}
      />
      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.ponMap.searchPlaceholder', 'Search OLT, PON or splitter…')}
        emptyTitle={table.search ? t('admin.ops.ponMap.emptySearch', 'No PON ports match your search') : t('admin.ops.ponMap.emptyNone', 'No synchronized ONUs')}
        emptyDescription={t('admin.ops.ponMap.emptyHint', 'Sync an OLT to populate its PON ports.')}
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
