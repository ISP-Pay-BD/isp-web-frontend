'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Building2,
  Calendar,
  Receipt,
  Printer,
  FileText,
} from 'lucide-react';
import { usePopFunding, usePops, type PopFundingEntry, type PopReseller } from '../../hooks/use-pop';
import { PopSelect } from '../../components/PopSelect';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';
import { useLocale } from '@/i18n/locale-context';

type FilterType = '' | 'credit' | 'debit';

function statusText(t: ReturnType<typeof useLocale>['t'], status: string): string {
  return t(`status.${status.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, status);
}

export function PopTransactionsPage() {
  const { t } = useLocale();
  const [pop, setPop] = useState<PopReseller | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTx, setSelectedTx] = useState<PopFundingEntry | null>(null);
  const { data, isLoading, isError, error, refetch, isFetching } = usePopFunding(pop?.id ?? null, {
    page,
    pageSize,
    type: filterType,
  });

  // Same query (and cache entry) as the PopSelect options — tells us when the tenant has no POPs.
  const popsQuery = usePops({ page: 1, pageSize: 100 });
  const noPops = popsQuery.isSuccess && popsQuery.data.meta.total === 0;

  const transactions = useMemo(() => data?.items ?? [], [data]);
  const summary = data?.summary;

  const columns = useMemo<LegacyColumnDef<PopFundingEntry, unknown>[]>(
    () => [
      {
        id: 'date',
        header: t('admin.pop.transactions.colDate', 'Date'),
        accessorFn: (tx) => tx.receivedDate || tx.createdAt.slice(0, 10),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{row.original.receivedDate || row.original.createdAt.slice(0, 10)}</span>
          </div>
        ),
      },
      {
        id: 'pop',
        header: t('admin.pop.transactions.colPop', 'POP Reseller'),
        accessorFn: () => pop?.name ?? '',
        enableSorting: false,
        meta: { mobile: 'hide' },
        cell: () => (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">{pop?.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t('admin.pop.transactions.colType', 'Type'),
        meta: { mobile: 'status' },
        cell: ({ row }) =>
          row.original.type === 'credit' ? (
            <Badge variant="outline" tone="success" className="text-xs font-semibold gap-1">
              <ArrowDownCircle className="h-3 w-3" />
              {t('admin.pop.transactions.creditInflow', 'Credit Inflow')}
            </Badge>
          ) : (
            <Badge variant="outline" tone="danger" className="text-xs font-semibold gap-1">
              <ArrowUpCircle className="h-3 w-3" />
              {t('admin.pop.transactions.debitOutflow', 'Debit Outflow')}
            </Badge>
          ),
      },
      {
        accessorKey: 'amountBdt',
        header: t('admin.pop.transactions.colAmount', 'Amount (BDT)'),
        meta: { mobile: 'title' },
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <button
              type="button"
              onClick={() => setSelectedTx(tx)}
              className={cn(
                'font-mono text-sm font-bold text-left',
                tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
              )}
            >
              {tx.type === 'credit' ? '+' : '-'}
              <CurrencyDisplay amount={tx.amountBdt} />
            </button>
          );
        },
      },
      {
        accessorKey: 'paidVia',
        header: t('admin.pop.transactions.paidVia', 'Paid Via'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.paidVia || '—'}</span>,
      },
      {
        accessorKey: 'comments',
        header: t('admin.pop.transactions.colMemo', 'Memo'),
        cell: ({ row }) => (
          <span className="block max-w-[320px] truncate text-muted-foreground">{row.original.comments || '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: t('admin.pop.transactions.colReceipt', 'Receipt'),
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedTx(row.original)}
              className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
              aria-label={t('admin.pop.transactions.openVoucher', 'Open voucher')}
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [pop, t],
  );

  const handleExportCsv = () =>
    downloadCsv(
      `pop_transactions_${pop?.name ?? 'pop'}_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Entry ID', 'Received Date', 'Type', 'Amount (BDT)', 'Paid Via', 'Invoice', 'Status', 'Comments'],
      transactions.map((tx) => [tx.id, tx.receivedDate, tx.type, tx.amountBdt, tx.paidVia, tx.invoiceNumber, tx.status, tx.comments]),
    );

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('nav.pop-tx-menu', 'POP Transactions')}
        subtitle={t('admin.pop.transactions.subtitle', 'Funding credits and debit settlements recorded against each POP reseller wallet')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.pop_suite', 'POP Suite') },
          { label: t('nav.pop-tx-menu', 'POP Transactions') },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="text-xs border-border/80 hover:bg-accent"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {t('admin.pop.transactions.exportPage', 'Export Page')}
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PopSelect
          value={pop}
          onChange={(p) => {
            setPop(p);
            if (pop) setPage(1);
          }}
        />
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
          {(['', 'credit', 'debit'] as const).map((kind) => (
            <Button
              key={kind || 'all'}
              type="button"
              size="sm"
              variant={filterType === kind ? 'default' : 'ghost'}
              onClick={() => {
                setFilterType(kind);
                setPage(1);
              }}
              className="text-xs h-7 px-2.5"
            >
              {kind === ''
                ? t('admin.customers.list.pillAll', 'All')
                : kind === 'credit'
                  ? t('admin.pop.transactions.inflows', 'Inflows')
                  : t('admin.pop.transactions.outflows', 'Outflows')}
            </Button>
          ))}
        </div>
      </Card>

      {/* KPI Stats Ribbon (totals over the whole filtered ledger) */}
      {summary && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums text-foreground">{data?.meta.total ?? 0}</span>{' '}
            <span className="text-muted-foreground">{t('admin.pop.transactions.ledgerEntries', 'ledger entries')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={summary.creditTotal} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">{t('admin.pop.transactions.fundingInflows', 'funding inflows')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-destructive">
              <CurrencyDisplay amount={summary.debitTotal} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">{t('admin.pop.transactions.settlementOutflows', 'settlement outflows')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-foreground">
              <CurrencyDisplay amount={summary.balance} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">{t('admin.pop.transactions.walletBalance', 'current wallet balance')}</span>
          </p>
        </div>
      )}

      {noPops || popsQuery.isError || !pop || isError ? (
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          {noPops ? (
            <div className="py-16">
              <EmptyState
                title={t('admin.pop.transactions.noPops', 'No POP resellers yet')}
                description={t('admin.pop.transactions.noPopsHint', 'Register a POP to start recording wallet funding.')}
              />
            </div>
          ) : popsQuery.isError ? (
            <div className="py-16">
              <EmptyState variant="error"
                title={t('admin.pop.transactions.popsFailed', 'Failed to load POPs')}
                description={popsQuery.error?.message}
                actionLabel={t('admin.customers.list.retry', 'Retry')}
                onAction={() => popsQuery.refetch()}
              />
            </div>
          ) : !pop ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <div className="py-16">
              <EmptyState variant="error"
                title={t('admin.pop.transactions.loadFailed', 'Failed to load transactions')}
                description={error?.message ?? t('admin.pop.transactions.loadFailedHint', 'Could not fetch the POP funding ledger.')}
                actionLabel={t('admin.customers.list.retry', 'Retry')}
                onAction={() => refetch()}
              />
            </div>
          )}
        </Card>
      ) : (
        <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
          <DataTable
            urlState
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            emptyTitle={t('admin.pop.transactions.emptyTitle', 'No transactions found')}
            emptyDescription={
              filterType === 'credit'
                ? t('admin.pop.transactions.emptyCredit', 'No credit funding entries recorded for {name}.', { name: pop.name })
                : filterType === 'debit'
                  ? t('admin.pop.transactions.emptyDebit', 'No debit funding entries recorded for {name}.', { name: pop.name })
                  : t('admin.pop.transactions.emptyAll', 'No funding entries recorded for {name}.', { name: pop.name })
            }
            server={{
              page,
              pageSize,
              total: data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
          />
        </div>
      )}

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{t('admin.pop.transactions.voucherTitle', 'Transaction Voucher')}</DialogTitle>
                  <DialogDescription className="text-xs font-mono">
                    {t('admin.pop.transactions.entryId', 'Entry #{id}', { id: selectedTx?.id ?? '' })}
                  </DialogDescription>
                </div>
              </div>
              {selectedTx && (
                <Badge
                  variant="outline"
                  tone={selectedTx.type === 'credit' ? 'success' : 'danger'} className="text-xs font-semibold"
                >
                  {selectedTx.type === 'credit' ? t('admin.pop.transactions.credit', 'Credit') : t('admin.pop.transactions.debit', 'Debit')}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                {[
                  [t('admin.pop.transactions.colPop', 'POP Reseller'), pop?.name ?? '—'],
                  [t('admin.pop.transactions.receivedDate', 'Received Date'), selectedTx.receivedDate || '—'],
                  [t('admin.pop.transactions.paidVia', 'Paid Via'), selectedTx.paidVia || '—'],
                  [t('admin.pop.transactions.invoiceNumber', 'Invoice Number'), selectedTx.invoiceNumber || '—'],
                  [t('admin.customerPayments.list.colStatus', 'Status'), selectedTx.status ? statusText(t, selectedTx.status) : '—'],
                  [t('admin.pop.transactions.recordedAt', 'Recorded At'), selectedTx.createdAt || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-semibold text-foreground capitalize">{value}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-muted-foreground">{t('admin.pop.transactions.narration', 'Narration / Memo:')}</span>
                  <p className="text-foreground p-2 rounded-lg bg-background border border-border/50 font-mono text-xs">
                    {selectedTx.comments || '—'}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  'flex justify-between items-center p-3.5 rounded-xl border text-sm font-bold',
                  selectedTx.type === 'credit'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-destructive',
                )}
              >
                <span>{t('admin.pop.transactions.value', 'Transaction Value:')}</span>
                <span className="font-mono text-base">
                  {selectedTx.type === 'credit' ? '+' : '-'}
                  <CurrencyDisplay amount={selectedTx.amountBdt} />
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> {t('admin.pop.transactions.print', 'Print Voucher')}
                </Button>
                <Button size="sm" onClick={() => setSelectedTx(null)} className="text-xs font-semibold">
                  {t('common.close', 'Close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
