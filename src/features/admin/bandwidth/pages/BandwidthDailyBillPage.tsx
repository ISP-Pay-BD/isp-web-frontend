'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Calendar, Building2, Phone, Wallet, X } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBdtWithSymbol } from '@/lib/format';
import { useBandwidthClientOptions, useBandwidthDailyBill } from '../hooks/useBandwidthSell';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLocale } from '@/i18n/locale-context';
import type { DailyBillRow, PayableInvoice } from '../types';
import { PaymentDialog } from '../components/PaymentDialog';
import { OptionSelect } from '../components/OptionSelect';
import { RefreshState } from '../components/RefreshState';
import { dayText, isoDay, paidDueLabel, periodLabel } from '../utils';

const toPayable = (r: DailyBillRow): PayableInvoice => ({
  requisitionId: r.requisitionId,
  clientName: r.clientName,
  total: r.total,
  receivedAmount: r.receivedAmount,
  discount: r.discount,
  paymentMethod: r.paymentMethod,
  paidBy: r.paidBy,
  receivedBy: r.receivedBy,
  remarks: r.remarks,
});

/** Daily bill — sell invoices of a date window per POP client (web bandwidth_sell/daily-bill). */
export function BandwidthDailyBillPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const today = isoDay();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'' | 'paid' | 'due'>('');
  const [receivedBy, setReceivedBy] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const receivedByQ = useDebouncedValue(receivedBy.trim());
  const createdByQ = useDebouncedValue(createdBy.trim());
  const { data, isLoading, isError, error, refetch, isFetching } = useBandwidthDailyBill({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    from,
    to,
    clientId,
    status,
    receivedBy: receivedByQ,
    createdBy: createdByQ,
  });
  const clients = useBandwidthClientOptions();
  const [paying, setPaying] = useState<PayableInvoice | null>(null);

  const rows = useMemo(() => data?.items ?? [], [data]);
  const totals = data?.totals;
  const hasFilters = from !== today || to !== today || Boolean(clientId || status || receivedBy || createdBy);

  const filter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    table.resetPage();
  };

  const columns = useMemo<LegacyColumnDef<DailyBillRow, unknown>[]>(
    () => [
      {
        accessorKey: 'requisitionDate',
        header: t('admin.bandwidth.dailyBill.colDate', 'Invoice Date'),
        enableHiding: false,
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{dayText(row.original.requisitionDate)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'clientName',
        header: t('admin.bandwidth.dailyBill.colClient', 'POP / Client'),
        size: 210,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{row.original.clientName || '—'}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {row.original.contactPerson}
                {row.original.mobileNumber ? (
                  <>
                    <Phone className="h-3 w-3" /> <span className="font-mono">{row.original.mobileNumber}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'requisitionId',
        header: t('admin.bandwidth.shared.invoiceNo', 'Invoice #'),
        size: 140,
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-semibold text-foreground">{row.original.requisitionId}</div>
            <div className="text-xs text-muted-foreground font-mono">{periodLabel(row.original.fromDate, row.original.toDate)}</div>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: t('admin.bandwidth.dailyBill.colAmount', 'Bill Amount'),
        size: 120,
        cell: ({ row }) => <span className="font-mono text-sm font-bold text-foreground">{formatBdtWithSymbol(row.original.total)}</span>,
      },
      {
        accessorKey: 'receivedAmount',
        header: t('admin.bandwidth.shared.received', 'Received'),
        size: 110,
        cell: ({ row }) => <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(row.original.receivedAmount)}</span>,
      },
      {
        accessorKey: 'discount',
        header: t('admin.bandwidth.shared.discount', 'Discount'),
        size: 100,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{formatBdtWithSymbol(row.original.discount)}</span>,
      },
      {
        accessorKey: 'due',
        header: t('admin.bandwidth.shared.balanceDue', 'Balance Due'),
        size: 110,
        cell: ({ row }) => (
          <span className={row.original.due > 0 ? 'font-mono text-xs font-bold text-amber-600 dark:text-amber-400' : 'font-mono text-xs text-muted-foreground'}>
            {formatBdtWithSymbol(Math.max(0, row.original.due))}
          </span>
        ),
      },
      {
        accessorKey: 'receivedBy',
        header: t('admin.bandwidth.shared.receivedByCol', 'Received By'),
        size: 130,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.receivedBy || '—'}</span>,
      },
      {
        accessorKey: 'createdBy',
        header: t('admin.bandwidth.dailyBill.colCreatedBy', 'Created By'),
        size: 130,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdBy || '—'}</span>,
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
        size: 110,
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border/80" onClick={() => setPaying(toPayable(row.original))}>
              <Wallet className="h-3.5 w-3.5" /> {t('admin.bandwidth.dailyBill.receive', 'Receive')}
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
        <EmptyState variant="error" title={t('admin.bandwidth.dailyBill.loadFailed', 'Failed to load daily bills')} description={t('admin.bandwidth.dailyBill.loadFailedHint', 'Could not fetch the bandwidth daily bill.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.dailyBill.title', 'Bandwidth Daily Bill')}
        subtitle={t('admin.bandwidth.dailyBill.subtitle', 'Sales invoices per POP client for the selected days, with collections and balance due')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.bandwidth-sell', 'Bandwidth Sell'), url: '/admin/bandwidth/sell' },
          { label: t('admin.bandwidth.buyHub.modDaily', 'Daily Bill') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{totals?.count ?? 0}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.dailyBill.statInvoices', 'invoices')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatBdtWithSymbol(totals?.total ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.bills.statBilled', 'billed')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(totals?.received ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.dailyBill.statReceived', 'received')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(totals?.due ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.dailyBill.statBalance', 'balance due')}</span>
        </p>
        <RefreshState fetching={isFetching} error={isError ? error : null} onRetry={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <Input type="date" aria-label={t('admin.bandwidth.shared.fromDate', 'From date')} value={from} max={to || undefined} onChange={(e) => filter(setFrom)(e.target.value)} className="h-9 w-40 text-xs" />
        <Input type="date" aria-label={t('admin.bandwidth.shared.toDate', 'To date')} value={to} min={from || undefined} onChange={(e) => filter(setTo)(e.target.value)} className="h-9 w-40 text-xs" />
        <div className="w-52">
          <OptionSelect
            value={clientId}
            onChange={filter(setClientId)}
            emptyLabel={t('admin.bandwidth.dailyBill.allClients', 'All POPs / clients')}
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
        <Input aria-label={t('admin.bandwidth.shared.receivedBy', 'Received by')} placeholder={t('admin.bandwidth.shared.receivedBy', 'Received by')} value={receivedBy} onChange={(e) => filter(setReceivedBy)(e.target.value)} className="h-9 w-36 text-xs" />
        <Input aria-label={t('admin.bandwidth.dailyBill.createdBy', 'Created by')} placeholder={t('admin.bandwidth.dailyBill.createdBy', 'Created by')} value={createdBy} onChange={(e) => filter(setCreatedBy)(e.target.value)} className="h-9 w-36 text-xs" />
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs gap-1"
            onClick={() => {
              setFrom(today);
              setTo(today);
              setClientId('');
              setStatus('');
              setReceivedBy('');
              setCreatedBy('');
              table.resetPage();
            }}
          >
            <X className="h-3.5 w-3.5" /> {t('admin.bandwidth.dailyBill.resetToday', 'Reset to today')}
          </Button>
        ) : null}
      </div>

      <DataTable urlState
        columns={columns}
        data={rows}
        getRowId={(row) => row.requisitionId}
        searchPlaceholder={t('admin.bandwidth.invoices.search', 'Search invoice #, client, or item...')}
        server={table.server(data?.meta.total ?? 0)}
        emptyTitle={t('admin.bandwidth.dailyBill.emptyTitle', 'No invoices in this window')}
        emptyDescription={t('admin.bandwidth.dailyBill.emptyHint', 'Widen the date range or clear the filters.')}
      />

      <PaymentDialog invoice={paying} onOpenChange={(open) => !open && setPaying(null)} />
    </div>
  );
}
