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
import { useTranslations } from '@/i18n/locale-context';

import { formatDateTime } from '@/lib/format';
export function CustomerAuditPage({ customerId }: { customerId: string }) {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const customerQuery = useCustomer(customerId, { compact: true });
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerAudit(customerId, page, pageSize);

  const columns = useMemo<LegacyColumnDef<AuditEvent, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('admin.customers.audit.colWhen', 'When'),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.createdAt ? formatDateTime(row.original.createdAt.replace(' ', 'T')) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'actor',
        header: t('admin.customers.audit.colActor', 'Actor'),
        cell: ({ row }) => <span className="text-sm">{row.original.actor || '—'}</span>,
      },
      {
        accessorKey: 'action',
        header: t('admin.customers.audit.colAction', 'Action'),
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium text-sm">{row.original.action || '—'}</span>,
      },
      {
        accessorKey: 'details',
        header: t('admin.customers.audit.colDetail', 'Detail'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.details || row.original.entity || '—'}
            {row.original.router ? ` · ${row.original.router}` : ''}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: t('admin.customers.audit.colIp', 'IP'),
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress || '—'}</span>,
      },
    ],
    [t],
  );

  if (customerQuery.isLoading || isLoading) return <PageSkeleton variant="table" />;
  if (isError || customerQuery.isError || !customerQuery.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.audit.loadFailed', 'Failed to load audit')}
        description={errorMessage(error ?? customerQuery.error)}
        actionLabel={t('admin.customers.audit.retry', 'Retry')}
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
        title={t('admin.customers.audit.title', 'Customer Audit')}
        subtitle={`${customer.name} · ${t('admin.customers.audit.subtitle', 'change history')}`}
        breadcrumb={[
          { label: t('admin.customers.audit.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: customer.name, url: `/admin/customers/${customerId}` },
          { label: t('admin.customers.audit.breadcrumb', 'Audit') },
        ]}
        actions={
          <Link href={`/admin/customers/${customerId}`} className={buttonVariants({ variant: 'outline' })}>
            {t('admin.customers.audit.back', 'Back')}
          </Link>
        }
      />
      <DataTable urlState
        columns={columns}
        data={data?.items ?? []}
        isLoading={isFetching && !data}
        emptyTitle={t('admin.customers.audit.emptyTitle', 'No audit events')}
        emptyDescription={t('admin.customers.audit.emptyHint', 'Changes to this customer will appear here.')}
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
