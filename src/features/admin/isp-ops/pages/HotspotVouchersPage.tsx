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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Row = IspOpsData['hotspotVouchers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.code).toLowerCase().includes(q) ||
    String(r.profile).toLowerCase().includes(q) ||
    String(r.validityHours).toLowerCase().includes(q) ||
    String(r.batch).toLowerCase().includes(q)
  );
};

export function HotspotVouchersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.code)}</span>,
      },
      {
        accessorKey: 'profile',
        header: 'Profile',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.profile)}</span>,
      },
      {
        accessorKey: 'validityHours',
        header: 'Hours',
        cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{String(row.original.validityHours)}</span>,
      },
      {
        accessorKey: 'batch',
        header: 'Batch',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.batch)}</span>,
      },
      {
        accessorKey: 'used',
        header: 'Used',
        
        cell: ({ row }) => <span className="text-sm">{String(row.original.used)}</span>,
      }
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.hotspotVouchers;
  const unused = rows.filter((r) => !r.used).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Vouchers"
        subtitle="Batch voucher codes for captive hotspot"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: "Hotspot Vouchers" }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Voucher batch queued (mock)')}>
            Generate batch
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {rows.length} vouchers · {unused} unused
      </p>
      <DataTable
        columns={columns}
        data={rows}
        searchKey="code"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search…"
      />
    </div>
  );
}
