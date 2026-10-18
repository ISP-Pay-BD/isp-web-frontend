'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import type { CustomerPayment, CustomerPaymentStatus } from '@/lib/api/adapters/customer.adapter';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';

const STATUS_LABEL: Record<CustomerPaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  unknown: 'Unknown',
};

const STATUS_VARIANT: Record<CustomerPaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  pending: 'secondary',
  failed: 'destructive',
  unknown: 'outline',
};

export function CustomerPaymentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerPayments({ page, perPage: pageSize });

  const columns = useMemo<LegacyColumnDef<CustomerPayment, unknown>[]>(
    () => [
      {
        accessorKey: 'invoice',
        header: 'Invoice No',
        size: 140,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">{row.original.invoice || `#${row.original.id}`}</span>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: 'Date',
        size: 120,
        cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.paidAt)}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 110,
        cell: ({ row }) => <span className="font-bold">{formatBdtWithSymbol(row.original.amountBdt)}</span>,
      },
      {
        accessorKey: 'method',
        header: 'Paid via',
        size: 110,
        cell: ({ row }) =>
          row.original.method ? (
            <span className="capitalize font-medium text-xs rounded-md bg-muted px-2 py-1">{row.original.method}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} className="text-[11px]">
            {STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'trxId',
        header: 'TrxID',
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] block">
            {row.original.trxId || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 110,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.status === 'paid' ? (
            <div className="flex justify-end">
              <Link href={`/customer/payments/${row.original.id}/invoice`}>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Receipt className="h-3.5 w-3.5" />
                  Invoice
                </Button>
              </Link>
            </div>
          ) : null,
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <CustomerPageShell title="My Payments" subtitle="Loading invoice and transaction history...">
        <CustomerLoadingSkeleton variant="payments" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="My Payments" subtitle="Billing & Invoice Center">
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  return (
    <CustomerPageShell
      title="Payment History"
      subtitle="Your recharges, payment method TrxIDs, and invoices for settled payments."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Payments' },
      ]}
      actions={
        <Link href="/customer/payments/pay">
          <Button className="font-semibold shadow-sm gap-2">
            <CreditCard className="h-4 w-4" />
            Make a Payment
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{data.meta.total}</span>{' '}
            <span className="text-muted-foreground">payments on record</span>
          </p>
          <p className="text-muted-foreground">Invoices are available once a payment is settled.</p>
        </div>

        <DataTable
          columns={columns}
          data={data.items}
          isLoading={isFetching && data.items.length === 0}
          getRowId={(row) => row.id}
          emptyTitle="No payments yet"
          emptyDescription="Payments you make or submit for verification will appear here."
          server={{
            page,
            pageSize,
            total: data.meta.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
          }}
        />
      </div>
    </CustomerPageShell>
  );
}
