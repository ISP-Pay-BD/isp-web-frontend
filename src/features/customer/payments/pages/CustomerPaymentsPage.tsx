'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  CreditCard,
  Receipt,
  Printer,
  Wallet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
} from '@/features/customer/shared';
import { DataTable } from '@/features/shared/data-table';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import type { Payment } from '@/data/shared/types';
import { toast } from 'sonner';

const customerPaymentSearchFilter = (
  row: LegacyRow<Payment>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.invoiceNo.toLowerCase().includes(q) ||
    (p.note ?? '').toLowerCase().includes(q) ||
    p.method.toLowerCase().includes(q)
  );
};

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useCustomerPayments();
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  const payments = data?.payments ?? [];

  const columns = useMemo<LegacyColumnDef<Payment, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice No',
        size: 140,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-primary">{row.original.invoiceNo}</span>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: 'Payment Date',
        size: 120,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.paidAt)}</span>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 110,
        cell: ({ row }) => (
          <span className="font-bold">{formatBdtWithSymbol(row.original.amountBdt)}</span>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Gateway',
        size: 110,
        cell: ({ row }) => (
          <span className="capitalize font-medium text-xs rounded-md bg-muted px-2 py-1">
            {row.original.method}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'completed'
                ? 'default'
                : row.original.status === 'pending'
                  ? 'secondary'
                  : 'destructive'
            }
            className="text-[11px] capitalize"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'note',
        header: 'Trx Note',
        size: 180,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] block">
            {row.original.note ?? '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 110,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedInvoice(row.original)}
              className="h-8 gap-1.5 text-xs"
            >
              <Receipt className="h-3.5 w-3.5" />
              Invoice
            </Button>
          </div>
        ),
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
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { summary } = data;

  const handlePrint = () => {
    toast.success('Preparing invoice for printing/download...');
    window.print();
  };

  return (
    <CustomerPageShell
      title="Payment History"
      subtitle="Track all your monthly internet recharges, payment method TrxIDs, and official tax invoices."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Paid
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatBdtWithSymbol(summary.totalPaidBdt)}
                </h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {summary.successfulCount} successful invoices
                </span>
              </div>
              <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Pending Due
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                  {formatBdtWithSymbol(summary.pendingDueBdt)}
                </h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {summary.pendingCount} pending payment
                </span>
              </div>
              <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Payment Gateways
                </p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">bKash / Nagad</h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Instant automated recharge
                </span>
              </div>
              <div className="rounded-xl p-3 bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Invoicing Method
                </p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">Monthly Pre-paid</h3>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Cycle renews on 1st of month
                </span>
              </div>
              <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Receipt className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={payments}
          getRowId={(row) => row.id}
          searchKey="invoiceNo"
          searchPlaceholder="Search invoice number, TrxID, method..."
          searchFilterFn={customerPaymentSearchFilter}
          facetFilters={[{ columnId: 'status', title: 'Status' }]}
          emptyTitle="No payments found"
          emptyDescription="There are no transaction records matching your current search or filter criteria."
        />

        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-md print:max-w-none print:m-0">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Official Receipt</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedInvoice?.invoiceNo}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6 pt-2">
                <div className="border-b pb-4 space-y-1 text-center">
                  <h3 className="font-black text-lg text-primary tracking-tight">
                    ISP Pay BD Network
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Licensed Internet Service Provider · Uttara Central POP, Dhaka
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    BIN / Tax No: 001847291-0101
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Billed To:</span>
                    <div className="font-bold text-sm mt-0.5">{selectedInvoice.customerName}</div>
                    <div className="text-muted-foreground font-mono">
                      ID: {selectedInvoice.customerId}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Date of Payment:</span>
                    <div className="font-bold mt-0.5">{formatDate(selectedInvoice.paidAt)}</div>
                    <div className="text-muted-foreground capitalize">
                      Via {selectedInvoice.method}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Broadband Subscription Recharge</span>
                    <span>{formatBdtWithSymbol(selectedInvoice.amountBdt)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Includes 5% Govt VAT / SD</span>
                    <span>৳0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-sm">
                    <span>Total Paid</span>
                    <span className="text-primary">
                      {formatBdtWithSymbol(selectedInvoice.amountBdt)}
                    </span>
                  </div>
                </div>

                {selectedInvoice.note && (
                  <div className="rounded-md bg-muted/40 p-2.5 text-xs font-mono text-muted-foreground">
                    Transaction ID: {selectedInvoice.note}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Verified electronically
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="gap-1.5 text-xs"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedInvoice(null)}
                      className="text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPageShell>
  );
}
