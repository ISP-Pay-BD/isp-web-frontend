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
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
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
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerDashboard();
  const usage = useSessionUsage();
  const notices = useLatestNotices();
  const contact = useSupportContact();
  const quickReset = useQuickReset();

  if (isLoading) {
    return (
      <CustomerPageShell title="Dashboard" subtitle="Loading your connection details...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Dashboard" subtitle="Welcome to your ISP portal">
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
        const message = res.message || 'Session reset requested.';
        if (res.status === 'success') toast.success(message);
        else toast.info(message);
      },
    });
  };

  return (
    <CustomerPageShell
      title="Dashboard"
      subtitle={`Welcome back${data.name ? `, ${data.name}` : ''}. Manage your internet service, payments, and router.`}
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
            Sync Status
          </Button>
          <Link href="/customer/payments/pay">
            <Button className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
              <CreditCard className="mr-2 h-4 w-4" />
              {pkg.priceBdt > 0 ? `Pay Bill ${formatBdtWithSymbol(pkg.priceBdt)}` : 'Pay Bill'}
            </Button>
          </Link>
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
                  Subscription expiring in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}!
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recharge before {formatDate(data.expiresAt)} to avoid broadband interruption.
                </p>
              </div>
            </div>
            <Link href="/customer/subscription">
              <Button size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/20 text-xs font-semibold">
                Renew Now
              </Button>
            </Link>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200 backdrop-blur-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
              </div>
              <div>
                <span className="font-semibold text-sm">Broadband connection expired / suspended</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renew your subscription to resume internet service.
                </p>
              </div>
            </div>
            <Link href="/customer/subscription">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs">
                Renew Now
              </Button>
            </Link>
          </div>
        )}

        {/* Hero Bento: Current Plan & live session */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border bg-card p-6">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-primary">Current plan</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {pkg.name || 'No package assigned'}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    ID: {data.userId}
                    {data.expiresAt ? ` · Valid till ${formatDate(data.expiresAt)}` : ''}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2.5 py-0.5 text-xs font-medium',
                    isActive
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
                  )}
                >
                  {titleCase(data.subscriptionStatus)}
                </Badge>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4">
                <div>
                  <dt className="text-[10px] tracking-wide text-muted-foreground">Speed</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">{pkg.bandwidth || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-wide text-muted-foreground">Fee</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    ৳<NumberFlow value={pkg.priceBdt} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-wide text-muted-foreground">Expires</dt>
                  <dd
                    className={cn(
                      'mt-1 text-lg font-semibold tabular-nums',
                      isExpiringSoon && 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {daysLeft === null ? (
                      '—'
                    ) : (
                      <>
                        <NumberFlow value={Math.max(0, daysLeft)} />
                        <span className="ml-1 text-xs font-normal text-muted-foreground">days</span>
                      </>
                    )}
                  </dd>
                </div>
              </dl>

              {data.pppoeUsername && (
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">PPPoE login</span>
                  <span className="font-mono">{data.pppoeUsername}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border dark:border-white/15 flex flex-wrap gap-2.5">
              <Link href="/customer/payments/pay" className="flex-1 min-w-[140px]">
                <Button className="ui-press h-10 w-full bg-primary font-semibold text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </Link>
              <Link href="/customer/subscription" className="flex-1 min-w-[140px]">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent font-semibold h-10 transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/25 dark:text-white"
                >
                  Subscription Details
                </Button>
              </Link>
            </div>
          </div>

          {/* Live PPPoE session counters (GET /v1/customer/usage) */}
          <div className="lg:col-span-7 flex">
            <Card className="flex flex-col justify-between w-full border-border/80 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-primary" />
                  Current session traffic
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Byte counters on your PPPoE session since it last connected
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
                    <span>{errorMessage(usage.error, 'Session traffic is not available right now.')}</span>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => usage.refetch()}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <DownloadCloud className="h-3.5 w-3.5 text-primary" /> RX
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberFlow value={usage.data.rxMb} />
                        <span className="ml-1 text-xs font-normal text-muted-foreground">MB</span>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <UploadCloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> TX
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        <NumberFlow value={usage.data.txMb} />
                        <span className="ml-1 text-xs font-normal text-muted-foreground">MB</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {router ? `Router: ${router.name || '—'}${router.status ? ` (${router.status})` : ''}` : 'No router linked'}
                  </span>
                  <Link
                    href="/customer/router"
                    className="text-primary hover:underline font-semibold flex items-center gap-1 group"
                  >
                    Router Diagnostics
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
            <p className="text-xs text-muted-foreground tracking-wide font-medium">Monthly bill</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              <span className="text-sm font-medium text-primary">৳</span>
              <NumberFlow value={pkg.priceBdt} />
            </p>
            <Link href="/customer/payments/pay" className="inline-flex items-center text-xs text-primary font-medium mt-1 hover:underline">
              Pay now <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">Subscription</p>
            <p className={cn('mt-0.5 font-semibold text-base', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
              {titleCase(data.subscriptionStatus)}
            </p>
            <Link href="/customer/subscription" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              Details <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">Support</p>
            <p className="mt-0.5 font-semibold tabular-nums text-base">
              <NumberFlow value={openTickets.length} />
              <span className="text-sm font-medium text-muted-foreground ml-1">open</span>
            </p>
            <Link href="/customer/support" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              View tickets <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide font-medium">Last payment</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              {lastPaid ? formatBdtWithSymbol(lastPaid.amountBdt) : '—'}
            </p>
            <Link href="/customer/payments" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              {lastPaid ? formatDate(lastPaid.paidAt) : 'Payment history'} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick router tools</CardTitle>
                <CardDescription className="text-xs">Self-service internet troubleshooting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleQuickReset}
                  disabled={quickReset.isPending}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition text-left group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Reset my connection</div>
                    <div className="text-[11px] text-muted-foreground">
                      {quickReset.data?.message || 'Re-establish your PPPoE session on the network'}
                    </div>
                  </div>
                  <span className="h-8 px-2.5 text-xs text-primary font-medium shrink-0 inline-flex items-center">
                    {quickReset.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Run'}
                  </span>
                </button>

                <Link
                  href="/customer/router/wifi"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Change WiFi SSID & Password</div>
                    <div className="text-[11px] text-muted-foreground">Update your wireless credentials</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/customer/router/devices"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Connection & devices</div>
                    <div className="text-[11px] text-muted-foreground">Session status and connected devices</div>
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
                    Provider Notices
                  </CardTitle>
                  <Link href="/customer/news" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
                    All News <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <CardDescription className="text-xs">Maintenance alerts & announcements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)
                ) : notices.isError ? (
                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span>{errorMessage(notices.error, 'Could not load notices.')}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => notices.refetch()}>
                      Retry
                    </Button>
                  </div>
                ) : (notices.data?.items.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground">Your provider has not published any notices yet.</p>
                ) : (
                  notices.data?.items.map((notice) => (
                    <div key={notice.id} className="border-b border-border/60 pb-2.5 last:border-0 last:pb-0 hover:bg-accent/30 p-1.5 rounded-md transition-colors">
                      <h4 className="text-xs font-bold line-clamp-1 text-foreground">{notice.title}</h4>
                      {notice.details && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{notice.details}</p>
                      )}
                      <span className="text-[10px] text-muted-foreground/70 font-mono mt-1 block">
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
                  Emergency Support
                </CardTitle>
                <CardDescription className="text-xs">{support?.name || 'Your internet provider'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {contact.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
                ) : contact.isError || !support ? (
                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                    <span>{errorMessage(contact.error, 'Support contact is not available.')}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => contact.refetch()}>
                      Retry
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
                          <div className="text-xs text-muted-foreground">Phone Helpline</div>
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
                          <div className="text-xs text-muted-foreground">WhatsApp Support</div>
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
                          <div className="text-xs text-muted-foreground">Email Helpdesk</div>
                          <div className="text-sm font-bold truncate">{support.email}</div>
                        </div>
                      </a>
                    )}

                    {!support.mobile && !support.whatsapp && !support.email && (
                      <p className="text-xs text-muted-foreground">
                        Your provider has not published contact details. Open a support ticket instead.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerPageShell>
  );
}
