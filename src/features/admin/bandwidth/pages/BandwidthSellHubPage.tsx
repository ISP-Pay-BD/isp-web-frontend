'use client';

import Link from 'next/link';
import { ArrowRight, Users, FileText, Activity } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

const LINKS = [
  {
    href: '/admin/bandwidth/sell/clients',
    label: 'Wholesale Clients',
    icon: Users,
    desc: 'POP and corporate bandwidth buyers',
  },
  {
    href: '/admin/bandwidth/sell/invoices',
    label: 'Sales Invoices',
    icon: FileText,
    desc: 'Generated invoices and payment status',
  },
] as const;

export function BandwidthSellHubPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();

  if (isLoading) return <PageSkeleton variant="dashboard" rows={4} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load bandwidth sell hub"
          description="Could not fetch wholesale overview."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const clients = data?.sellClients ?? [];
  const invoices = data?.invoices ?? [];
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const openInvoices = invoices.filter((i) => i.status !== 'paid').length;
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <div>
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
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{activeClients}</span>{' '}
          <span className="text-muted-foreground">active clients</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{openInvoices}</span>{' '}
          <span className="text-muted-foreground">open invoices</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{paidInvoices}</span>{' '}
          <span className="text-muted-foreground">paid this month</span>
        </p>
      </div>

      {/* Quick Links */}
      <ul className="divide-y divide-border border-y border-border">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-4 py-4 no-underline transition-colors hover:bg-muted/40"
            >
              <link.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
