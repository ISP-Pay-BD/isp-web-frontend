'use client';

import Link from 'next/link';
import { ArrowRight, Users, FileText, Activity } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/locale-context';
import { useBandwidthClients, useBandwidthInvoices } from '../hooks/useBandwidthSell';
import { dayText, paidDueLabel, type Translate } from '../utils';

const sellModules = (t: Translate) =>
  [
    {
      href: '/admin/bandwidth/sell/clients',
      label: t('admin.bandwidth.sellHub.modClients', 'Sell Clients'),
      icon: Users,
      color: 'text-primary bg-primary/10 border-primary/20',
      desc: t('admin.bandwidth.sellHub.modClientsDesc', 'POP and corporate clients that bandwidth is sold to.'),
    },
    {
      href: '/admin/bandwidth/sell/invoices',
      label: t('admin.bandwidth.sellHub.modInvoices', 'Sales Invoices'),
      icon: FileText,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      desc: t('admin.bandwidth.sellHub.modInvoicesDesc', 'Issue invoices, record collections and track outstanding dues.'),
    },
    {
      href: '/admin/bandwidth/daily-bill',
      label: t('admin.bandwidth.buyHub.modDaily', 'Daily Bill'),
      icon: Activity,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      desc: t('admin.bandwidth.sellHub.modDailyDesc', 'Invoices per POP client for a day or date range.'),
    },
  ] as const;

export function BandwidthSellHubPage() {
  const { t } = useLocale();
  // All-time totals + the five newest invoices (one request).
  const invoices = useBandwidthInvoices({ page: 1, pageSize: 5 });
  const clients = useBandwidthClients({ page: 1, pageSize: 1 });
  const active = useBandwidthClients({ page: 1, pageSize: 1, popStatus: 'active' });

  if (invoices.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (invoices.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.bandwidth.sellHub.loadFailed', 'Failed to load bandwidth sell hub')} description={t('admin.bandwidth.sellHub.loadFailedHint', 'Could not fetch the sales overview.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => invoices.refetch()} />
      </div>
    );
  }

  const totals = invoices.data?.totals;
  const recent = invoices.data?.items ?? [];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.sellHub.title', 'Bandwidth Sell Hub')}
        subtitle={t('admin.bandwidth.sellHub.subtitle', 'Bandwidth sold to POP and corporate clients: clients, invoices and collections')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.bandwidth.shared.breadcrumbBandwidth', 'Bandwidth') },
          { label: t('nav.bandwidth-sell', 'Bandwidth Sell') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/80" render={<Link href="/admin/bandwidth/sell/clients" />}>
                <Users className="h-3.5 w-3.5 text-primary" /> {t('admin.bandwidth.sellHub.manageClients', 'Manage Clients')}
              </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5" render={<Link href="/admin/bandwidth/sell/invoices" />}>
                <FileText className="h-3.5 w-3.5" /> {t('admin.bandwidth.sellHub.modInvoices', 'Sales Invoices')}
              </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{clients.data?.meta.total ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.sellHub.statClients', 'clients · {n} active', { n: active.data?.meta.total ?? '—' })}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{formatBdtWithSymbol(totals?.all ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.sellHub.statInvoiced', 'invoiced · {today} today', { today: formatBdtWithSymbol(totals?.today ?? 0) })}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatBdtWithSymbol(totals?.received ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.sellHub.statCollected', 'collected')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(totals?.due ?? 0)}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.sellHub.statReceivables', 'outstanding client receivables')}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sellModules(t).map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden hover:border-primary/40 hover:shadow-md transition duration-200 h-full group">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className={cn('p-2.5 rounded-xl border shrink-0 w-fit', mod.color)}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{mod.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{mod.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> {t('admin.bandwidth.sellHub.recent', 'Recent sales invoices')}
          </CardTitle>
          <CardDescription className="text-xs">{totals ? t('admin.bandwidth.sellHub.recentCount', '{n} invoices in total', { n: totals.count }) : null}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('admin.bandwidth.sellHub.noInvoices', 'No sales invoices issued yet.')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {recent.map((inv) => (
                <div key={inv.requisitionId} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">{inv.clientName || '—'}</span>
                    <StatusBadge status={inv.status === 'paid' ? 'paid' : 'pending'} label={paidDueLabel(t, inv.status === 'paid')} />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {inv.requisitionId} · {dayText(inv.requisitionDate)}
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground text-xs">{t('admin.bandwidth.shared.total', 'Total')}</span>
                    <span className="font-mono font-semibold text-foreground">{formatBdtWithSymbol(inv.total)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground text-xs">{t('admin.bandwidth.shared.due', 'Due')}</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(Math.max(0, inv.due))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
