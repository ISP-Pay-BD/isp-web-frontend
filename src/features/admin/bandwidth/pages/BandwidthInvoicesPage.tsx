'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { FileText, Printer, Plus, Building2, Pencil, Trash2, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton, DetailSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBdtWithSymbol } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import {
  useBandwidthClientOptions,
  useBandwidthInvoice,
  useBandwidthInvoices,
  useDeleteBandwidthInvoice,
} from '../hooks/useBandwidthSell';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { SELL_PAYMENT_METHODS, type BandwidthInvoice, type PayableInvoice } from '../types';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';
import { PaymentDialog } from '../components/PaymentDialog';
import { OptionSelect } from '../components/OptionSelect';
import { RefreshState } from '../components/RefreshState';
import { dayText, paidDueLabel, paymentMethodLabel, periodLabel, type Translate } from '../utils';

const methodLabel = (t: Translate, v: string) => paymentMethodLabel(t, v, SELL_PAYMENT_METHODS.find((m) => m.value === v)?.label ?? v);

const toPayable = (i: BandwidthInvoice): PayableInvoice => ({
  requisitionId: i.requisitionId,
  clientName: i.clientName,
  total: i.total,
  receivedAmount: i.receivedAmount,
  discount: i.discount,
  paymentMethod: i.paymentMethod,
  paidBy: i.paidBy,
  receivedBy: i.receivedBy,
  remarks: i.remarks,
});

export function BandwidthInvoicesPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'' | 'paid' | 'due'>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useBandwidthInvoices({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    clientId,
    status,
    from,
    to,
  });
  const clients = useBandwidthClientOptions();
  const remove = useDeleteBandwidthInvoice();
  const [viewRid, setViewRid] = useState<string | null>(null);
  const [form, setForm] = useState<{ rid: string | null } | null>(null);
  const [paying, setPaying] = useState<PayableInvoice | null>(null);
  const [toDelete, setToDelete] = useState<BandwidthInvoice | null>(null);

  const invoices = useMemo(() => data?.items ?? [], [data]);
  const totals = data?.totals;
  const hasFilters = Boolean(clientId || status || from || to);
  const filtered = hasFilters || Boolean(table.search);

  const filter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    table.resetPage();
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.requisitionId, { onSuccess: () => toast.success(t('admin.bandwidth.invoices.deleted', 'Invoice deleted')) });
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthInvoice, unknown>[]>(
    () => [
      {
        accessorKey: 'requisitionId',
        header: t('admin.bandwidth.shared.invoiceNo', 'Invoice #'),
        enableHiding: false,
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <button type="button" className="font-mono font-bold text-xs text-foreground hover:text-primary transition-colors" onClick={() => setViewRid(row.original.requisitionId)}>
                {row.original.requisitionId}
              </button>
              <div className="text-xs text-muted-foreground font-mono">{dayText(row.original.requisitionDate)}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'clientName',
        header: t('admin.bandwidth.invoices.colClient', 'Client'),
        size: 200,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-xs text-foreground">{row.original.clientName || '—'}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[190px]">{row.original.itemNames.join(', ')}</div>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: t('admin.bandwidth.shared.total', 'Total'),
        size: 130,
        cell: ({ row }) => <span className="font-mono text-sm font-bold text-foreground">{formatBdtWithSymbol(row.original.total)}</span>,
      },
      {
        accessorKey: 'receivedAmount',
        header: t('admin.bandwidth.shared.received', 'Received'),
        size: 120,
        cell: ({ row }) => <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(row.original.receivedAmount)}</span>,
      },
      {
        accessorKey: 'due',
        header: t('admin.bandwidth.shared.due', 'Due'),
        size: 120,
        cell: ({ row }) => (
          <span className={row.original.due > 0 ? 'font-mono text-xs font-bold text-amber-600 dark:text-amber-400' : 'font-mono text-xs text-muted-foreground'}>
            {formatBdtWithSymbol(Math.max(0, row.original.due))}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 100,
        cell: ({ row }) => <StatusBadge status={row.original.status === 'paid' ? 'paid' : 'pending'} label={paidDueLabel(t, row.original.status === 'paid')} />,
      },
      {
        id: 'actions',
        header: '',
        size: 170,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs border-border/80" onClick={() => setViewRid(row.original.requisitionId)}>
              {t('admin.bandwidth.shared.view', 'View')}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600" aria-label={t('admin.bandwidth.payment.title', 'Receive payment')} onClick={() => setPaying(toPayable(row.original))}>
              <Wallet className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" aria-label={t('common.edit', 'Edit')} onClick={() => setForm({ rid: row.original.requisitionId })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={t('common.delete', 'Delete')} onClick={() => setToDelete(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.bandwidth.invoices.loadFailed', 'Failed to load invoices')} description={t('admin.bandwidth.invoices.loadFailedHint', 'Could not fetch bandwidth sales invoices.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.invoices.title', 'Bandwidth Sales Invoices')}
        subtitle={t('admin.bandwidth.invoices.subtitle', 'Invoices issued to bandwidth sell clients, with collections and dues')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.bandwidth-sell', 'Bandwidth Sell'), url: '/admin/bandwidth/sell' },
          { label: t('nav.bw-sell-invoices', 'Invoices') },
        ]}
        actions={
          <Button size="sm" onClick={() => setForm({ rid: null })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {t('admin.bandwidth.invoices.new', 'New Invoice')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{totals?.count ?? 0}</span>{' '}
          <span className="text-muted-foreground">{filtered ? t('admin.bandwidth.invoices.statMatching', 'matching invoices') : t('admin.bandwidth.dailyBill.statInvoices', 'invoices')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatBdtWithSymbol(totals?.filtered ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{filtered
              ? t('admin.bandwidth.invoices.statInvoiced', 'invoiced')
              : t('admin.bandwidth.invoices.statInvoicedToday', 'invoiced · {today} today', { today: formatBdtWithSymbol(totals?.today ?? 0) })}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(totals?.received ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.dailyBill.statReceived', 'received')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(totals?.due ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.invoices.statOutstanding', 'outstanding')}</span>
        </p>
        <RefreshState fetching={isFetching} error={isError ? error : null} onRetry={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <div className="w-56">
          <OptionSelect
            value={clientId}
            onChange={filter(setClientId)}
            emptyLabel={t('admin.bandwidth.invoices.allClients', 'All clients')}
            options={(clients.data ?? []).map((c) => ({ value: String(c.id), label: c.customerName }))}
          />
        </div>
        <div className="w-36">
          <OptionSelect
            value={status}
            onChange={filter((v: string) => setStatus(v === 'paid' || v === 'due' ? v : ''))}
            emptyLabel={t('admin.bandwidth.shared.allStatuses', 'All statuses')}
            options={[
              { value: 'due', label: paidDueLabel(t, false) },
              { value: 'paid', label: paidDueLabel(t, true) },
            ]}
          />
        </div>
        <Input type="date" aria-label={t('admin.bandwidth.shared.fromDate', 'From date')} value={from} onChange={(e) => filter(setFrom)(e.target.value)} className="h-9 w-40 text-xs" />
        <Input type="date" aria-label={t('admin.bandwidth.shared.toDate', 'To date')} value={to} onChange={(e) => filter(setTo)(e.target.value)} className="h-9 w-40 text-xs" />
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs gap-1"
            onClick={() => {
              setClientId('');
              setStatus('');
              setFrom('');
              setTo('');
              table.resetPage();
            }}
          >
            <X className="h-3.5 w-3.5" /> {t('admin.bandwidth.shared.clearFilters', 'Clear filters')}
          </Button>
        ) : null}
      </div>

      <DataTable urlState
        columns={columns}
        data={invoices}
        getRowId={(row) => row.requisitionId}
        searchPlaceholder={t('admin.bandwidth.invoices.search', 'Search invoice #, client, or item...')}
        server={table.server(data?.meta.total ?? 0)}
        emptyTitle={filtered ? t('admin.bandwidth.invoices.emptyFiltered', 'No invoices match these filters') : t('admin.bandwidth.invoices.emptyNone', 'No sales invoices')}
        emptyDescription={filtered ? undefined : t('admin.bandwidth.invoices.emptyHint', 'Create an invoice for a sell client to get started.')}
      />

      <Dialog open={viewRid !== null} onOpenChange={(open) => !open && setViewRid(null)}>
        <DialogContent className="sm:max-w-2xl p-6 border-border/80 shadow-[var(--shadow-md)]">
          {viewRid ? <InvoiceDetail rid={viewRid} onClose={() => setViewRid(null)} /> : null}
        </DialogContent>
      </Dialog>

      <InvoiceFormDialog open={form !== null} rid={form?.rid ?? null} onOpenChange={(open) => !open && setForm(null)} />
      <PaymentDialog invoice={paying} onOpenChange={(open) => !open && setPaying(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('admin.bandwidth.invoices.deleteTitle', 'Delete invoice {no}?', { no: toDelete?.requisitionId ?? '' })}
        description={t('admin.bandwidth.invoices.deleteDesc', 'Every line of the invoice and its recorded payment are removed.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function InvoiceDetail({ rid, onClose }: { rid: string; onClose: () => void }) {
  const { t } = useLocale();
  const { data: inv, isLoading, isError, refetch } = useBandwidthInvoice(rid);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !inv) return <EmptyState variant="error" title={t('admin.bandwidth.invoiceForm.loadFailed', 'Could not load the invoice')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />;

  return (
    <div className="space-y-5 pt-2">
      <DialogHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> {inv.clientName || t('admin.bandwidth.invoices.salesInvoice', 'Sales invoice')}
            </DialogTitle>
            <DialogDescription className="text-xs">{t('admin.bandwidth.invoices.detailDesc', 'Bandwidth sales invoice')}</DialogDescription>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-sm text-primary">{inv.requisitionId}</div>
            <div className="text-xs text-muted-foreground">{t('admin.bandwidth.invoices.dateLabel', 'Date: {date}', { date: dayText(inv.requisitionDate) })}</div>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
          <span className="font-bold text-muted-foreground uppercase text-xs">{t('admin.bandwidth.invoices.billedTo', 'Billed to')}</span>
          <div className="font-bold text-sm text-foreground">{inv.clientName || '—'}</div>
          {inv.remarks ? <div className="text-muted-foreground">{inv.remarks}</div> : null}
          {inv.requisitionBy ? <div className="text-muted-foreground">{t('admin.bandwidth.invoices.createdBy', 'Created by {name}', { name: inv.requisitionBy })}</div> : null}
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1.5">
          <span className="font-bold text-muted-foreground uppercase text-xs">{t('admin.bandwidth.invoices.payment', 'Payment')}</span>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.dueDate', 'Due date')}</span><span className="font-mono font-semibold">{dayText(inv.deadline)}</span></div>
          <div className="flex justify-between items-center"><span className="text-muted-foreground">{t('admin.customers.list.statusLabel', 'Status')}</span><StatusBadge status={inv.status === 'paid' ? 'paid' : 'pending'} label={paidDueLabel(t, inv.status === 'paid')} /></div>
          {inv.paymentDate ? <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.invoices.paidOn', 'Paid on')}</span><span className="font-mono">{dayText(inv.paymentDate)}</span></div> : null}
          {inv.paymentMethod ? <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.payment.method', 'Method')}</span><span>{methodLabel(t, inv.paymentMethod)}</span></div> : null}
          {inv.receivedBy ? <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.receivedBy', 'Received by')}</span><span>{inv.receivedBy}</span></div> : null}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>{t('admin.bandwidth.shared.item', 'Item')}</TableHead>
              <TableHead>{t('admin.bandwidth.shared.period', 'Period')}</TableHead>
              <TableHead className="text-right">{t('admin.bandwidth.shared.qty', 'Qty')}</TableHead>
              <TableHead className="text-right">{t('admin.bandwidth.shared.rate', 'Rate')}</TableHead>
              <TableHead className="text-right">{t('admin.bandwidth.invoices.amount', 'Amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inv.lines.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-xs">
                  <div className="font-semibold">{l.itemName || '—'}</div>
                  {l.description ? <div className="text-xs text-muted-foreground">{l.description}</div> : null}
                </TableCell>
                <TableCell className="text-xs font-mono">{periodLabel(l.fromDate, l.toDate)}</TableCell>
                <TableCell className="text-xs font-mono text-right">{l.qty}</TableCell>
                <TableCell className="text-xs font-mono text-right">{formatBdtWithSymbol(l.rate)}</TableCell>
                <TableCell className="text-xs font-mono text-right font-bold">{formatBdtWithSymbol(l.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-72 space-y-1.5 text-xs p-3.5 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.total', 'Total')}</span><span className="font-mono font-semibold">{formatBdtWithSymbol(inv.total)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.received', 'Received')}</span><span className="font-mono">{formatBdtWithSymbol(inv.receivedAmount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.discount', 'Discount')}</span><span className="font-mono">{formatBdtWithSymbol(inv.discount)}</span></div>
          <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
            <span>{t('admin.bandwidth.shared.balanceDue', 'Balance Due')}</span>
            <span className="font-mono text-primary text-base">{formatBdtWithSymbol(Math.max(0, inv.due))}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">{t('common.close', 'Close')}</Button>
        <Button size="sm" onClick={() => window.print()} className="text-xs font-semibold gap-1.5">
          <Printer className="h-4 w-4" /> {t('admin.bandwidth.shared.print', 'Print')}
        </Button>
      </div>
    </div>
  );
}
