'use client';

import Link from 'next/link';
import {
  CreditCard,
  LifeBuoy,
  ArrowRight,
  ShieldAlert,
  DownloadCloud,
  UploadCloud,
  Phone,
  MessageCircle,
  Mail,
  Newspaper,
  AlertTriangle,
  Activity,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  useSupportContact,
} from '@/features/customer/shared';
import {
  useCustomerDashboard,
  useLatestNotices,
  useSessionUsage,
  useQuickReset,
} from '../hooks/use-customer-dashboard';
import { whatsappHref } from '@/lib/api/adapters/customer.adapter';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatBdtWithSymbol, formatDate, numberLocale } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { ValidityRing } from '../components/ValidityRing';
import { toast } from 'sonner';

const DAY_MS = 1000 * 60 * 60 * 24;

function daysUntil(value: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / DAY_MS);
}

const titleCase = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—');

export function CustomerDashboardPage() {
  const { t } = useLocale();
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerDashboard();
  const usage = useSessionUsage();
  const notices = useLatestNotices();
  const contact = useSupportContact();
  const quickReset = useQuickReset();
  const [confirmReset, setConfirmReset] = useState(false);

  if (isLoading) {
    return (
      <CustomerPageShell title={t('customer.dashboard.title', 'Dashboard')} subtitle={t('customer.dashboard.loading', 'Loading your connection details…')}>
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title={t('customer.dashboard.title', 'Dashboard')} subtitle={t('customer.dashboard.welcomeShort', 'Welcome to your ISP portal')}>
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { package: pkg, openTickets, recentPayments, router } = data;
  const isActive = data.isActive;
  const daysLeft = daysUntil(data.expiresAt);
  const isExpiringSoon = isActive && daysLeft !== null && daysLeft > 0 && daysLeft <= 7;
  const isExpired = !isActive || (daysLeft !== null && daysLeft <= 0);
  const lastPaid = recentPayments.find((p) => p.status === 'paid');
  const support = contact.data;

  const handleQuickReset = () => {
    quickReset.mutate(undefined, {
      onSuccess: (res) => {
        const message = res.message || t('customer.dashboard.resetRequested', 'Session reset requested.');
        if (res.status === 'success') toast.success(message);
        else toast.info(message);
      },
    });
  };

  return (
    <CustomerPageShell
      title={t('customer.dashboard.title', 'Dashboard')}
      subtitle={
        data.name
          ? t('customer.dashboard.welcomeName', 'Welcome back, {name}. Manage your internet service, payments and router.', { name: data.name })
          : t('customer.dashboard.welcome', 'Welcome back. Manage your internet service, payments and router.')
      }
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => {
              refetch();
              usage.refetch();
            }}
            className="hidden sm:flex items-center gap-1.5 h-9 font-medium text-xs shadow-xs hover:border-primary/40 transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', isFetching && 'animate-spin')} />
            {t('customer.dashboard.refresh', 'Refresh')}
          </Button>
          <Button className="hidden h-9 bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex" render={<Link href="/customer/payments/pay" />}>
              <CreditCard className="mr-2 h-4 w-4" />
              {pkg.priceBdt > 0
                ? t('customer.dashboard.payAmount', 'Pay {amount}', { amount: formatBdtWithSymbol(pkg.priceBdt) })
                : t('customer.dashboard.payBill', 'Pay bill')}
            </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isExpiringSoon && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 backdrop-blur-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
              </div>
              <div>
                <span className="font-semibold text-sm">
                  {daysLeft === 1
                    ? t('customer.dashboard.expiringOne', 'Subscription expires in 1 day!')
                    : t('customer.dashboard.expiringMany', 'Subscription expires in {n} days!', { n: daysLeft ?? 0 })}
                </span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('customer.dashboard.expiringHint', 'Renew before {date} to avoid an interruption.', { date: formatDate(data.expiresAt) })}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 border-amber-500/50 hover:bg-amber-500/20 text-xs font-semibold" render={<Link href="/customer/payments/pay" />}>
                {t('customer.dashboard.renewNow', 'Renew now')}
              </Button>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200 backdrop-blur-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
              </div>
              <div>
                <span className="font-semibold text-sm">{t('customer.dashboard.expiredTitle', 'Your connection has expired or is suspended')}</span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('customer.dashboard.expiredHint', 'Renew your subscription to bring your internet back.')}
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs" render={<Link href="/customer/payments/pay" />}>
                {t('customer.dashboard.renewNow', 'Renew now')}
              </Button>
          </div>
        )}

        {/* Hero Bento: Current Plan & live session */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-primary">{t('customer.dashboard.currentPlan', 'Current plan')}</p>
                <Badge variant="outline" tone={isActive ? 'success' : 'danger'} className="px-2.5 py-0.5 text-xs font-medium">
                  {isActive ? t('customer.dashboard.statusActive', 'Active') : t('customer.dashboard.statusInactive', titleCase(data.subscriptionStatus))}
                </Badge>
              </div>

              <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                <ValidityRing daysLeft={daysLeft} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {pkg.name || t('customer.dashboard.noPackage', 'No package assigned')}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pkg.bandwidth || '—'}
                    {' · '}
                    <span className="font-mono tabular-nums">
                      ৳<NumberFlow locales={numberLocale()} value={pkg.priceBdt} />
                    </span>
                    {t('customer.dashboard.perMonth', ' / month')}
                  </p>
                  {data.expiresAt ? (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {t('customer.dashboard.validTill', 'Valid till {date}', { date: formatDate(data.expiresAt) })}
                    </p>
                  ) : null}
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {t('customer.dashboard.accountId', 'ID')}: {data.userId}
                    {data.pppoeUsername ? ` · PPPoE: ${data.pppoeUsername}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-border pt-4 dark:border-white/15">
              <Button className="ui-press h-12 w-full flex-1 min-w-[160px] gap-2 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90" render={<Link href="/customer/payments/pay" />}>
                  <CreditCard className="h-5 w-5" />
                  {pkg.priceBdt > 0
                    ? t('customer.dashboard.payAmount', 'Pay {amount}', { amount: formatBdtWithSymbol(pkg.priceBdt) })
                    : t('customer.dashboard.payBill', 'Pay bill')}
                </Button>
              <Button variant="outline" className="h-12 w-full flex-1 min-w-[160px] border-border font-semibold hover:bg-accent" render={<Link href="/customer/subscription" />}>
                  {t('customer.dashboard.subscriptionDetails', 'Subscription details')}
                </Button>
            </div>
          </div>

          {/* Live PPPoE session counters (GET /v1/customer/usage) */}
          <div className="lg:col-span-7 flex">
            <Card className="flex flex-col justify-between w-full border-border/80 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-primary" />
                  {t('customer.dashboard.sessionTitle', 'Current session traffic')}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  {t('customer.dashboard.sessionDesc', 'Data counters for your PPPoE session since it last connected')}
                  {router?.name ? ` · ${router.name}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {usage.isLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                ) : usage.isError || !usage.data ? (
                  <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground flex items-center justify-between gap-3">
                    <span>{errorMessage(usage.error, t('customer.dashboard.sessionUnavailable', 'Session traffic is not available right now.'))}</span>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => usage.refetch()}>
                      {t('common.retry', 'Retry')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <DownloadCloud className="h-3.5 w-3.5 text-primary" /> RX
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberFlow locales={numberLocale()} value={usage.data.rxMb} />
                        <span className="ml-1 text-xs font-normal text-muted-foreground">MB</span>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <UploadCloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> TX
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberFlow locales={numberLocale()} value={usage.data.txMb} />
                        <span className="ml-1 text-xs font-normal text-muted-foreground">MB</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {router
                      ? t('customer.dashboard.routerLine', 'Router: {name}', { name: `${router.name || '—'}${router.status ? ` (${router.status})` : ''}` })
                      : t('customer.dashboard.noRouter', 'No router linked')}
                  </span>
                  <Link
                    href="/customer/router"
                    className="text-primary hover:underline font-semibold flex items-center gap-1 group"
                  >
                    {t('customer.dashboard.routerDiagnostics', 'Router diagnostics')}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary strip — bill, subscription, tickets, last payment */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-border/60 py-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">{t('customer.dashboard.monthlyBill', 'Monthly bill')}</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              <span className="text-sm font-medium text-primary">৳</span>
              <NumberFlow locales={numberLocale()} value={pkg.priceBdt} />
            </p>
            <Link href="/customer/payments/pay" className="inline-flex items-center text-xs text-primary font-medium mt-1 hover:underline">
              {t('customer.dashboard.payNow', 'Pay now')} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">{t('customer.dashboard.subscription', 'Subscription')}</p>
            <p className={cn('mt-0.5 font-semibold text-base', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
              {isActive ? t('customer.dashboard.statusActive', 'Active') : t('customer.dashboard.statusInactive', titleCase(data.subscriptionStatus))}
            </p>
            <Link href="/customer/subscription" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              {t('customer.dashboard.details', 'Details')} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">{t('customer.dashboard.support', 'Support')}</p>
            <p className="mt-0.5 font-semibold tabular-nums text-base">
              <NumberFlow locales={numberLocale()} value={openTickets.length} />
              <span className="text-sm font-medium text-muted-foreground ml-1">{t('customer.dashboard.open', 'open')}</span>
            </p>
            <Link href="/customer/support" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              {t('customer.dashboard.viewTickets', 'View tickets')} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">{t('customer.dashboard.lastPayment', 'Last payment')}</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              {lastPaid ? formatBdtWithSymbol(lastPaid.amountBdt) : '—'}
            </p>
            <Link href="/customer/payments" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              {lastPaid ? formatDate(lastPaid.paidAt) : t('customer.dashboard.paymentHistory', 'Payment history')} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('customer.dashboard.toolsTitle', 'Quick router tools')}</CardTitle>
                <CardDescription className="text-xs">{t('customer.dashboard.toolsDesc', 'Fix common internet problems yourself')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  disabled={quickReset.isPending}
                  className="w-full min-h-14 flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition text-left group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{t('customer.dashboard.resetTitle', 'Reset my connection')}</div>
                    <div className="text-sm text-muted-foreground">
                      {quickReset.data?.message || t('customer.dashboard.resetDesc', 'Re-establish your PPPoE session on the network')}
                    </div>
                  </div>
                  <span className="h-8 px-2.5 text-xs text-primary font-medium shrink-0 inline-flex items-center">
                    {quickReset.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : t('customer.dashboard.run', 'Run')}
                  </span>
                </button>

                <Link
                  href="/customer/router/wifi"
                  className="flex min-h-14 items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{t('customer.dashboard.wifiTitle', 'Change Wi-Fi name & password')}</div>
                    <div className="text-sm text-muted-foreground">{t('customer.dashboard.wifiDesc', 'Update your wireless credentials')}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/customer/router/devices"
                  className="flex min-h-14 items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{t('customer.dashboard.devicesTitle', 'Connection & devices')}</div>
                    <div className="text-sm text-muted-foreground">{t('customer.dashboard.devicesDesc', 'Session status and connected devices')}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Provider notices (GET /v1/news) */}
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-primary" />
                    {t('customer.dashboard.noticesTitle', 'Provider notices')}
                  </CardTitle>
                  <Link href="/customer/news" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
                    {t('customer.dashboard.allNews', 'All news')} <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <CardDescription className="text-xs">{t('customer.dashboard.noticesDesc', 'Maintenance alerts & announcements')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)
                ) : notices.isError ? (
                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span>{errorMessage(notices.error, t('customer.dashboard.noticesError', 'Could not load notices.'))}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => notices.refetch()}>
                      {t('common.retry', 'Retry')}
                    </Button>
                  </div>
                ) : (notices.data?.items.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('customer.dashboard.noticesEmpty', 'Your provider has not published any notices yet.')}</p>
                ) : (
                  notices.data?.items.map((notice) => (
                    <div key={notice.id} className="border-b border-border/60 pb-2.5 last:border-0 last:pb-0 hover:bg-accent/30 p-1.5 rounded-md transition-colors">
                      <h4 className="text-xs font-bold line-clamp-1 text-foreground">{notice.title}</h4>
                      {notice.details && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{notice.details}</p>
                      )}
                      <span className="text-xs text-muted-foreground/70 font-mono mt-1 block">
                        {formatDate(notice.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provider helpline (GET /v1/customer/support/contact) */}
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-primary" />
                  {t('customer.dashboard.supportTitle', 'Emergency support')}
                </CardTitle>
                <CardDescription className="text-xs">{support?.name || t('customer.dashboard.provider', 'Your internet provider')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {contact.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
                ) : contact.isError || !support ? (
                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span>{errorMessage(contact.error, t('customer.dashboard.supportError', 'Support contact is not available.'))}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => contact.refetch()}>
                      {t('common.retry', 'Retry')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {support.mobile && (
                      <a
                        href={`tel:${support.mobile}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition group"
                      >
                        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t('customer.dashboard.phone', 'Phone helpline')}</div>
                          <div className="text-sm font-bold font-mono">{support.mobile}</div>
                        </div>
                      </a>
                    )}

                    {support.whatsapp && whatsappHref(support.whatsapp) && (
                      <a
                        href={whatsappHref(support.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition group"
                      >
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t('customer.dashboard.whatsapp', 'WhatsApp support')}</div>
                          <div className="text-sm font-bold font-mono">{support.whatsapp}</div>
                        </div>
                      </a>
                    )}

                    {support.email && (
                      <a
                        href={`mailto:${support.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-blue-500/40 hover:bg-blue-500/5 transition group"
                      >
                        <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">{t('customer.dashboard.email', 'Email helpdesk')}</div>
                          <div className="text-sm font-bold truncate">{support.email}</div>
                        </div>
                      </a>
                    )}

                    {!support.mobile && !support.whatsapp && !support.email && (
                      <p className="text-sm text-muted-foreground">
                        {t('customer.dashboard.noContact', 'Your provider has not published contact details. Open a support ticket instead.')}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('customer.dashboard.resetConfirmTitle', 'Reset your connection?')}
        description={t('customer.dashboard.resetConfirmDesc', 'Your internet drops for a few seconds and then reconnects by itself.')}
        confirmLabel={t('customer.dashboard.resetConfirmYes', 'Yes, reset')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onConfirm={() => {
          setConfirmReset(false);
          handleQuickReset();
        }}
      />
    </CustomerPageShell>
  );
}
