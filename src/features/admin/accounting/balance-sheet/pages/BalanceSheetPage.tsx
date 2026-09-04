'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { motion } from 'framer-motion';
import {
  Scale,
  Landmark,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useBalanceSheet } from '../hooks/use-balance-sheet';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { staggerContainer } from '@/lib/animations';
import { cn } from '@/lib/utils';

function SectionBlock({
  title,
  total,
  items,
  icon,
  color,
  bg,
  border,
  delay,
}: {
  title: string;
  total: number;
  items: Array<{ name: string; amountBdt: number }>;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden h-full">
        <CardContent className="p-0">
          {/* Header */}
          <div className={cn('px-6 py-4 border-b border-border/50', bg)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-xl border', color, bg, border)}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{title}</h3>
                  <p className="text-[10px] text-muted-foreground">{items.length} line items</p>
                </div>
              </div>
              <Badge variant="outline" className={cn('text-sm font-bold font-mono px-3 py-1', color, bg, border)}>
                <CurrencyDisplay amount={total} />
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div className="p-4">
            <ul className="space-y-1">
              {items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    <CurrencyDisplay amount={item.amountBdt} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BalanceSheetPage() {
  const { balanceSheet, isLoading, isError, refetch } = useBalanceSheet();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Scale className="h-6 w-6" />
            </div>
            Balance Sheet
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Assets, liabilities, and equity as of {balanceSheet.asOf}.
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Assets & Liabilities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock
          title="Assets"
          total={balanceSheet.assets.totalBdt}
          items={balanceSheet.assets.items}
          icon={<Landmark className="h-5 w-5" />}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-500/5"
          border="border-blue-500/20"
          delay={0.1}
        />
        <SectionBlock
          title="Liabilities"
          total={balanceSheet.liabilities.totalBdt}
          items={balanceSheet.liabilities.items}
          icon={<CreditCard className="h-5 w-5" />}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/5"
          border="border-amber-500/20"
          delay={0.2}
        />
      </div>

      {/* Total Equity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      >
        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Total Equity</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assets ({balanceSheet.assets.totalBdt.toLocaleString()} ৳) = Liabilities + Equity (
                    {(balanceSheet.liabilities.totalBdt + balanceSheet.equity.totalBdt).toLocaleString()} ৳)
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-lg font-bold font-mono px-4 py-2">
                <CurrencyDisplay amount={balanceSheet.equity.totalBdt} />
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    
      </PageContent>
    </motion.div>
  );
}
