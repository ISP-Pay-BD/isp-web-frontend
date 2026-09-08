'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo, useState } from 'react';
import {
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';
import { usePopData } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PopTransactionsPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const [search, setSearch] = useState('');

  const transactions = data?.transactions ?? [];

  const stats = useMemo(() => {
    const credit = transactions.filter((t) => t.type === 'credit');
    const debit = transactions.filter((t) => t.type === 'debit');
    const totalCredit = credit.reduce((a, t) => a + t.amountBdt, 0);
    const totalDebit = debit.reduce((a, t) => a + Math.abs(t.amountBdt), 0);
    return { creditCount: credit.length, debitCount: debit.length, totalCredit, totalDebit };
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(
      (t) =>
        search === '' ||
        t.popName.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase()),
    );
  }, [transactions, search]);

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
    <div
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            POP Transactions
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Funding credits and debit remittances across all POP resellers.
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{transactions.length}</span>{' '}
          <span className="text-muted-foreground">total transactions</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.creditCount}</span>{' '}
          <span className="text-muted-foreground">credit inflows</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.debitCount}</span>{' '}
          <span className="text-muted-foreground">debit outflows</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums"><CurrencyDisplay amount={stats.totalCredit - stats.totalDebit} className="font-mono text-foreground font-bold" /></span>{' '}
          <span className="text-muted-foreground">net balance</span>
        </p>
      </div>

      {/* Search */}
      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search POP or note..."
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
            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/50">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title="No transactions"
                description="POP funding and remittance history will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Date</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">POP</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Type</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Amount</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Note</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx, idx) => (
                    <tr
                      key={`${tx.date}-${tx.popName}-${idx}`}
                      className="group border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs">{tx.date}</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {tx.popName}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        {tx.type === 'credit' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
                            <ArrowDownCircle className="h-3 w-3" />
                            credit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1">
                            <ArrowUpCircle className="h-3 w-3" />
                            debit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className={`font-mono text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                          {tx.type === 'credit' ? '+' : '-'}<CurrencyDisplay amount={Math.abs(tx.amountBdt)} />
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-sm text-muted-foreground">{tx.note}</span>
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    
      </PageContent>
    </div>
  );
}
