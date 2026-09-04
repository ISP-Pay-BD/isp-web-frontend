'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { motion } from 'framer-motion';
import { useAccountingReports } from '../hooks/use-accounting-reports';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function AccountingReportsPage() {
  const { reports, isLoading, isError, refetch } = useAccountingReports();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">Accounting Reports</h1>
        <p className="text-muted-foreground text-sm">Profit &amp; loss, cash flow, and receivables aging for ISP operations.</p>
      </PageHero>
      <PageContent className="space-y-6">

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Available Reports" value={reports.length} description="Generated summaries" icon={FileSpreadsheet} />
        <StatCard title="Latest Period" value={reports[0]?.period ?? '—'} description="Most recent run" icon={BarChart3} />
        <StatCard
          title="P&amp;L Net (Latest)"
          value={reports[0] ? <CurrencyDisplay amount={reports[0].netBdt} /> : '—'}
          description={reports[0]?.name ?? 'No data'}
          icon={TrendingUp}
        />
      </motion.div>

      {/* Reports Table */}
      <motion.div variants={fadeUp}>
        {reports.length === 0 ? (
          <EmptyState title="No reports generated" description="Run month-end close to populate reports." />
        ) : (
          <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-xs uppercase tracking-wider">Report</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Period</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider">Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rpt) => (
                  <TableRow key={rpt.id} className="group border-border/40 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium text-sm">{rpt.name}</TableCell>
                    <TableCell className="font-mono text-xs">{rpt.period}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay amount={rpt.netBdt} className="font-semibold text-emerald-600 dark:text-emerald-400" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>
    
      </PageContent>
    </motion.div>
  );
}
