'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeUp } from '@/lib/animations';

const LINKS = [
  { href: '/admin/bandwidth/sell/clients', label: 'Wholesale Clients', icon: Users, desc: 'POP and corporate bandwidth buyers', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { href: '/admin/bandwidth/sell/invoices', label: 'Sales Invoices', icon: FileText, desc: 'Generated invoices and payment status', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
] as const;

export function BandwidthSellHubPage() {
  const { data, isLoading } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={4} />;

  const clients = data?.sellClients ?? [];
  const invoices = data?.invoices ?? [];
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const openInvoices = invoices.filter((i) => i.status !== 'paid').length;
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;

  return (
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Bandwidth Sell"
          subtitle="Wholesale bandwidth sales to POPs and corporate clients"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Bandwidth Sell' },
          ]}
          actions={
            <Button variant="outline" size="sm" render={<Link href="/admin/bandwidth/daily-bill" />} className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Daily bill
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Clients"
          value={String(activeClients)}
          description="Connected resellers"
          icon={Users}
        />
        <StatCard
          title="Open Invoices"
          value={String(openInvoices)}
          description="Awaiting payment"
          icon={CreditCard}
        />
        <StatCard
          title="Paid This Month"
          value={String(paidInvoices)}
          description="Completed payments"
          icon={CheckCircle2}
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

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
