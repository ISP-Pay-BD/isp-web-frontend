'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIspOps } from '../hooks/use-isp-ops';
import type { ReconcileRow } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<ReconcileRow>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.trxId.toLowerCase().includes(q) || r.gateway.toLowerCase().includes(q) || r.status.includes(q);
};

export function PaymentReconcilePage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<ReconcileRow, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.at}</span>,
      },
      { accessorKey: 'gateway', header: 'Gateway' },
      {
        accessorKey: 'trxId',
        header: 'Trx ID',
        enableHiding: false,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.trxId}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <span className="tabular-nums">{row.original.amountBdt.toLocaleString()} ৳</span>,
      },
      {
        accessorKey: 'matchedPaymentId',
        header: 'Payment',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.matchedPaymentId ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.status === 'unmatched' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Matched ${row.original.trxId} (mock)`)}
            >
              Match
            </Button>
          ) : null,
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load reconcile log" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const unmatched = data.reconcileRows.filter((r) => r.status === 'unmatched');
  const unmatchedTotal = unmatched.reduce((s, r) => s + r.amountBdt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment reconcile"
        subtitle="Gateway settlements vs customer payments"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Payments' },
          { label: 'Reconcile' },
        ]}
      />
      <p className="text-sm text-muted-foreground tabular-nums">
        {data.reconcileRows.length} rows · {unmatched.length} unmatched ·{' '}
        {unmatchedTotal.toLocaleString()} ৳ unmatched
      </p>
      <DataTable
        columns={columns}
        data={data.reconcileRows}
        searchKey="trxId"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search trx…"
      />
    </div>
  );
}
