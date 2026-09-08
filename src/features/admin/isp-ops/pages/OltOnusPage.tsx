'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { OltOnu } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<OltOnu>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.sn.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
};

export function OltOnusPage() {
  const params = useParams<{ id: string }>();
  const oltId = params.id ?? 'olt_01';
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<OltOnu, unknown>[]>(
    () => [
      {
        accessorKey: 'sn',
        header: 'Serial',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sn}</span>,
      },
      { accessorKey: 'customerName', header: 'Customer' },
      {
        accessorKey: 'rxDbm',
        header: 'Rx dBm',
        cell: ({ row }) => <span className="tabular-nums font-mono text-xs">{row.original.rxDbm}</span>,
      },
      {
        accessorKey: 'txDbm',
        header: 'Tx dBm',
        cell: ({ row }) => <span className="tabular-nums font-mono text-xs">{row.original.txDbm}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'online' ? 'default' : 'destructive'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`Provisioned ${row.original.sn} (mock)`)}
          >
            Provision
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load ONUs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.oltOnus.filter((o) => o.oltId === oltId || oltId === 'olt_01');
  const online = rows.filter((r) => r.status === 'online').length;
  const los = rows.filter((r) => r.status === 'los').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="ONU optical power"
        subtitle={`OLT ${oltId} — discovery & provision`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'OLT', url: '/admin/olt' },
          { label: 'ONUs' },
        ]}
        actions={
          <Button size="sm" onClick={() => toast.success('ONU discovery scan started (mock)')}>
            Discover
          </Button>
        }
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "ONUs" },
          { value: online, label: "online" },
          { value: los, label: "LOS" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="sn"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search SN / customer…"
      />
    </div>
  );
}
