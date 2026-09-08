'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Download,
  Receipt,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  Building,
  ShieldCheck,
} from 'lucide-react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { useTenantBilling } from '../hooks/use-tenant-billing';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TenantBillingPayment } from '@/data/admin/tenant-billing.data';

const invoiceSearchFilter = (
  row: LegacyRow<TenantBillingPayment>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.invoiceNo.toLowerCase().includes(q) ||
    p.planName.toLowerCase().includes(q) ||
    (p.note?.toLowerCase().includes(q) ?? false)
  );
};

export function AdminPaymentPage() {
  const { data, isLoading, isError, refetch } = useTenantBilling();
  const [selectedInvoice, setSelectedInvoice] = useState<TenantBillingPayment | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  useEffect(() => {
    if (!selectedInvoice) {
      const id = requestAnimationFrame(() => setReceiptVisible(false));
      return () => cancelAnimationFrame(id);
    }
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (!cancelled) setReceiptVisible(true);
      }, 50);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [selectedInvoice]);

  const items = data?.items ?? [];
  const summary = data?.summary;

  const completedCount = useMemo(
    () => items.filter((p) => p.status === 'completed').length,
    [items],
  );
  const pendingCount = useMemo(
    () => items.filter((p) => p.status === 'pending').length,
    [items],
  );

  const handleCopyInvoice = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast.success(`Invoice number ${invoiceNo} copied`);
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice No',
      'Plan',
      'Period',
      'Amount (BDT)',
      'Method',
      'Status',
      'Date',
      'Note',
    ];
    const rows = items.map((item) => [
      item.invoiceNo,
      item.planName,
      item.period,
      item.amountBdt,
      item.method,
      item.status,
      item.paidAt,
      item.note ?? '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `isppaybd_invoices_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<TenantBillingPayment, unknown>[]>(
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
                    onClick={() => handleCopyInvoice(payment.invoiceNo)}
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
        accessorKey: 'planName',
        header: 'Plan & Billing Cycle',
        size: 200,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.planName}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.period}</div>
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
          const isSsl = method === 'sslcommerz';
          const isBank = method === 'bank';
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border',
                isBkash && 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                isNagad && 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                isSsl && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                isBank &&
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isBkash
                    ? '#e2136e'
                    : isNagad
                      ? '#f7941d'
                      : isSsl
                        ? '#2563eb'
                        : '#10b981',
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
        header: 'Transaction Reference',
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-[11px]">
            {row.original.note ?? '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 130,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedInvoice(row.original)}
              className="h-7 text-xs text-primary hover:bg-primary/10"
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              View Receipt
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load payments"
        description="Could not fetch ISP Pay BD billing and subscription history."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Subscription Invoices & Payments"
        subtitle="Manage your ISP Pay BD platform licensing invoices, receipts, and payment transactions."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Subscription', url: '/admin/subscription' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>
            <Link href="/admin/subscription">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs"
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Self Recharge
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay
              amount={summary?.totalPaidBdt ?? 0}
              className="inline font-semibold"
            />
          </span>{' '}
          <span className="text-muted-foreground">paid · {completedCount} invoices</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay
              amount={summary?.pendingBdt ?? 0}
              className="inline font-semibold"
            />
          </span>{' '}
          <span className="text-muted-foreground">pending · {pendingCount} awaiting</span>
        </p>
        <p>
          <span className="font-semibold">Pro SaaS</span>{' '}
          <span className="text-muted-foreground">active plan · up to 2,000 subs</span>
        </p>
        <p>
          <span className="font-semibold">bKash &amp; cards</span>{' '}
          <span className="text-muted-foreground">gateway channels</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        searchKey="invoiceNo"
        searchPlaceholder="Search invoice number, plan, or note..."
        searchFilterFn={invoiceSearchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Status' },
          { columnId: 'method', title: 'Method' },
        ]}
        emptyTitle="No subscription invoices"
        emptyDescription="No matching subscription invoices found."
      />

      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => {
          if (!open) {
            setReceiptVisible(false);
            setTimeout(() => setSelectedInvoice(null), 200);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border-border/80 shadow-[var(--shadow-md)]">
          {selectedInvoice && (
            <div
              className={cn(
                'transition-all duration-300 ease-out',
                receiptVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <div className="relative px-6 pt-5 pb-4 border-b">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-sm font-bold leading-tight">
                        Subscription Invoice Receipt
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <DialogDescription className="text-xs font-mono text-muted-foreground">
                          {selectedInvoice.invoiceNo}
                        </DialogDescription>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedInvoice.invoiceNo);
                            toast.success('Invoice number copied');
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy invoice number"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div className="px-6 py-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[10px] tracking-wide font-semibold">
                      Issued To
                    </span>
                    <div className="font-bold text-foreground text-sm">Demo ISP Dhaka</div>
                    <div className="text-[11px] text-muted-foreground">Uttara NOC, Dhaka 1230</div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-muted-foreground text-[10px] tracking-wide font-semibold">
                      Payment Date
                    </span>
                    <div className="font-semibold text-foreground text-sm">
                      {formatDateTime(selectedInvoice.paidAt)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Cycle: {selectedInvoice.period}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 text-muted-foreground text-[10px] tracking-wide font-semibold">
                        <th className="text-left py-2 px-3.5">Description</th>
                        <th className="text-right py-2 px-3.5">Amount (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-t">
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-foreground">
                          {selectedInvoice.planName}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground">
                          ৳{selectedInvoice.amountBdt.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="py-2 px-3.5 text-muted-foreground">
                          Payment Gateway Fee (0% subsidized)
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono text-muted-foreground">
                          ৳0.00
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-foreground/10 bg-muted/30">
                        <td className="py-2.5 px-3.5 font-bold text-foreground">Total Amount Paid</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-base text-primary">
                          ৳{selectedInvoice.amountBdt.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] tracking-wide font-semibold text-muted-foreground">
                      Payment Gateway
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gateway Method</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[10px] border',
                        selectedInvoice.method === 'bkash' &&
                          'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20',
                        selectedInvoice.method === 'nagad' &&
                          'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20',
                        selectedInvoice.method === 'sslcommerz' &&
                          'bg-blue-500/10 text-blue-500 border-blue-500/20',
                        selectedInvoice.method === 'bank' &&
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            selectedInvoice.method === 'bkash'
                              ? '#e2136e'
                              : selectedInvoice.method === 'nagad'
                                ? '#f7941d'
                                : selectedInvoice.method === 'sslcommerz'
                                  ? '#2563eb'
                                  : '#10b981',
                        }}
                      />
                      {selectedInvoice.method.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gateway Reference</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedInvoice.note || 'Direct Merchant Settlement'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5 border-t bg-muted/20">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>ISP Pay BD Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-xs h-8"
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success(`Receipt for ${selectedInvoice.invoiceNo} downloaded`);
                      setSelectedInvoice(null);
                    }}
                    className="text-xs h-8 font-semibold"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
