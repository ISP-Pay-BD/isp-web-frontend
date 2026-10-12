'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import Link from 'next/link';
import { useCustomer, useCustomerAudit } from '@/features/admin/customers/hooks/use-customers';
import type { AuditEvent } from '@/features/admin/customers/types';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { buttonVariants } from '@/components/ui/button';
import { errorMessage } from '@/lib/api/utils/error-handler';

export function CustomerAuditPage({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const customerQuery = useCustomer(customerId, { compact: true });
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerAudit(customerId, page, pageSize);

  const columns = useMemo<LegacyColumnDef<AuditEvent, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'When',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.createdAt ? new Date(row.original.createdAt.replace(' ', 'T')).toLocaleString() : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) => <span className="text-sm">{row.original.actor || '—'}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium text-sm">{row.original.action || '—'}</span>,
      },
      {
        accessorKey: 'details',
        header: 'Detail',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.details || row.original.entity || '—'}
            {row.original.router ? ` · ${row.original.router}` : ''}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress || '—'}</span>,
      },
    ],
    [],
  );

  if (customerQuery.isLoading || isLoading) return <PageSkeleton variant="table" />;
  if (isError || customerQuery.isError || !customerQuery.data) {
    return (
      <EmptyState
        title="Failed to load audit"
        description={errorMessage(error ?? customerQuery.error)}
        actionLabel="Retry"
        onAction={() => {
          customerQuery.refetch();
          refetch();
        }}
      />
    );
  }

  const customer = customerQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Audit"
        subtitle={`${customer.name} · change history`}
        breadcrumb={[
          { label: 'Customers', url: '/admin/customers' },
          { label: customer.name, url: `/admin/customers/${customerId}` },
          { label: 'Audit' },
        ]}
        actions={
          <Link href={`/admin/customers/${customerId}`} className={buttonVariants({ variant: 'outline' })}>
            Back
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isFetching && !data}
        emptyTitle="No audit events"
        emptyDescription="Changes to this customer will appear here."
        server={{
          page,
          pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </div>
  );
}
