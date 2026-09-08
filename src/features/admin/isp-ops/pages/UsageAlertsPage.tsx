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

type Row = IspOpsData['usageAlertRules'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.thresholdPct).toLowerCase().includes(q) ||
    String(r.channel).toLowerCase().includes(q) ||
    String(r.enabled).toLowerCase().includes(q)
  );
};

export function UsageAlertsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Rule',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.name)}</span>,
      },
      {
        accessorKey: 'thresholdPct',
        header: 'Threshold %',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.thresholdPct)}</span>,
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.channel)}</span>,
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

  const rows = data.usageAlertRules;
  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usage Alert Rules"
        subtitle="FUP threshold notifications"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Usage Alert Rules" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "rules" },
          { value: enabled, label: "enabled" },
        ]}
      />
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
