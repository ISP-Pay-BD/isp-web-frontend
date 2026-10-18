'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, Download, Copy, FileText, Printer, Send, Loader2 } from 'lucide-react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  downloadLedgerCsv,
  usePaymentReceipt,
  useCustomerPayments,
  useSendPaymentSms,
} from '../hooks/use-customer-payments';
import { PaymentReceiptA4 } from '../components/PaymentReceiptA4';
import { MethodPill } from '../components/MethodPill';
import { receiptSmsText } from '../lib/mappers';
import type { CustomerPaymentRow, LedgerFilters } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';

const METHOD_FILTERS = [
  { value: 'all', label: 'All methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'bank', label: 'Bank' },
  { value: 'ssl', label: 'SSLCommerz' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'successful', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
] as const;

export function CustomerPaymentsPage() {
  const [filters, setFilters] = useState<LedgerFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    status: 'all',
    method: 'all',
    from: '',
    to: '',
  });
  const { data, isLoading, isError, isFetching, refetch } = useCustomerPayments(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const receipt = usePaymentReceipt(selectedId);
  const sendSms = useSendPaymentSms();

  const patch = (next: Partial<LedgerFilters>) => setFilters((f) => ({ ...f, page: 1, ...next }));
  const summary = data?.summary;
  const items = data?.items ?? [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error('Clipboard is not available'));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadLedgerCsv(filters);
      toast.success('Ledger exported to CSV');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<CustomerPaymentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice #',
        size: 230,
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                  <button
                    type="button"
                    className="hover:text-primary transition-colors truncate"
                    onClick={() => setSelectedId(payment.id)}
                  >
                    {payment.invoiceNo}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(payment.invoiceNo, 'Invoice')}
                    className="hover:text-primary transition-colors text-muted-foreground"
                    title="Copy invoice number"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal">
                  {payment.createdAt ? formatDateTime(payment.paidAt ?? payment.createdAt) : '—'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 190,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-sm text-foreground">{row.original.customerName}</div>
            <div className="text-[11px] text-muted-foreground font-mono">
              ID: {row.original.customerId}
              {row.original.customerMobile ? ` · ${row.original.customerMobile}` : ''}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 120,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={row.original.amountBdt} />
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Method',
        size: 140,
        cell: ({ row }) => <MethodPill method={row.original.method} methodRaw={row.original.methodRaw} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'trxId',
        header: 'TrxID / Collector',
        size: 190,
        cell: ({ row }) => (
          <div className="text-[11px]">
            <div className="font-mono text-muted-foreground truncate max-w-[200px]">{row.original.trxId || '—'}</div>
            {row.original.collector ? <div className="text-muted-foreground">by {row.original.collector}</div> : null}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedId(row.original.id)}
              className="h-7 text-xs text-primary hover:bg-primary/10 gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              Receipt
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError && !data) {
    return (
      <EmptyState
        title="Failed to load payments"
        description="Could not fetch payment records from the ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const r = receipt.data;

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        title="Customer Payments"
        subtitle="Subscriber collection ledger — mobile wallets, cash handovers and bank deposits"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'Customer Payments' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Can menu="reports" action="read">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
                className="text-xs border-border/80 hover:bg-accent"
              >
                {exporting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                )}
                Export CSV
              </Button>
            </Can>
            <Can menu="customer_payment" action="create">
              <Link href="/admin/customer-payments/new">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Record Payment
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      {/* KPI ribbon — whole filtered set (server summary) */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={summary?.collected ?? 0} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">collected ({summary?.paidCount ?? 0} receipts)</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={summary?.mfsCollected ?? 0} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">mobile wallets</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">
            <CurrencyDisplay amount={summary?.bankCollected ?? 0} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">bank / card gateways</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">
            <CurrencyDisplay amount={summary?.cashCollected ?? 0} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">cash</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{summary?.pendingCount ?? 0}</span>{' '}
          <span className="text-muted-foreground">
            pending (<CurrencyDisplay amount={summary?.pending ?? 0} className="inline" />)
          </span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isFetching && !items.length}
        getRowId={(row) => row.id}
        searchPlaceholder="Search invoice, TrxID, customer name or mobile..."
        emptyTitle="No payment records found"
        emptyDescription="No payments match the current filters."
        server={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
          onPageSizeChange: (pageSize) => patch({ pageSize }),
          search: filters.search,
          onSearchChange: (search) => setFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
        }}
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.status} onValueChange={(v) => patch({ status: (v ?? 'all') as LedgerFilters['status'] })}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.method} onValueChange={(v) => patch({ method: v ?? 'all' })}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {METHOD_FILTERS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => patch({ from: e.target.value })}
              className="h-9 w-[140px] text-xs"
              aria-label="From date"
            />
            <Input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => patch({ to: e.target.value })}
              className="h-9 w-[140px] text-xs"
              aria-label="To date"
            />
          </div>
        }
      />

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Payment Receipt</DialogTitle>
                  <DialogDescription className="text-xs font-mono text-muted-foreground">{r?.invoiceNo ?? '…'}</DialogDescription>
                </div>
              </div>
              {r && <StatusBadge status={r.status} />}
            </div>
          </DialogHeader>

          {receipt.isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : receipt.isError || !r ? (
            <EmptyState
              title="Could not load this receipt"
              description={errorMessage(receipt.error)}
              actionLabel="Retry"
              onAction={() => receipt.refetch()}
              className="py-8"
            />
          ) : (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <Row label="Customer" value={r.customer?.name || '—'} bold />
                <Row label="Customer ID" value={r.customer ? r.customer.code || r.customer.id : '—'} mono />
                {r.customer?.packageName ? <Row label="Package" value={r.customer.packageName} /> : null}
                <Row label="Date" value={formatDateTime(r.paidAt ?? r.createdAt ?? '')} />
                <Row label="Method" value={r.methodRaw || '—'} />
                {r.trxId ? <Row label="TrxID / Reference" value={r.trxId} mono /> : null}
                {r.collector ? <Row label="Collected by" value={r.collector} /> : null}
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold">
                <span className="text-foreground">{r.status === 'completed' ? 'Amount received' : 'Amount'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  <CurrencyDisplay amount={r.amountBdt} />
                </span>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
                <Link href={`/admin/customer-payments/${r.id}/pos`}>
                  <Button size="sm" variant="ghost" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                    <Receipt className="h-3.5 w-3.5" /> POS Slip
                  </Button>
                </Link>
                <div className="flex gap-2">
                  {r.customer ? (
                    <Can menu="sms_message" action="create">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={sendSms.isPending}
                        onClick={() => sendSms.mutate({ customerId: r.customer!.id, content: receiptSmsText(r) })}
                        className="text-xs gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" /> SMS
                      </Button>
                    </Can>
                  ) : null}
                  <Button size="sm" onClick={() => window.print()} className="text-xs gap-1.5 font-semibold">
                    <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {r ? <PaymentReceiptA4 receipt={r} /> : null}
    </div>
  );
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-3 py-0.5 border-b border-border/40 last:border-b-0">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`text-foreground text-right ${bold ? 'font-bold' : 'font-semibold'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
