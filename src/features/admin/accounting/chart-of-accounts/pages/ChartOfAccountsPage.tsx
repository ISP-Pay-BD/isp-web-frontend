'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useMemo } from 'react';
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Landmark,
} from 'lucide-react';
import { useChartOfAccounts } from '../hooks/use-chart-of-accounts';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  asset: { label: 'Asset', icon: <Landmark className="h-3 w-3" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  liability: { label: 'Liability', icon: <CreditCard className="h-3 w-3" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  equity: { label: 'Equity', icon: <Landmark className="h-3 w-3" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  income: { label: 'Income', icon: <TrendingUp className="h-3 w-3" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  expense: { label: 'Expense', icon: <TrendingDown className="h-3 w-3" />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export function ChartOfAccountsPage() {
  const { accounts, isLoading, isError, refetch } = useChartOfAccounts();

  const stats = useMemo(() => {
    const rootAccounts = accounts.filter((a) => !a.parentId);
    const totalBalance = rootAccounts.reduce((sum, a) => sum + a.balanceBdt, 0);
    const rootCount = rootAccounts.length;
    return { rootCount, totalBalance };
  }, [accounts]);

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load chart of accounts"
        description="Could not load the general ledger hierarchy."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="h-6 w-6" />
            </div>
            Chart of Accounts
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            General ledger hierarchy for ISP revenue, bandwidth costs, and assets.
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Stats */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{accounts.length}</span>{' '}
          <span className="text-muted-foreground">GL accounts</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{stats.rootCount}</span>{' '}
          <span className="text-muted-foreground">root categories</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay amount={stats.totalBalance} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">root balance</span>
        </p>
      </div>

      {/* Table */}
      <div>
        {accounts.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No accounts configured"
              description="Add chart of accounts to start journal entries."
            />
          </div>
        ) : (
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[100px]">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Code</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Account Name</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Type</span>
                    </TableHead>
                    <TableHead className="text-right">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">Balance (৳)</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc, idx) => {
                    const isChild = Boolean(acc.parentId);
                    const cfg = typeConfig[acc.type];
                    return (
                      <tr
                        key={acc.id}
                        className={cn(
                          'group border-border/40 hover:bg-muted/30 transition-colors',
                          isChild && 'bg-muted/10'
                        )}
                      >
                        <TableCell className="py-3.5">
                          <span className={cn(
                            'font-mono text-xs font-bold px-2 py-1 rounded-md',
                            isChild
                              ? 'bg-muted/40 text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                          )}>
                            {acc.code}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            {isChild && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            )}
                            <span className={cn(
                              'text-sm',
                              isChild ? 'text-muted-foreground' : 'font-semibold text-foreground group-hover:text-primary transition-colors'
                            )}>
                              {acc.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {cfg ? (
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] font-semibold gap-1', cfg.color, cfg.bg, cfg.border)}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold capitalize">
                              {acc.type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className={cn(
                            'font-mono text-sm font-bold',
                            acc.balanceBdt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                          )}>
                            <CurrencyDisplay amount={acc.balanceBdt} />
                          </span>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    
      </PageContent>
    </div>
  );
}
