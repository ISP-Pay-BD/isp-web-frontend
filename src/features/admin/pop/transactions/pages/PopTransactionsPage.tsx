'use client';

import { useState } from 'react';
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
import { TablePagination } from '@/components/shared/TablePagination';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';

type FilterType = '' | 'credit' | 'debit';

export function PopTransactionsPage() {
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

  const transactions = data?.items ?? [];
  const summary = data?.summary;

  const handleExportCsv = () =>
    downloadCsv(
      `pop_transactions_${pop?.name ?? 'pop'}_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Entry ID', 'Received Date', 'Type', 'Amount (BDT)', 'Paid Via', 'Invoice', 'Status', 'Comments'],
      transactions.map((t) => [t.id, t.receivedDate, t.type, t.amountBdt, t.paidVia, t.invoiceNumber, t.status, t.comments]),
    );

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Transactions"
        subtitle="Funding credits and debit settlements recorded against each POP reseller wallet"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'POP Transactions' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="text-xs border-border/80 hover:bg-accent"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Page
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PopSelect
          value={pop}
          onChange={(p) => {
            setPop(p);
            setPage(1);
          }}
        />
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
          {(['', 'credit', 'debit'] as const).map((t) => (
            <Button
              key={t || 'all'}
              type="button"
              size="sm"
              variant={filterType === t ? 'default' : 'ghost'}
              onClick={() => {
                setFilterType(t);
                setPage(1);
              }}
              className="text-xs h-7 px-2.5"
            >
              {t === '' ? 'All' : t === 'credit' ? 'Inflows' : 'Outflows'}
            </Button>
          ))}
        </div>
      </Card>

      {/* KPI Stats Ribbon (totals over the whole filtered ledger) */}
      {summary && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums text-foreground">{data?.meta.total ?? 0}</span>{' '}
            <span className="text-muted-foreground">ledger entries</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={summary.creditTotal} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">funding inflows</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-destructive">
              <CurrencyDisplay amount={summary.debitTotal} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">settlement outflows</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-foreground">
              <CurrencyDisplay amount={summary.balance} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">current wallet balance</span>
          </p>
        </div>
      )}

      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        {noPops ? (
          <div className="py-16">
            <EmptyState title="No POP resellers yet" description="Register a POP to start recording wallet funding." />
          </div>
        ) : popsQuery.isError ? (
          <div className="py-16">
            <EmptyState
              title="Failed to load POPs"
              description={popsQuery.error?.message}
              actionLabel="Retry"
              onAction={() => popsQuery.refetch()}
            />
          </div>
        ) : !pop || isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : isError ? (
          <div className="py-16">
            <EmptyState
              title="Failed to load transactions"
              description={error?.message ?? 'Could not fetch the POP funding ledger.'}
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No transactions found"
              description={`No ${filterType ? `${filterType} ` : ''}funding entries recorded for ${pop.name}.`}
            />
          </div>
        ) : (
          <div className={cn('overflow-x-auto transition-opacity', isFetching && 'opacity-60')}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[120px] text-xs">Date</TableHead>
                  <TableHead className="text-xs">POP Reseller</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Amount (BDT)</TableHead>
                  <TableHead className="text-xs">Paid Via</TableHead>
                  <TableHead className="text-xs">Memo</TableHead>
                  <TableHead className="w-[80px] text-right text-xs">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="group border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{tx.receivedDate || tx.createdAt.slice(0, 10)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {pop.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {tx.type === 'credit' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
                        >
                          <ArrowDownCircle className="h-3 w-3" />
                          Credit Inflow
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1"
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          Debit Outflow
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span
                        className={cn(
                          'font-mono text-sm font-bold',
                          tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
                        )}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        <CurrencyDisplay amount={tx.amountBdt} />
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground">{tx.paidVia || '—'}</TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[320px]">{tx.comments || '—'}</span>
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                        aria-label="Open voucher"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              className="border-t border-border/50 px-4 py-3"
              currentPage={page}
              pageSize={pageSize}
              totalItems={data?.meta.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </Card>

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
                  <DialogTitle className="text-base font-bold">Transaction Voucher</DialogTitle>
                  <DialogDescription className="text-xs font-mono">Entry #{selectedTx?.id}</DialogDescription>
                </div>
              </div>
              {selectedTx && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold capitalize',
                    selectedTx.type === 'credit'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                  )}
                >
                  {selectedTx.type}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                {[
                  ['POP Reseller', pop?.name ?? '—'],
                  ['Received Date', selectedTx.receivedDate || '—'],
                  ['Paid Via', selectedTx.paidVia || '—'],
                  ['Invoice Number', selectedTx.invoiceNumber || '—'],
                  ['Status', selectedTx.status || '—'],
                  ['Recorded At', selectedTx.createdAt || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-0.5 border-b border-border/40">
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-semibold text-foreground capitalize">{value}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-muted-foreground">Narration / Memo:</span>
                  <p className="text-foreground p-2 rounded-lg bg-background border border-border/50 font-mono text-[11px]">
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
                <span>Transaction Value:</span>
                <span className="font-mono text-base">
                  {selectedTx.type === 'credit' ? '+' : '-'}
                  <CurrencyDisplay amount={selectedTx.amountBdt} />
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Voucher
                </Button>
                <Button size="sm" onClick={() => setSelectedTx(null)} className="text-xs font-semibold">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
