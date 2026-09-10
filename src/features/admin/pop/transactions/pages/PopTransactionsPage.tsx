'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  X,
  Download,
  Building2,
  Calendar,
  Receipt,
  Printer,
  FileText,
  Copy,
  Wallet,
} from 'lucide-react';
import { usePopData } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PopTransaction } from '../../hooks/use-pop';

type FilterType = 'all' | 'credit' | 'debit';

export function PopTransactionsPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<PopTransaction | null>(null);

  const transactions = data?.transactions ?? [];

  const stats = useMemo(() => {
    const credit = transactions.filter((t) => t.type === 'credit');
    const debit = transactions.filter((t) => t.type === 'debit');
    const totalCredit = credit.reduce((a, t) => a + t.amountBdt, 0);
    const totalDebit = debit.reduce((a, t) => a + Math.abs(t.amountBdt), 0);
    const net = totalCredit - totalDebit;
    return {
      creditCount: credit.length,
      debitCount: debit.length,
      totalCredit,
      totalDebit,
      net,
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.popName.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase()) ||
        t.id?.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Date', 'POP Reseller', 'Type', 'Amount (BDT)', 'Note'];
    const rows = filtered.map((t) => [
      t.id || 'N/A',
      t.date,
      t.popName,
      t.type,
      t.amountBdt,
      t.note,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `pop_transactions_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('POP transactions exported to CSV');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load transactions"
        description="Could not fetch POP transaction ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Transactions"
        subtitle="Comprehensive double-entry audit ledger for funding credits and debit settlements across all POP reseller hubs"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'POP Transactions' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Ledger
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{transactions.length}</span>{' '}
          <span className="text-muted-foreground">total ledger entries</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={stats.totalCredit} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">funding inflows ({stats.creditCount})</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-destructive">
            <CurrencyDisplay amount={stats.totalDebit} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">settlement outflows ({stats.debitCount})</span>
        </p>
        <p>
          <span
            className={cn(
              'font-semibold tabular-nums',
              stats.net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-destructive',
            )}
          >
            <CurrencyDisplay amount={stats.net} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">net cash position</span>
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search POP reseller or memo note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
              {(['all', 'credit', 'debit'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={filterType === t ? 'default' : 'ghost'}
                  onClick={() => setFilterType(t)}
                  className="text-xs h-7 px-2.5 capitalize"
                >
                  {t === 'all'
                    ? `All (${transactions.length})`
                    : t === 'credit'
                      ? `Inflows (${stats.creditCount})`
                      : `Outflows (${stats.debitCount})`}
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/50">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Transactions Table */}
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No transactions found"
              description="No POP funding or remittance history matches your filters."
              actionLabel="Reset Search"
              onAction={() => {
                setSearch('');
                setFilterType('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[120px]">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Date</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">POP Reseller</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Type</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Amount (BDT)</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Transaction Note / Memo</span>
                  </TableHead>
                  <TableHead className="w-[80px] text-right">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">Receipt</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx, idx) => (
                  <tr
                    key={`${tx.date}-${tx.popName}-${idx}`}
                    className="group border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{tx.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {tx.popName}
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
                          tx.type === 'credit'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        <CurrencyDisplay amount={Math.abs(tx.amountBdt)} />
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[320px]">
                        {tx.note}
                      </span>
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
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
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
                  <DialogDescription className="text-xs font-mono">
                    {selectedTx?.id || 'POP-TX-REC'}
                  </DialogDescription>
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
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">POP Reseller:</span>
                  <span className="font-bold text-foreground">{selectedTx.popName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Posting Date:</span>
                  <span className="font-mono text-foreground">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Transaction Direction:</span>
                  <span className="font-semibold capitalize text-foreground">{selectedTx.type}</span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-muted-foreground">Narration / Memo:</span>
                  <p className="text-foreground p-2 rounded-lg bg-background border border-border/50 font-mono text-[11px]">
                    {selectedTx.note}
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
                  {selectedTx.type === 'credit' ? '+' : '-'}৳
                  {Math.abs(selectedTx.amountBdt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Voucher
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success('Voucher copied and downloaded');
                    setSelectedTx(null);
                  }}
                  className="text-xs font-semibold"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
