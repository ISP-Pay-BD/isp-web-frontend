'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyDisplay, PageSkeleton, EmptyState } from '@/components/shared';
import { Receipt } from 'lucide-react';
import { useOtcReport } from '../hooks/use-otc-report';

export function OtcReportPage() {
  const { data: otcReport = [], isLoading, isError, refetch } = useOtcReport();

  const totalCollections = otcReport.reduce((sum, r) => sum + r.collectionsBdt, 0);
  const totalExpenses = otcReport.reduce((sum, r) => sum + r.expensesBdt, 0);
  const latestClosing = otcReport[0]?.closingBdt ?? 0;

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load OTC report" description="Could not load daily cash position." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">OTC Report</h1>
        <p className="text-muted-foreground text-sm">One-time charges, installation fees, and daily cash position summary.</p>
      </PageHero>
      <PageContent className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">
              <CurrencyDisplay amount={totalCollections} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">collections</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              <CurrencyDisplay amount={totalExpenses} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">expenses</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              <CurrencyDisplay amount={latestClosing} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">current balance</span>
          </p>
        </div>

        <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3.5 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-4 w-4 text-primary" />
              </span>
              Daily Cash Position
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Opening Balance</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Collections</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Expenses</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Closing Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otcReport.map((row) => (
                <TableRow key={row.date} className="group border-border/40 hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs">{row.date}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <CurrencyDisplay amount={row.openingBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +<CurrencyDisplay amount={row.collectionsBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                    -<CurrencyDisplay amount={row.expensesBdt} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold">
                    <CurrencyDisplay amount={row.closingBdt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageContent>
    </div>
  );
}
