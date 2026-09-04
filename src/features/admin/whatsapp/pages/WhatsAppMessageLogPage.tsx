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
import type { WhatsAppMessageLog } from '@/data/admin/comms.data';

const logSearchFilter = (
  row: LegacyRow<WhatsAppMessageLog>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const log = row.original;
  return (
    log.phone.toLowerCase().includes(q) ||
    log.category.toLowerCase().includes(q) ||
    (log.templateName?.toLowerCase().includes(q) ?? false) ||
    log.provider.toLowerCase().includes(q) ||
    log.status.toLowerCase().includes(q)
  );
};

export function WhatsAppMessageLogPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();

  const columns = useMemo<LegacyColumnDef<WhatsAppMessageLog, unknown>[]>(
    () => [
      {
        accessorKey: 'phone',
        header: 'Phone',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.direction}</Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        id: 'templateName',
        accessorFn: (row) => row.templateName ?? '—',
        header: 'Template',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.templateName ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        cell: ({ row }) => (
          <span className="uppercase text-xs">{row.original.provider}</span>
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
                status === 'failed'
                  ? 'destructive'
                  : status === 'read'
                    ? 'default'
                    : 'secondary'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'sentAt',
        header: 'Sent At',
        cell: ({ row }) => (
          <span className="text-xs">{new Date(row.original.sentAt).toLocaleString()}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load message log" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Message Log"
        subtitle="Delivery audit trail for inbound and outbound messages"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Message Log' },
        ]}
      />
      <WhatsAppNavLinks />
      <DataTable
        columns={columns}
        data={data.logs}
        getRowId={(row) => row.id}
        searchKey="phone"
        searchPlaceholder="Search phone, template, status..."
        searchFilterFn={logSearchFilter}
        facetFilters={[
          { columnId: 'direction', title: 'Direction' },
          { columnId: 'status', title: 'Status' },
          { columnId: 'category', title: 'Category' },
        ]}
        emptyTitle="No message logs"
        emptyDescription="Outbound and inbound WhatsApp messages will appear here."
      />
    </div>
  );
}
