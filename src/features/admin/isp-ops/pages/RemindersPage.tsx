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

type Row = IspOpsData['reminders'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.channel).toLowerCase().includes(q) ||
    String(r.template).toLowerCase().includes(q) ||
    String(r.dueBdt).toLowerCase().includes(q)
  );
};

export function RemindersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        enableHiding: false,
        cell: ({ row }) => <span className="text-sm">{String(row.original.customerName)}</span>,
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.channel)}</Badge>
        ),
      },
      {
        accessorKey: 'template',
        header: 'Template',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.template)}</span>,
      },
      {
        accessorKey: 'dueBdt',
        header: 'Due BDT',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.dueBdt)}</span>,
      },
      {
        accessorKey: 'scheduledAt',
        header: 'Scheduled',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.scheduledAt)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.status)}</Badge>
        ),
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.reminders;
  const queued = rows.filter((r) => r.status === 'queued').length;
  const due = rows.reduce((s, r) => s + r.dueBdt, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Due Reminders"
        subtitle="Collection reminder queue across SMS, WhatsApp, voice"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Due Reminders" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "reminders" },
          { value: queued, label: "queued" },
          { value: due.toLocaleString(), label: "৳ due" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="customerName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
