'use client';

import { useMemo } from 'react';
import { useChartOfAccounts } from '../hooks/use-chart-of-accounts';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Layers, DollarSign } from 'lucide-react';

const typeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expense',
};

export function ChartOfAccountsPage() {
  const { accounts, isLoading, isError, refetch } = useChartOfAccounts();

  const totalBalance = useMemo(
    () => accounts.filter((a) => !a.parentId).reduce((sum, a) => sum + a.balanceBdt, 0),
    [accounts],
  );

  if (isLoading) return <PageSkeleton rows={8} />;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
        <p className="text-muted-foreground text-sm">General ledger hierarchy for ISP revenue, bandwidth costs, and assets.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="GL Accounts" value={accounts.length} description="Active ledger codes" icon={BookOpen} />
        <StatCard title="Root Categories" value={accounts.filter((a) => !a.parentId).length} description="Top-level groups" icon={Layers} />
        <StatCard title="Root Balance Sum" value={<CurrencyDisplay amount={totalBalance} />} description="Parent account totals" icon={DollarSign} />
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="No accounts configured" description="Add chart of accounts to start journal entries." />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance (৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-xs font-semibold">{acc.code}</TableCell>
                  <TableCell className={acc.parentId ? 'pl-8' : 'font-medium'}>{acc.name}</TableCell>
                  <TableCell>
                    <span className="bg-muted rounded px-2 py-0.5 text-xs capitalize">{typeLabels[acc.type] ?? acc.type}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={acc.balanceBdt} className="font-semibold" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
