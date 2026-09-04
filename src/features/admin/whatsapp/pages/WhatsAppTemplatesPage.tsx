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
import type { WhatsAppTemplate } from '@/data/admin/comms.data';

const templateSearchFilter = (
  row: LegacyRow<WhatsAppTemplate>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const t = row.original;
  return (
    t.name.toLowerCase().includes(q) ||
    t.body.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.language.toLowerCase().includes(q)
  );
};

export function WhatsAppTemplatesPage() {
  const { data, isLoading, isError, refetch } = useWhatsApp();

  const columns = useMemo<LegacyColumnDef<WhatsAppTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category}</Badge>
        ),
      },
      {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ row }) => (
          <span className="uppercase text-xs">{row.original.language}</span>
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
                status === 'APPROVED'
                  ? 'default'
                  : status === 'REJECTED'
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
        accessorKey: 'body',
        header: 'Body',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground max-w-sm line-clamp-2 block">
            {row.original.body}
          </span>
        ),
      },
      {
        accessorKey: 'lastUpdated',
        header: 'Updated',
        cell: ({ row }) => (
          <span className="text-xs">{row.original.lastUpdated}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load templates" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Templates"
        subtitle="Meta-approved message templates for utility, auth, and marketing"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'WhatsApp' },
          { label: 'Templates' },
        ]}
      />
      <WhatsAppNavLinks />
      <DataTable
        columns={columns}
        data={data.templates}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search templates..."
        searchFilterFn={templateSearchFilter}
        facetFilters={[
          { columnId: 'category', title: 'Category' },
          { columnId: 'status', title: 'Status' },
        ]}
        emptyTitle="No templates"
        emptyDescription="Approved Meta templates will appear in the registry."
      />
    </div>
  );
}
