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

type Row = IspOpsData['usageReports'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.customerName).toLowerCase().includes(q) ||
    String(r.packageName).toLowerCase().includes(q) ||
    String(r.downloadGb).toLowerCase().includes(q) ||
    String(r.uploadGb).toLowerCase().includes(q)
  );
};

export function UsageReportPage() {
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
        accessorKey: 'packageName',
        header: 'Package',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.packageName)}</span>,
      },
      {
        accessorKey: 'downloadGb',
        header: 'DL GB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.downloadGb)}</span>,
      },
      {
        accessorKey: 'uploadGb',
        header: 'UL GB',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.uploadGb)}</span>,
      },
      {
        accessorKey: 'peakMbps',
        header: 'Peak Mbps',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.peakMbps)}</span>,
      },
      {
        accessorKey: 'period',
        header: 'Period',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.period)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.usageReports;
  const downloadGb = rows.reduce((s, r) => s + r.downloadGb, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bandwidth Usage"
        subtitle="Per-customer download / upload and peak rates"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Bandwidth Usage" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "customers" },
          { value: downloadGb.toLocaleString(), label: "GB down" },
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
