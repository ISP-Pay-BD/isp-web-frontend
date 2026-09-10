'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  CreditCard,
  Receipt,
  Printer,
  Download,
  CheckCircle2,
} from 'lucide-react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Button } from '@/components/ui/button';
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
    toast.success('Preparing official invoice document for printing...');
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
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{formatBdtWithSymbol(summary.totalPaidBdt)}</span>{' '}
            <span className="text-muted-foreground">paid · {summary.successfulCount} invoices</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">{formatBdtWithSymbol(summary.pendingDueBdt)}</span>{' '}
            <span className="text-muted-foreground">pending · {summary.pendingCount}</span>
          </p>
          <p className="text-muted-foreground">
            Gateways <span className="font-medium text-foreground">bKash / Nagad</span>
          </p>
          <p className="text-muted-foreground">
            Cycle <span className="font-medium text-foreground">monthly pre-paid</span>
          </p>
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

        {/* Screen Dialog View */}
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-md">
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
                  <h3 className="font-bold text-lg text-primary tracking-tight">
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
                    <span>৳{(selectedInvoice.amountBdt - selectedInvoice.amountBdt / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-sm">
                    <span>Total Paid</span>
                    <span className="text-primary font-mono font-bold">
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
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="text-xs font-semibold gap-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print A4 Invoice
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success(`PDF receipt for ${selectedInvoice.invoiceNo} saved.`);
                        setSelectedInvoice(null);
                      }}
                      className="text-xs font-semibold"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* FORMAL A4 PRINTABLE TAX INVOICE & MONEY RECEIPT (Shown during window.print) */}
        {/* ========================================================================= */}
        {selectedInvoice && (
          <div id="printable-invoice-voucher" className="hidden print:block text-black bg-white p-8 max-w-[210mm] mx-auto font-sans">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-black">ISP PAY BD NETWORK (PVT) LTD.</h1>
                <p className="text-xs text-gray-700 font-medium">Nationwide Internet Service Provider · BTRC Category-A License</p>
                <p className="text-[11px] text-gray-600 mt-1">Head Office: House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh</p>
                <p className="text-[11px] text-gray-600">Support Hotline: 09678-000111 · Email: billing@isppaybd.com · Web: www.isppaybd.com</p>
                <p className="text-[10px] font-mono text-gray-800 font-bold mt-1">BIN: 003819283-0101 · TIN: 481920481920 · Mushak-6.3 Tax Invoice</p>
              </div>
              <div className="text-right border-2 border-black p-3 rounded bg-gray-50 min-w-[190px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800 border-b border-black pb-1 mb-1">
                  MONEY RECEIPT
                </div>
                <div className="text-sm font-mono font-black">{selectedInvoice.invoiceNo}</div>
                <div className="text-[10px] text-gray-600 mt-1">Date: {formatDate(selectedInvoice.paidAt)}</div>
                <div className="text-[10px] text-gray-600 font-bold uppercase">Status: {selectedInvoice.status.toUpperCase()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 p-3 border border-black rounded text-xs bg-gray-50/50">
              <div>
                <div className="font-bold text-gray-700 uppercase text-[10px] tracking-wider mb-1">SUBSCRIBER INFO:</div>
                <div className="font-black text-sm text-black">{selectedInvoice.customerName}</div>
                <div className="font-mono text-gray-800 mt-0.5">Subscriber ID: <strong>{selectedInvoice.customerId}</strong></div>
                <div className="text-gray-700 mt-0.5">Service: High-Speed Optical Fiber Internet (FTTH)</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-700 uppercase text-[10px] tracking-wider mb-1">PAYMENT DETAILS:</div>
                <div className="font-mono font-bold text-black uppercase">Via {selectedInvoice.method}</div>
                <div className="font-mono text-gray-800 mt-0.5">TrxID: {selectedInvoice.note || 'MFS-AUTO-SETTLED'}</div>
                <div className="text-gray-700 mt-0.5">Paid Date: {formatDate(selectedInvoice.paidAt)}</div>
              </div>
            </div>

            <div className="my-5">
              <table className="w-full text-xs border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100 border-b border-black text-black">
                    <th className="border border-black p-2 text-center w-12 font-bold">SL</th>
                    <th className="border border-black p-2 text-left font-bold">ITEM & DESCRIPTION</th>
                    <th className="border border-black p-2 text-center w-24 font-bold">PERIOD</th>
                    <th className="border border-black p-2 text-right w-24 font-bold">RATE (BDT)</th>
                    <th className="border border-black p-2 text-right w-20 font-bold">VAT (5%)</th>
                    <th className="border border-black p-2 text-right w-28 font-bold">TOTAL (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2.5 text-center font-mono font-bold">01</td>
                    <td className="border border-black p-2.5">
                      <div className="font-bold text-black">Monthly Broadband Internet Subscription</div>
                      <div className="text-[11px] text-gray-600">Bandwidth allocation, unlimited internet quota & FTTH maintenance</div>
                    </td>
                    <td className="border border-black p-2.5 text-center font-mono">1 Month</td>
                    <td className="border border-black p-2.5 text-right font-mono">
                      ৳{(selectedInvoice.amountBdt / 1.05).toFixed(2)}
                    </td>
                    <td className="border border-black p-2.5 text-right font-mono">
                      ৳{(selectedInvoice.amountBdt - selectedInvoice.amountBdt / 1.05).toFixed(2)}
                    </td>
                    <td className="border border-black p-2.5 text-right font-mono font-bold">
                      ৳{selectedInvoice.amountBdt.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-12 gap-4 my-4">
              <div className="col-span-7 space-y-3">
                <div className="p-3 border border-black rounded text-xs bg-gray-50/50">
                  <span className="font-bold text-black block mb-1">Amount in Words:</span>
                  <span className="italic font-semibold text-gray-900">
                    {selectedInvoice.amountBdt.toLocaleString()} Bangladeshi Taka Only (Inclusive of all Taxes & VAT).
                  </span>
                </div>
              </div>
              <div className="col-span-5">
                <table className="w-full text-xs border border-black border-collapse">
                  <tbody>
                    <tr className="bg-gray-100 font-black text-sm">
                      <td className="border border-black p-2">Total Paid:</td>
                      <td className="border border-black p-2 text-right font-mono text-base">
                        ৳{selectedInvoice.amountBdt.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-16 pt-6 grid grid-cols-2 gap-12 text-xs">
              <div className="text-center">
                <div className="border-t border-black pt-1.5 font-bold uppercase tracking-wider text-[11px]">
                  Subscriber Signature
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-1.5 font-bold uppercase tracking-wider text-[11px]">
                  Authorized Signatory & Accounts Seal
                </div>
                <div className="text-[10px] text-gray-500">ISP Pay BD Network (Pvt) Ltd.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
