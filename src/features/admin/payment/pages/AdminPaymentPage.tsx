'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Zap, Receipt, FileText, Copy, Printer, ShieldCheck, Loader2, CreditCard, RefreshCw } from 'lucide-react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { useTenantBilling, type PlatformPayment, type TenantBillingFilters } from '../hooks/use-tenant-billing';
import { gatewayLabel, useCheckoutStatus, usePlatformCheckout } from '../hooks/use-platform-checkout';
import { GatewayPicker } from '../components/GatewayPicker';
import { useAdminSubscription } from '@/features/admin/subscription/hooks/use-admin-subscription';
import { usePaymentReceipt } from '@/features/admin/customer-payments/hooks/use-customer-payments';
import { PaymentReceiptA4 } from '@/features/admin/customer-payments/components/PaymentReceiptA4';
import { MethodPill } from '@/features/admin/customer-payments/components/MethodPill';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';

export function AdminPaymentPage() {
  const [filters, setFilters] = useState<TenantBillingFilters>({ page: 1, pageSize: 20, search: '', status: 'all' });
  const { data, isLoading, isError, error, refetch } = useTenantBilling(filters);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [payFor, setPayFor] = useState<PlatformPayment | null>(null);
  const [gateway, setGateway] = useState('');
  const receipt = usePaymentReceipt(receiptId);
  const subscription = useAdminSubscription({ enabled: Boolean(payFor) });
  const checkout = usePlatformCheckout();
  const statusCheck = useCheckoutStatus();
  const providers = subscription.data?.providers ?? [];

  const items = data?.items ?? [];
  const summary = data?.summary;
  const checkMutate = statusCheck.mutate;
  const checking = statusCheck.isPending;

  const columns = useMemo<LegacyColumnDef<PlatformPayment, unknown>[]>(() => {
    const copyInvoice = (invoiceNo: string) =>
      navigator.clipboard
        .writeText(invoiceNo)
        .then(() => toast.success(`Invoice number ${invoiceNo} copied`))
        .catch(() => toast.error('Clipboard is not available'));
    return [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice #',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Receipt className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                <span>{row.original.invoiceNo}</span>
                <button type="button" onClick={() => copyInvoice(row.original.invoiceNo)} className="hover:text-primary transition-colors" title="Copy invoice number">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">{formatDateTime(row.original.paidAt ?? row.original.createdAt)}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 220,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.description}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.period || '—'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        size: 110,
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} className="font-bold text-foreground" />,
      },
      {
        accessorKey: 'method',
        header: 'Method',
        size: 130,
        cell: ({ row }) =>
          row.original.methodRaw ? (
            <MethodPill method={row.original.method} methodRaw={row.original.methodRaw} />
          ) : row.original.gateway ? (
            <span className="text-xs text-muted-foreground">{gatewayLabel(row.original.gateway)} (started)</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 210,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end gap-1">
              {p.status === 'pending' && p.gateway && p.gatewayRef ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={checking}
                  onClick={() => checkMutate({ gateway: p.gateway!, reference: p.gatewayRef! })}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Check
                </Button>
              ) : null}
              {p.status === 'pending' ? (
                <Button size="sm" variant="outline" onClick={() => setPayFor(p)} className="h-7 text-xs">
                  <CreditCard className="mr-1 h-3.5 w-3.5" /> Pay
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => setReceiptId(p.id)} className="h-7 text-xs text-primary hover:bg-primary/10">
                <FileText className="mr-1 h-3.5 w-3.5" /> Receipt
              </Button>
            </div>
          );
        },
      },
    ];
  }, [checkMutate, checking]);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return <EmptyState title="Failed to load payments" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />;
  }

  const r = receipt.data;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Subscription Invoices & Payments"
        subtitle="Your platform subscription invoices, wallet top-ups and their payment status."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Subscription', url: '/admin/subscription' },
          { label: 'Payments' },
        ]}
        actions={
          <Link href="/admin/subscription">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Self Recharge
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <CurrencyDisplay amount={summary?.paidAmount ?? 0} className="inline font-semibold" />{' '}
          <span className="text-muted-foreground">paid · {summary?.paidCount ?? 0} invoices</span>
        </p>
        <p>
          <CurrencyDisplay amount={summary?.pendingAmount ?? 0} className="inline font-semibold" />{' '}
          <span className="text-muted-foreground">pending · {summary?.pendingCount ?? 0} awaiting</span>
        </p>
        <p>
          <span className="font-semibold">{summary?.lastPaidAt ? formatDateTime(summary.lastPaidAt) : '—'}</span>{' '}
          <span className="text-muted-foreground">last payment</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        searchPlaceholder="Search invoice, TrxID or description..."
        emptyTitle="No platform payments yet"
        emptyDescription="Subscription recharges and wallet top-ups appear here."
        server={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
          onPageSizeChange: (pageSize) => setFilters((f) => ({ ...f, page: 1, pageSize })),
          search: filters.search,
          onSearchChange: (search) => setFilters((f) => (f.search === search ? f : { ...f, page: 1, search })),
        }}
        toolbarActions={
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, page: 1, status: (v ?? 'all') as TenantBillingFilters['status'] }))}
          >
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="successful">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Pay a pending invoice through a hosted gateway checkout */}
      <Dialog open={!!payFor} onOpenChange={(open) => !open && setPayFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay invoice {payFor?.invoiceNo}</DialogTitle>
            <DialogDescription>
              {payFor ? (
                <>
                  {payFor.description} — <CurrencyDisplay amount={payFor.amountBdt} className="inline" />. You will be redirected to the gateway; the
                  invoice is marked paid only after the gateway confirms.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {subscription.isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : subscription.isError ? (
            <p className="text-xs text-destructive">{errorMessage(subscription.error)}</p>
          ) : (
            <GatewayPicker providers={providers} value={gateway} onChange={setGateway} />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayFor(null)}>Cancel</Button>
            <Button
              disabled={!payFor || !gateway || checkout.isPending}
              onClick={() => payFor && checkout.mutate({ paymentId: payFor.id, gateway })}
            >
              {checkout.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CreditCard className="mr-1.5 h-4 w-4" />}
              Continue to gateway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={!!receiptId} onOpenChange={(open) => !open && setReceiptId(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Platform Invoice Receipt</DialogTitle>
            <DialogDescription className="text-xs font-mono">{r?.invoiceNo ?? '…'}</DialogDescription>
          </DialogHeader>
          {receipt.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : receipt.isError || !r ? (
            <EmptyState title="Could not load this receipt" description={errorMessage(receipt.error)} actionLabel="Retry" onAction={() => receipt.refetch()} className="py-8" />
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] font-semibold">Issued to</span>
                  <div className="font-bold text-foreground text-sm">{r.customer?.name || '—'}</div>
                  {r.customer?.address ? <div className="text-[11px] text-muted-foreground">{r.customer.address}</div> : null}
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-muted-foreground text-[10px] font-semibold">Issued by</span>
                  <div className="font-semibold text-foreground text-sm">{r.issuer.name || '—'}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDateTime(r.paidAt ?? r.createdAt ?? '')}</div>
                </div>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2.5 px-3.5 font-medium text-foreground">{r.comment || 'Platform payment'}</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground">
                        <CurrencyDisplay amount={r.amountBdt} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-muted-foreground">Payment</span>
                  <StatusBadge status={r.status} className="ml-auto" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-semibold">{r.methodRaw || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gateway reference</span>
                  <span className="font-mono font-semibold">{r.trxId || '—'}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs h-8">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {r ? <PaymentReceiptA4 receipt={r} /> : null}
    </div>
  );
}
