'use client';

import { useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { WhatsAppNavLinks } from './WhatsAppInboxPage';
import { useWhatsApp } from '../hooks/use-whatsapp';
import type { WhatsAppCampaign } from '@/data/admin/comms.data';

const campaignSearchFilter = (
  row: LegacyRow<WhatsAppCampaign>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const c = row.original;
  return (
    c.name.toLowerCase().includes(q) ||
    c.templateName.toLowerCase().includes(q) ||
    c.status.toLowerCase().includes(q)
  );
};

export function WhatsAppCampaignsPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();

  const columns = useMemo<LegacyColumnDef<WhatsAppCampaign, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Campaign',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'templateName',
        header: 'Template',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.templateName}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === 'completed'
                  ? 'default'
                  : status === 'failed'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'recipients',
        accessorFn: (row) => `${row.sentCount}/${row.totalRecipients}`,
        header: 'Recipients',
        cell: ({ row }) => (
          <span className="font-mono">
            {row.original.sentCount}/{row.original.totalRecipients}
          </span>
        ),
      },
      {
        accessorKey: 'deliveredCount',
        header: 'Delivered',
        cell: ({ row }) => (
          <span className="font-mono text-emerald-600">{row.original.deliveredCount}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs">{new Date(row.original.createdAt).toLocaleString()}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load campaigns" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Campaigns"
        subtitle="Bulk template campaigns with delivery analytics"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Campaigns' },
        ]}
      />
      <WhatsAppNavLinks />
      <DataTable
        columns={columns}
        data={data.campaigns}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search campaigns..."
        searchFilterFn={campaignSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No campaigns"
        emptyDescription="Bulk WhatsApp campaigns will appear here."
      />
    </div>
  );
}
