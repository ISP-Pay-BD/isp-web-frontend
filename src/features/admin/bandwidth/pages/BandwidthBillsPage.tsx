'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, FileText, Printer, Receipt, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBdtWithSymbol } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { useBandwidthBills, useDeleteBandwidthBills } from '../hooks/useBandwidthBills';
import { useBandwidthProviderOptions } from '../hooks/useBandwidthCatalog';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import type { BandwidthPurchaseBill } from '../types';
import { BillFormDialog } from '../components/BillFormDialog';
import { OptionSelect } from '../components/OptionSelect';
import { RefreshState } from '../components/RefreshState';
import { dayText, paidDueLabel, paymentMethodLabel, periodLabel } from '../utils';

const statusKey = (s: BandwidthPurchaseBill['paymentStatus']) => (s === 'Paid' ? 'paid' : 'pending');

export function BandwidthBillsPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const [providerId, setProviderId] = useState('');
  const [status, setStatus] = useState<'' | 'Paid' | 'Due'>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useBandwidthBills({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    providerId,
    status,
    from,
    to,
  });
  const providers = useBandwidthProviderOptions();
  const remove = useDeleteBandwidthBills();
  const [voucher, setVoucher] = useState<BandwidthPurchaseBill | null>(null);
  const [form, setForm] = useState<{ bill: BandwidthPurchaseBill | null } | null>(null);
  const [toDelete, setToDelete] = useState<BandwidthPurchaseBill[] | null>(null);

  const bills = useMemo(() => data?.items ?? [], [data]);
  const totals = data?.totals;
  const filtered = Boolean(providerId || status || from || to || table.search);

  const filter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    table.resetPage();
  };

  const confirmDelete = () => {
    if (!toDelete?.length) return;
    const ids = toDelete.map((b) => b.id);
    remove.mutate(ids, {
      onSuccess: () =>
        toast.success(
          ids.length === 1
            ? t('admin.bandwidth.bills.deleted', 'Bill deleted')
            : t('admin.bandwidth.bills.deletedMany', '{n} bills deleted', { n: ids.length }),
        ),
    });
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthPurchaseBill, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: t('admin.bandwidth.shared.invoiceNo', 'Invoice #'),
        enableHiding: false,
        size: 190,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <button type="button" className="font-mono font-bold text-xs text-foreground hover:text-primary transition-colors" onClick={() => setVoucher(row.original)}>
                {row.original.invoiceNumber || `#${row.original.id}`}
              </button>
              <div className="text-xs text-muted-foreground font-mono">{dayText(row.original.billingDate)}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: t('admin.bandwidth.providers.colProvider', 'Provider'),
        size: 190,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-xs text-foreground">{row.original.providerName || '—'}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
              {row.original.items.map((l) => l.item).filter(Boolean).join(', ') || t('admin.bandwidth.bills.lines', '{n} lines', { n: row.original.items.length })}
            </div>
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
        accessorKey: 'paid',
        header: t('status.paid', 'Paid'),
        size: 120,
        cell: ({ row }) => <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(row.original.paid)}</span>,
      },
      {
        accessorKey: 'due',
        header: t('admin.bandwidth.shared.due', 'Due'),
        size: 120,
        cell: ({ row }) => (
          <span className={row.original.due > 0 ? 'font-mono text-xs font-bold text-amber-600 dark:text-amber-400' : 'font-mono text-xs text-muted-foreground'}>
            {formatBdtWithSymbol(row.original.due)}
          </span>
        ),
      },
      {
        id: 'paymentStatus',
        accessorFn: (row) => paidDueLabel(t, row.paymentStatus === 'Paid'),
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 100,
        cell: ({ row }) => <StatusBadge status={statusKey(row.original.paymentStatus)} label={paidDueLabel(t, row.original.paymentStatus === 'Paid')} />,
      },
      {
        id: 'actions',
        header: '',
        size: 150,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10" onClick={() => setVoucher(row.original)}>
              {t('admin.bandwidth.bills.voucher', 'Voucher')}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" aria-label={t('common.edit', 'Edit')} onClick={() => setForm({ bill: row.original })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={t('common.delete', 'Delete')} onClick={() => setToDelete([row.original])}>
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
        <EmptyState variant="error" title={t('admin.bandwidth.bills.loadFailed', 'Failed to load purchase bills')} description={t('admin.bandwidth.bills.loadFailedHint', 'Could not fetch bandwidth purchase bills.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.bills.title', 'Bandwidth Purchase Bills')}
        subtitle={t('admin.bandwidth.bills.subtitle', 'Upstream provider bills with line VAT, payments and outstanding dues')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.bandwidth-buy', 'Bandwidth Buy'), url: '/admin/bandwidth/buy' },
          { label: t('admin.bandwidth.buyHub.modBills', 'Purchase Bills') },
        ]}
        actions={
          <Button size="sm" onClick={() => setForm({ bill: null })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {t('admin.bandwidth.bills.record', 'Record Purchase Bill')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{totals?.count ?? 0}</span>{' '}
          <span className="text-muted-foreground">{filtered ? t('admin.bandwidth.bills.statMatching', 'matching bills') : t('admin.bandwidth.bills.stat', 'bills')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatBdtWithSymbol(totals?.total ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.bills.statBilled', 'billed')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(totals?.paid ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.bills.statPaid', 'paid')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(totals?.due ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.bills.statOutstanding', 'outstanding · {n} marked due', { n: totals?.dueCount ?? 0 })}</span>
        </p>
        <RefreshState fetching={isFetching} error={isError ? error : null} onRetry={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <div className="w-56">
          <OptionSelect
            value={providerId}
            onChange={filter(setProviderId)}
            emptyLabel={t('admin.bandwidth.bills.allProviders', 'All providers')}
            options={(providers.data ?? []).map((p) => ({ value: String(p.id), label: p.companyName }))}
          />
        </div>
        <div className="w-36">
          <OptionSelect
            value={status}
            onChange={filter((v: string) => setStatus(v === 'Paid' || v === 'Due' ? v : ''))}
            emptyLabel={t('admin.bandwidth.shared.allStatuses', 'All statuses')}
            options={[
              { value: 'Due', label: paidDueLabel(t, false) },
              { value: 'Paid', label: paidDueLabel(t, true) },
            ]}
          />
        </div>
        <Input type="date" aria-label={t('admin.bandwidth.shared.fromDate', 'From date')} value={from} onChange={(e) => filter(setFrom)(e.target.value)} className="h-9 w-40 text-xs" />
        <Input type="date" aria-label={t('admin.bandwidth.shared.toDate', 'To date')} value={to} onChange={(e) => filter(setTo)(e.target.value)} className="h-9 w-40 text-xs" />
        {providerId || status || from || to ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs gap-1"
            onClick={() => {
              setProviderId('');
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
        data={bills}
        getRowId={(row) => String(row.id)}
        searchPlaceholder={t('admin.bandwidth.bills.search', 'Search invoice #, provider, or remarks...')}
        enableRowSelection
        onDeleteSelected={(rows) => setToDelete(rows)}
        server={table.server(data?.meta.total ?? 0)}
        emptyTitle={filtered ? t('admin.bandwidth.bills.emptyFiltered', 'No bills match these filters') : t('admin.bandwidth.bills.emptyNone', 'No purchase bills')}
        emptyDescription={filtered ? undefined : t('admin.bandwidth.bills.emptyHint', 'Record a provider bill to get started.')}
      />

      <Dialog open={voucher !== null} onOpenChange={(open) => !open && setVoucher(null)}>
        <DialogContent className="sm:max-w-2xl p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{t('admin.bandwidth.bills.voucherTitle', 'Purchase Bill Voucher')}</DialogTitle>
                  <DialogDescription className="text-xs font-mono">{voucher?.invoiceNumber}</DialogDescription>
                </div>
              </div>
              {voucher ? <StatusBadge status={statusKey(voucher.paymentStatus)} label={paidDueLabel(t, voucher.paymentStatus === 'Paid')} /> : null}
            </div>
          </DialogHeader>

          {voucher ? (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['provider', t('admin.bandwidth.providers.colProvider', 'Provider'), voucher.providerName || '—'],
                  ['billingDate', t('admin.bandwidth.billForm.billingDate', 'Billing date'), dayText(voucher.billingDate)],
                  ['method', t('admin.bandwidth.shared.paymentMethod', 'Payment method'), voucher.paymentMethod ? paymentMethodLabel(t, voucher.paymentMethod) : '—'],
                  ['paidBy', t('admin.bandwidth.shared.paidBy', 'Paid by'), voucher.paidBy || '—'],
                  ['receivedBy', t('admin.bandwidth.shared.receivedBy', 'Received by'), voucher.receivedBy || '—'],
                  ['remarks', t('admin.bandwidth.shared.remarks', 'Remarks'), voucher.remarks || '—'],
                ].map(([id, k, v]) => (
                  <div key={id} className="flex justify-between gap-2 border-b border-border/40 py-1">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground text-right">{v}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>{t('admin.bandwidth.shared.item', 'Item')}</TableHead>
                      <TableHead>{t('admin.bandwidth.shared.period', 'Period')}</TableHead>
                      <TableHead className="text-right">{t('admin.bandwidth.shared.qty', 'Qty')}</TableHead>
                      <TableHead className="text-right">{t('admin.bandwidth.shared.rate', 'Rate')}</TableHead>
                      <TableHead className="text-right">{t('admin.bandwidth.shared.vat', 'VAT')}</TableHead>
                      <TableHead className="text-right">{t('admin.bandwidth.shared.total', 'Total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voucher.items.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">
                          <div className="font-semibold">{l.item || '—'}</div>
                          {l.description ? <div className="text-xs text-muted-foreground">{l.description}</div> : null}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{periodLabel(l.fromDate, l.toDate)}</TableCell>
                        <TableCell className="text-xs font-mono text-right">
                          {l.qty} {l.unit}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right">{formatBdtWithSymbol(l.rate)}</TableCell>
                        <TableCell className="text-xs font-mono text-right">{l.vat}%</TableCell>
                        <TableCell className="text-xs font-mono text-right font-bold">{formatBdtWithSymbol(l.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 p-3.5 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.total', 'Total')}</span><span className="font-mono font-bold">{formatBdtWithSymbol(voucher.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('status.paid', 'Paid')}</span><span className="font-mono">{formatBdtWithSymbol(voucher.paid)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('admin.bandwidth.shared.discount', 'Discount')}</span><span className="font-mono">{formatBdtWithSymbol(voucher.discount)}</span></div>
                  <div className="flex justify-between border-t border-border/60 pt-1.5 text-sm font-bold"><span>{t('admin.bandwidth.shared.due', 'Due')}</span><span className="font-mono text-primary">{formatBdtWithSymbol(voucher.due)}</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> {t('admin.bandwidth.shared.print', 'Print')}
                </Button>
                <Button size="sm" onClick={() => setVoucher(null)} className="text-xs font-semibold">{t('common.close', 'Close')}</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <BillFormDialog open={form !== null} bill={form?.bill ?? null} onOpenChange={(open) => !open && setForm(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          toDelete?.length === 1
            ? t('admin.bandwidth.bills.deleteTitle', 'Delete bill {no}?', { no: toDelete[0]?.invoiceNumber ?? '' })
            : t('admin.bandwidth.bills.deleteManyTitle', 'Delete {n} bills?', { n: toDelete?.length ?? 0 })
        }
        description={t('admin.bandwidth.shared.cannotUndo', 'This cannot be undone.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
