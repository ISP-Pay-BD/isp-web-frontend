'use client';

import { useBalanceSheet } from '../hooks/use-balance-sheet';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Scale } from 'lucide-react';

function SectionBlock({
  title,
  total,
  items,
}: {
  title: string;
  total: number;
  items: Array<{ name: string; amountBdt: number }>;
}) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold">{title}</h3>
        <CurrencyDisplay amount={total} className="text-lg font-bold" />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.name} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <CurrencyDisplay amount={item.amountBdt} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BalanceSheetPage() {
  const { balanceSheet, isLoading, isError, refetch } = useBalanceSheet();

  if (isLoading) return <PageSkeleton rows={6} />;

  if (isError || !balanceSheet) {
    return (
      <EmptyState
        title="Failed to load balance sheet"
        description="Could not generate the financial snapshot."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1>
          <p className="text-muted-foreground text-sm">Assets, liabilities, and equity as of {balanceSheet.asOf}.</p>
        </div>
        <Scale className="text-muted-foreground h-8 w-8" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock title="Assets" total={balanceSheet.assets.totalBdt} items={balanceSheet.assets.items} />
        <SectionBlock title="Liabilities" total={balanceSheet.liabilities.totalBdt} items={balanceSheet.liabilities.items} />
      </div>

      <div className="bg-primary/5 border-primary/20 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Equity</span>
          <CurrencyDisplay amount={balanceSheet.equity.totalBdt} className="text-xl font-bold" />
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Assets ({balanceSheet.assets.totalBdt.toLocaleString()} ৳) = Liabilities + Equity (
          {(balanceSheet.liabilities.totalBdt + balanceSheet.equity.totalBdt).toLocaleString()} ৳)
        </p>
      </div>
    </div>
  );
}
