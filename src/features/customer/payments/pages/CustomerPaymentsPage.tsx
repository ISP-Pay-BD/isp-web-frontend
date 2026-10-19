'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Button } from '@/components/ui/button';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import type { CustomerPayment } from '@/lib/api/adapters/customer.adapter';
import { formatBdtWithSymbol, formatCount, formatDate } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

export function CustomerPaymentsPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerPayments({ page, perPage: pageSize });

  const columns = useMemo<LegacyColumnDef<CustomerPayment, unknown>[]>(
    () => [
      {
        accessorKey: 'invoice',
        header: t('customer.payments.col.invoice', 'Invoice No'),
        size: 140,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">{row.original.invoice || `#${row.original.id}`}</span>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: t('customer.payments.col.date', 'Date'),
        size: 120,
        cell: ({ row }) => <span className="text-muted-foreground max-md:text-foreground">{formatDate(row.original.paidAt)}</span>,
      },
      {
        accessorKey: 'amountBdt',
        header: t('customer.payments.col.amount', 'Amount'),
        size: 110,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <span className="font-bold tabular-nums max-md:text-lg">{formatBdtWithSymbol(row.original.amountBdt)}</span>
        ),
      },
      {
        accessorKey: 'method',
        header: t('customer.payments.col.method', 'Paid via'),
        size: 110,
        cell: ({ row }) =>
          row.original.method ? (
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize">{row.original.method}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: t('customer.payments.col.status', 'Status'),
        size: 110,
        meta: { mobile: 'status' },
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'trxId',
        header: t('customer.payments.col.trxId', 'TrxID'),
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs break-all text-muted-foreground max-md:text-foreground md:block md:max-w-[200px] md:truncate">
            {row.original.trxId || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('customer.payments.col.actions', 'Actions')}</span>,
        size: 110,
        enableSorting: false,
        enableHiding: false,
        meta: { mobile: 'actions' },
        cell: ({ row }) =>
          row.original.status === 'paid' ? (
            <div className="flex w-full justify-end">
              <Button
                variant="outline"
                className="h-11 gap-2 max-md:w-full md:h-8"
                aria-label={t('customer.payments.viewInvoice', 'View invoice {number}', {
                  number: row.original.invoice || `#${row.original.id}`,
                })}
                render={<Link href={`/customer/payments/${row.original.id}/invoice`} />}
              >
                <Receipt className="h-4 w-4" />
                {t('customer.payments.invoice', 'Invoice')}
              </Button>
            </div>
          ) : null,
      },
    ],
    [t],
  );

  const title = t('customer.payments.title', 'Payment history');

  if (isLoading) {
    return (
      <CustomerPageShell title={title} subtitle={t('customer.payments.loading', 'Loading your invoices and payment history…')}>
        <CustomerLoadingSkeleton variant="payments" />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={title}>
        <CustomerErrorState
          message={
            error?.message ||
            t('customer.payments.loadError', 'Could not load your payment history. Check your connection and try again.')
          }
          onRetry={() => refetch()}
        />
      </CustomerPageShell>
    );
  }

  return (
    <CustomerPageShell
      title={title}
      subtitle={t('customer.payments.subtitle', 'Your recharges, payment TrxIDs and invoices for settled payments.')}
      breadcrumbs={[
        { label: t('customer.nav.home', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.nav.payments', 'Payments') },
      ]}
      actions={
        <Button className="h-11 w-full gap-2 font-semibold sm:h-9 sm:w-auto" render={<Link href="/customer/payments/pay" />}>
          <CreditCard className="h-4 w-4" />
          {t('customer.payments.makePayment', 'Pay bill')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="text-muted-foreground">{t('customer.payments.countLabel', 'Payments on record')}</span>{' '}
            <span className="font-semibold tabular-nums">{formatCount(data.meta.total)}</span>
          </p>
          <p className="text-muted-foreground">
            {t('customer.payments.invoiceHint', 'Invoices are available once a payment is settled.')}
          </p>
        </div>

        <DataTable
          urlState
          columns={columns}
          data={data.items}
          isLoading={isFetching && data.items.length === 0}
          getRowId={(row) => row.id}
          emptyTitle={t('customer.payments.emptyTitle', 'No payments yet')}
          emptyDescription={t(
            'customer.payments.emptyDescription',
            'Payments you make or submit for verification will appear here.',
          )}
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
