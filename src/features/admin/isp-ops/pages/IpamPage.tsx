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

type Row = IspOpsData['ipamBlocks'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.cidr).toLowerCase().includes(q) ||
    String(r.family).toLowerCase().includes(q) ||
    String(r.used).toLowerCase().includes(q) ||
    String(r.total).toLowerCase().includes(q)
  );
};

export function IpamPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'cidr',
        header: 'CIDR',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.cidr)}</span>,
      },
      {
        accessorKey: 'family',
        header: 'Family',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{String(row.original.family)}</Badge>
        ),
      },
      {
        accessorKey: 'used',
        header: 'Used',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.used)}</span>,
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.total)}</span>,
      },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.purpose)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.ipamBlocks;
  const used = rows.reduce((s, r) => s + r.used, 0);
  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="IPAM"
        subtitle="IPv4 and IPv6 block utilization"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "IPAM" }]}
        
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "blocks" },
          { value: used.toLocaleString(), label: "/{total.toLocaleString()} IPs used" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="cidr"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
