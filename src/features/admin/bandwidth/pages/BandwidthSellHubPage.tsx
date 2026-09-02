'use client';

import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpFromLine, ArrowRight, Users, FileText } from 'lucide-react';
import { formatBdtWithSymbol } from '@/lib/format';

const LINKS = [
  { href: '/admin/bandwidth/sell/clients', label: 'Wholesale Clients', icon: Users, desc: 'POP and corporate bandwidth buyers' },
  { href: '/admin/bandwidth/sell/invoices', label: 'Sales Invoices', icon: FileText, desc: 'Generated invoices and payment status' },
] as const;

export function BandwidthSellHubPage() {
  const { data, isLoading } = useBandwidthData();

  if (isLoading) return <PageSkeleton rows={4} />;

  const clients = data?.sellClients ?? [];
  const invoices = data?.invoices ?? [];
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Sell"
        subtitle="Wholesale bandwidth sales to POPs and corporate clients"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Sell' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/admin/bandwidth/daily-bill" />}>
            Daily bill
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active clients" value={String(clients.filter((c) => c.status === 'active').length)} icon={ArrowUpFromLine} />
        <StatCard title="Open invoices" value={String(invoices.filter((i) => i.status !== 'paid').length)} />
        <StatCard title="Paid this month" value={String(paidInvoices)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LINKS.map((link) => (
          <Card key={link.href}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <link.icon className="text-primary h-5 w-5" />
                <CardTitle className="text-base">{link.label}</CardTitle>
              </div>
              <CardDescription>{link.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" render={<Link href={link.href} />}>
                Open
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
