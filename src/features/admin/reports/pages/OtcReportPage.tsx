'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyDisplay } from '@/components/shared';
import { otcReport } from '@/data/admin/accounting.data';
import { Receipt, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function OtcReportPage() {
  const totalCollections = otcReport.reduce((sum, r) => sum + r.collectionsBdt, 0);
  const totalExpenses = otcReport.reduce((sum, r) => sum + r.expensesBdt, 0);
  const latestClosing = otcReport[0]?.closingBdt ?? 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <PageHero>
        <h1 className="text-2xl font-bold tracking-tight">OTC Report</h1>
        <p className="text-muted-foreground text-sm">One-time charges, installation fees, and daily cash position summary.</p>
      </PageHero>
      <PageContent className="space-y-6">

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">
                <CurrencyDisplay amount={totalCollections} />
              </div>
              <div className="text-xs text-muted-foreground font-medium">Total Collections</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">
                <CurrencyDisplay amount={totalExpenses} />
              </div>
              <div className="text-xs text-muted-foreground font-medium">Total Expenses</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm ring-1 ring-foreground/5">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">
                <CurrencyDisplay amount={latestClosing} />
              </div>
              <div className="text-xs text-muted-foreground font-medium">Current Balance</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTC Table */}
      <motion.div variants={fadeUp}>
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
              {otcReport.map((row, idx) => (
                <TableRow key={idx} className="group border-border/40 hover:bg-muted/20 transition-colors">
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
      </motion.div>
    
      </PageContent>
    </motion.div>
  );
}
