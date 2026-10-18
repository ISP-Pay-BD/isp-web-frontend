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
import { useTranslations } from '@/i18n/locale-context';
import { useOutages, type Outage } from '../hooks/use-network-ops';
import { useServerTable } from '../hooks/use-server-table';
import { fmtDateTime } from '../components/NetOpsControls';

import { formatCount } from '@/lib/format';
const severityBadgeClass: Record<string, string> = {
  minor: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25',
  major: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25',
};

const severityKeys: Record<string, [string, string]> = {
  minor: ['admin.ops.outages.severity.minor', 'Minor'],
  major: ['admin.ops.outages.severity.major', 'Major'],
  critical: ['admin.ops.outages.severity.critical', 'Critical'],
};

function severityLabel(t: ReturnType<typeof useTranslations>, severity: string): string {
  const entry = severityKeys[severity];
  return entry ? t(entry[0], entry[1]) : severity;
}

/**
 * Outage board: every OLT PON that has offline ONUs right now (from the last
 * OLT sync). Severity is the share of the PON that is down.
 */
export function OutagesPage() {
  const t = useTranslations();
  const table = useServerTable();
  const { data, isLoading, isError, error, refetch } = useOutages({ page: table.page, pageSize: table.pageSize, search: table.search });

  const columns = useMemo<LegacyColumnDef<Outage, unknown>[]>(
    () => [
      {
        id: 'pon',
        accessorKey: 'ponPort',
        header: t('admin.ops.outages.colIncident', 'Incident'),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="text-foreground font-medium">
            {row.original.oltName} · {row.original.ponPort}
          </span>
        ),
      },
      {
        accessorKey: 'severity',
        header: t('admin.ops.outages.colSeverity', 'Severity'),
        cell: ({ row }) => (
          <Badge variant="outline" className={`capitalize ${severityBadgeClass[row.original.severity] ?? ''}`}>
            {severityLabel(t, row.original.severity)}
          </Badge>
        ),
      },
      {
        id: 'reasons',
        header: t('admin.ops.outages.colReason', 'Reason'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.reasons.join(', ') || '—'}</span>,
      },
      {
        accessorKey: 'affected',
        header: t('admin.ops.outages.colAffected', 'Affected'),
        cell: ({ row }) => (
          <span className="text-foreground font-medium tabular-nums">
            {row.original.affected}
            <span className="text-muted-foreground/60"> {t('admin.ops.outages.ofOnus', '/ {n} ONUs', { n: row.original.totalOnus })}</span>
          </span>
        ),
      },
      {
        accessorKey: 'since',
        header: t('admin.ops.outages.colDownSince', 'Down since'),
        cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{fmtDateTime(row.original.since)}</span>,
      },
      {
        accessorKey: 'lastSync',
        header: t('admin.ops.outages.colLastSync', 'Last OLT sync'),
        cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{fmtDateTime(row.original.lastSync)}</span>,
      },
    ],
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState variant="error" title={t('admin.ops.outages.loadFailed', 'Failed to load outages')} description={errorMessage(error)} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;
  }

  const summary = data?.summary;

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.ops.outages.title', 'Outage Board')}
        subtitle={t('admin.ops.outages.subtitle', 'PON ports with offline ONUs and customer impact, from the latest OLT sync')}
        breadcrumb={[{ label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' }, { label: t('admin.ops.outages.title', 'Outage Board') }]}
      />
      <OpsSummaryStrip
        items={[
          { value: formatCount((summary?.outages ?? 0)), label: t('admin.ops.outages.kpiPons', 'PONs affected') },
          { value: formatCount((summary?.affectedOnus ?? 0)), label: t('admin.ops.outages.kpiOffline', 'ONUs offline') },
          { value: formatCount((summary?.totalOnus ?? 0)), label: t('admin.ops.outages.kpiMonitored', 'ONUs monitored') },
        ]}
      />
      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.outages.searchPlaceholder', 'Search OLT, PON or reason…')}
        emptyTitle={table.search ? t('admin.ops.outages.emptyFiltered', 'No outages match your search') : t('admin.ops.outages.emptyNone', 'No offline ONUs')}
        emptyDescription={t('admin.ops.outages.emptyHint', 'Every synchronized ONU reported online at the last OLT sync.')}
        server={table.server(data?.meta.total ?? 0)}
      />
    </div>
  );
}
