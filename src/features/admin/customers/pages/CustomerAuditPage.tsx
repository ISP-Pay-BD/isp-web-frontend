'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { mockFetch } from '@/lib/mock-api/client';
import { useCustomer } from '@/features/admin/customers/hooks/use-customers';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import type { CustomerAuditEvent } from '@/data/admin/extras.data';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function CustomerAuditPage({ customerId }: { customerId: string }) {
  const { data: custData, isLoading: custLoading } = useCustomer(customerId);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'customerAudit'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'customerAudit');
      return res as { items: CustomerAuditEvent[] };
    },
  });

  const customer = custData?.customer;
  const items = useMemo(
    () => (data?.items ?? []).filter((e) => e.customerId === customerId),
    [data?.items, customerId],
  );

  const columns = useMemo<LegacyColumnDef<CustomerAuditEvent, unknown>[]>(
    () => [
      {
        accessorKey: 'at',
        header: 'When',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{new Date(row.original.at).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) => <span className="text-sm">{row.original.actor}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => <span className="font-medium text-sm">{row.original.action}</span>,
      },
      {
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.detail}</span>
        ),
      },
    ],
    [],
  );

  if (custLoading || isLoading) return <PageSkeleton variant="table" />;
  if (isError || !customer) {
    return <EmptyState title="Failed to load audit" actionLabel="Retry" onAction={() => refetch()} />;
  }

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
        data={items}
        searchKey="action"
        searchPlaceholder="Search actions…"
        emptyTitle="No audit events"
        emptyDescription="Changes to this customer will appear here."
      />
    </div>
  );
}
