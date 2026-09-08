'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Receipt,
  Download,
  Wallet,
  CheckCircle2,
  Hourglass,
  Copy,
  Smartphone,
  FileText,
  Printer,
} from 'lucide-react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { useCustomerPayments } from '../hooks/use-customer-payments';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Payment } from '@/data/shared/types';

const paymentSearchFilter = (
  row: LegacyRow<Payment>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.customerName.toLowerCase().includes(q) ||
    p.invoiceNo.toLowerCase().includes(q) ||
    (p.note ?? '').toLowerCase().includes(q)
  );
};

export function CustomerPaymentsPage() {
  const { data, isLoading, isError, refetch } = useCustomerPayments();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const items = data?.items ?? [];

  const totalCollected = useMemo(
    () => items.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amountBdt, 0),
    [items],
  );
  const pendingCount = useMemo(
    () => items.filter((p) => p.status === 'pending').length,
    [items],
  );
  const mfsVolume = useMemo(
    () =>
      items
        .filter((p) => p.method === 'bkash' || p.method === 'nagad')
        .reduce((s, p) => s + p.amountBdt, 0),
    [items],
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice No',
      'Customer Name',
      'Customer ID',
      'Amount (BDT)',
      'Method',
      'Status',
      'Date',
      'Note',
    ];
    const rows = items.map((p) => [
      p.invoiceNo,
      p.customerName,
      p.customerId,
      p.amountBdt,
      p.method,
      p.status,
      p.paidAt,
      p.note ?? '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `customer_payments_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payment ledger exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Payment, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice #',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                  <span>{payment.invoiceNo}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(payment.invoiceNo, 'Invoice')}
                    className="hover:text-primary transition-colors"
                    title="Copy invoice number"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  {formatDateTime(payment.paidAt)}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'customerName',
        header: 'Subscriber',
        size: 160,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-foreground">{row.original.customerName}</div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {row.original.customerId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 110,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-sm text-foreground">
            <CurrencyDisplay amount={row.original.amountBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Payment Method',
        size: 130,
        cell: ({ row }) => {
          const method = row.original.method;
          const isBkash = method === 'bkash';
          const isNagad = method === 'nagad';
          const isCash = method === 'cash';
          const isBank = method === 'bank';
          const isCard = method === 'sslcommerz';
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border',
                isBkash && 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                isNagad && 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                isCash &&
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                isBank && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                isCard && 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isBkash
                    ? '#e2136e'
                    : isNagad
                      ? '#f7941d'
                      : isCash
                        ? '#10b981'
                        : isBank
                          ? '#3b82f6'
                          : '#6366f1',
                }}
              />
              {method.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'note',
        header: 'Transaction / Note',
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[200px] block">
            {row.original.note ?? '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Receipt</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPayment(row.original)}
              className="h-7 text-xs text-primary hover:bg-primary/10"
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              View
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load payments"
        description="Could not fetch payment records from ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="Customer Payments"
        subtitle="Broadband subscriber collection ledger — bKash, Nagad, cash handovers, and bank deposits"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customer Payments' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>
            <Can menu="customer_payment" action="create">
              <Link href="/admin/customer-payments/new">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Record Payment
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay amount={totalCollected} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">collections · {items.length} receipts</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay amount={mfsVolume} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">MFS gateway</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{pendingCount}</span>{' '}
          <span className="text-muted-foreground">pending clearances</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            ৳{items.length ? Math.round(totalCollected / items.length).toLocaleString() : '0'}
          </span>{' '}
          <span className="text-muted-foreground">avg / receipt</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        searchKey="invoiceNo"
        searchPlaceholder="Search by invoice #, customer name, or TrxID..."
        searchFilterFn={paymentSearchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Status' },
          { columnId: 'method', title: 'Method' },
        ]}
        emptyTitle="No payment records"
        emptyDescription="No payment records found matching your filters."
      />

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Payment Receipt</DialogTitle>
                  <DialogDescription className="text-xs font-mono">
                    {selectedPayment?.invoiceNo}
                  </DialogDescription>
                </div>
              </div>
              {selectedPayment && <StatusBadge status={selectedPayment.status} />}
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscriber:</span>
                  <span className="font-bold text-foreground">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscriber ID:</span>
                  <span className="font-mono text-foreground">{selectedPayment.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-semibold text-foreground">
                    {formatDateTime(selectedPayment.paidAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold uppercase">{selectedPayment.method}</span>
                </div>
                {selectedPayment.note && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference / TrxID:</span>
                    <span className="font-mono font-bold text-foreground">{selectedPayment.note}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono text-primary text-base">
                  ৳{selectedPayment.amountBdt.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Receipt for ${selectedPayment.invoiceNo} downloaded`);
                    setSelectedPayment(null);
                  }}
                  className="text-xs font-semibold"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
