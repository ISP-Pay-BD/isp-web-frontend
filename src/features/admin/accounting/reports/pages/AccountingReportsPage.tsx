'use client';

import { useAccountingReports } from '../hooks/use-accounting-reports';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay } from '@/components/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, FileSpreadsheet, TrendingUp } from 'lucide-react';

export function AccountingReportsPage() {
  const { reports, isLoading, isError, refetch } = useAccountingReports();

  if (isLoading) return <PageSkeleton rows={6} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load accounting reports"
        description="Could not load financial report summaries."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accounting Reports</h1>
        <p className="text-muted-foreground text-sm">Profit &amp; loss, cash flow, and receivables aging for ISP operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Available Reports" value={reports.length} description="Generated summaries" icon={FileSpreadsheet} />
        <StatCard title="Latest Period" value={reports[0]?.period ?? '—'} description="Most recent run" icon={BarChart3} />
        <StatCard
          title="P&amp;L Net (Latest)"
          value={reports[0] ? <CurrencyDisplay amount={reports[0].netBdt} /> : '—'}
          description={reports[0]?.name ?? 'No data'}
          icon={TrendingUp}
        />
      </div>

      {reports.length === 0 ? (
        <EmptyState title="No reports generated" description="Run month-end close to populate reports." />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((rpt) => (
                <TableRow key={rpt.id}>
                  <TableCell className="font-medium">{rpt.name}</TableCell>
                  <TableCell className="font-mono text-xs">{rpt.period}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={rpt.netBdt} className="font-semibold text-emerald-600 dark:text-emerald-400" />
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
