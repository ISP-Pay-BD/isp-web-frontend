'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowRight,
  Layers,
  Truck,
  FileText,
  Package,
  Activity,
  Wifi,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { formatBdtWithSymbol } from '@/lib/format';

const LINKS = [
  { href: '/admin/bandwidth/buy/items', label: 'Catalog Items', icon: Package, desc: 'Upstream transit and peering products', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { href: '/admin/bandwidth/buy/categories', label: 'Categories', icon: Layers, desc: 'DIA, BDIX, CDN groupings', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { href: '/admin/bandwidth/buy/providers', label: 'Providers', icon: Truck, desc: 'Upstream vendors and contacts', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { href: '/admin/bandwidth/buy/bills', label: 'Purchase Bills', icon: FileText, desc: 'Procurement invoices and VAT', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
] as const;

export function BandwidthBuyHubPage() {
  const { data, isLoading } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={4} />;

  const summary = data?.summary;
  const bills = data?.purchaseBills ?? [];
  const openBills = bills.filter((b) => b.status === 'pending').length;

  return (
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Bandwidth Buy"
          subtitle="Procure upstream IP transit, BDIX peering, and cache bandwidth"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Bandwidth Buy' },
          ]}
          actions={
            <Button variant="outline" size="sm" render={<Link href="/admin/bandwidth/daily-bill" />} className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Daily bill
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Purchased Capacity"
          value={`${summary?.totalPurchasedMbps ?? 0} Mbps`}
          description="Total upstream bandwidth"
          icon={ArrowDownToLine}
        />
        <StatCard
          title="Utilization"
          value={`${summary?.utilizationPercent ?? 0}%`}
          description="Current usage rate"
          icon={Wifi}
        />
        <StatCard
          title="Open Bills"
          value={String(openBills)}
          description="Pending payments"
          icon={Receipt}
        />
        <StatCard
          title="Monthly Spend"
          value={formatBdtWithSymbol(summary?.monthlyCostBdt ?? 0)}
          description="Current month total"
          icon={DollarSign}
        />
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link, idx) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <Link href={link.href} className="block">
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border ${link.bg} ${link.color} ${link.border} group-hover:scale-110 transition-transform duration-200`}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{link.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors">
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
