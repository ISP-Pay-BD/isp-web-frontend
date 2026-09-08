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
import type { KycDoc } from '@/data/admin/isp-ops.data';

const searchFilter = (row: LegacyRow<KycDoc>, _c: string, v: unknown) => {
  const q = String(v ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return r.fileName.toLowerCase().includes(q) || r.type.includes(q);
};

export function CustomerKycPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id ?? 'cust_001';
  const { data, isLoading, isError, refetch } = useIspOps();

  const columns = useMemo<LegacyColumnDef<KycDoc, unknown>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        enableHiding: false,
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      { accessorKey: 'fileName', header: 'File' },
      {
        accessorKey: 'uploadedAt',
        header: 'Uploaded',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.uploadedAt}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success(`Verified ${row.original.fileName} (mock)`)}
          >
            Verify
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load KYC" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const rows = data.kycDocs.filter((d) => d.customerId === customerId || customerId === 'cust_001');
  const pending = rows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="KYC vault"
        subtitle={`Documents for ${customerId}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: customerId, url: `/admin/customers/${customerId}` },
          { label: 'KYC' },
        ]}
      />
      <OpsSummaryStrip
        items={[
          { value: rows.length, label: "docs" },
          { value: pending, label: "pending" },
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        searchKey="fileName"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search files…"
      />
    </div>
  );
}
