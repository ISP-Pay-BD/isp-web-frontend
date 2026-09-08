'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Activity,
  RefreshCw,
  Zap,
  ExternalLink,
  Signal,
  Check,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerDashboard } from '../hooks/use-customer-dashboard';
import { formatBdtWithSymbol, formatDate } from '@/lib/format';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

export function CustomerDashboardPage() {
  const { data, isLoading, isError, refetch } = useCustomerDashboard();
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (isLoading) {
    return (
      <CustomerPageShell title="Customer Dashboard" subtitle="Loading your network connection details...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Customer Dashboard" subtitle="Welcome to your ISP portal">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { subscription, paymentsSummary, openTicketsCount, latestNotices, emergencyContact, trafficData } = data;
  const isActive = subscription.status === 'active';

  // Expiry calculation
  const expiryDate = new Date(subscription.expiryDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = diffDays > 0 && diffDays <= 7;
  const isExpired = diffDays <= 0 || !isActive;

  const quotaPercent = Math.min(100, Math.round((subscription.quotaUsedGb / subscription.quotaTotalGb) * 100));
  const peakDownload = Math.max(...trafficData.map((d) => d.downloadMbps));
  const avgUpload = Number((trafficData.reduce((s, d) => s + d.uploadMbps, 0) / trafficData.length).toFixed(1));

  const handleQuickReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetDone(true);
      toast.success('Line Reset & DNS Cache flushed successfully', {
        description: 'Your PPPoE route has been renewed on the gateway.',
      });
      setTimeout(() => setResetDone(false), 3000);
    }, 1200);
  };

  return (
    <CustomerPageShell
      title="Dashboard"
      subtitle={`Welcome back, ${subscription.userId}. Manage your internet service, payments, and router.`}
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              toast.info('Connection status refreshed');
            }}
            className="hidden sm:flex items-center gap-1.5 h-9 font-medium text-xs shadow-xs hover:border-primary/40 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            Sync Status
          </Button>
          <Link href="/customer/payments/pay">
            <Button className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Bill {formatBdtWithSymbol(subscription.priceBdt)}
            </Button>
          </Link>
        </div>
      }
    >
      <div
        className="space-y-6"
      >
        {/* Expiry Warning Banner if expiring soon */}
                  {isExpiringSoon && (
            <div
              className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 backdrop-blur-xs shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Subscription expiring in {diffDays} days!</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recharge before {formatDate(subscription.expiryDate)} to avoid broadband interruption.
                  </p>
                </div>
              </div>
              <Link href="/customer/payments/pay">
                <Button size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/20 text-xs font-semibold">
                  Renew Now
                </Button>
              </Link>
            </div>
          )}

          {isExpired && (
            <div
              className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200 backdrop-blur-xs shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Broadband connection expired / suspended</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Please pay your monthly dues to resume high-speed internet service immediately.
                  </p>
                </div>
              </div>
              <Link href="/customer/payments/pay">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs">
                  Instant Recharge
                </Button>
              </Link>
            </div>
          )}
        
        {/* Hero Bento: Current Plan & Live Bandwidth Chart */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border bg-card p-6">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Current plan
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {subscription.packageName}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    ID: {subscription.userId} · Valid till {formatDate(subscription.expiryDate)}
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
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Speed</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    <NumberFlow value={subscription.speedMbps} />
                    <span className="ml-1 text-xs font-normal text-muted-foreground">Mbps</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Fee</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    ৳<NumberFlow value={subscription.priceBdt} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Expires</dt>
                  <dd
                    className={cn(
                      'mt-1 text-lg font-semibold tabular-nums',
                      isExpiringSoon && 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    <NumberFlow value={diffDays} />
                    <span className="ml-1 text-xs font-normal text-muted-foreground">days</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Monthly data</span>
                  <span className="font-mono">
                    {subscription.quotaUsedGb} / {subscription.quotaTotalGb} GB ({quotaPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Plan Card Actions */}
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

          {/* Real-time Traffic Throughput Chart (7 cols on lg) */}
          <div
            className="lg:col-span-7 flex"
          >
            <Card className="flex flex-col justify-between w-full border-border/80 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Activity className="h-4 w-4 text-primary" />
                      Live bandwidth traffic
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      PPPoE interface throughput (Mbps)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f75803] shadow-xs" />
                      Download (RX)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb] shadow-xs" />
                      Upload (TX)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f75803" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#f75803" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="timeLabel"
                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}M`}
                      />
                      <Tooltip
                        formatter={(val: unknown) => [`${val ?? 0} Mbps`]}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="downloadMbps"
                        name="Download"
                        stroke="#f75803"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#downloadGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="uploadMbps"
                        name="Upload"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#uploadGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <DownloadCloud className="h-3.5 w-3.5 text-primary" />
                    <span>Peak: <strong className="text-foreground">{peakDownload} Mbps</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <UploadCloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Avg Upload: <strong className="text-foreground">{avgUpload} Mbps</strong></span>
                  </div>
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

        {/* Summary strip — bill, health, tickets, paid */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-border/60 py-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Next bill</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              <span className="text-sm font-medium text-primary">৳</span>
              <NumberFlow value={subscription.priceBdt} />
            </p>
            <Link href="/customer/payments/pay" className="inline-flex items-center text-xs text-primary font-medium mt-1 hover:underline">
              Pay now <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Connection</p>
            <p className={cn('mt-0.5 font-semibold text-base', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
              {isActive ? 'Online' : 'Offline'}
            </p>
            <span className="inline-flex items-center text-xs text-muted-foreground mt-1">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" /> 0% packet drop
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Support</p>
            <p className="mt-0.5 font-semibold tabular-nums text-base">
              <NumberFlow value={openTicketsCount} />
              <span className="text-sm font-medium text-muted-foreground ml-1">open</span>
            </p>
            <Link href="/customer/support" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              View tickets <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total paid</p>
            <p className="mt-0.5 font-semibold tabular-nums font-mono text-base">
              <span className="text-sm font-medium text-muted-foreground">৳</span>
              <NumberFlow value={paymentsSummary.totalPaidBdt} />
            </p>
            <Link href="/customer/payments" className="inline-flex items-center text-xs text-muted-foreground font-medium mt-1 hover:text-foreground hover:underline">
              Payment history <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Tools */}
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick router tools</CardTitle>
                <CardDescription className="text-xs">Self-service internet troubleshooting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleQuickReset}
                  disabled={isResetting}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition-all text-left group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      Line Reset & DNS Flush
                      {resetDone && <Check className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Clear routing cache on the gateway</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-primary font-medium shrink-0">
                    {isResetting ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Run'
                    )}
                  </Button>
                </button>

                <Link
                  href="/customer/router/wifi"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Change WiFi SSID & Password</div>
                    <div className="text-[11px] text-muted-foreground">Update dual-band wireless credentials</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/customer/router/devices"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Inspect Connected Devices</div>
                    <div className="text-[11px] text-muted-foreground">See active IP & MAC DHCP leases</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Announcements / Notices Feed */}
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition-all">
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
                <CardDescription className="text-xs">Official maintenance alerts & announcements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestNotices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="border-b border-border/60 pb-2.5 last:border-0 last:pb-0 hover:bg-accent/30 p-1.5 rounded-md transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold line-clamp-1 text-foreground">{notice.title}</h4>
                      {notice.pinned && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 font-medium bg-primary/10 text-primary border border-primary/20">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{notice.body}</p>
                    <span className="text-[10px] text-muted-foreground/70 font-mono mt-1 block">
                      {formatDate(notice.publishedAt)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Support & NOC contacts */}
          <div>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-primary" />
                  Emergency Support
                </CardTitle>
                <CardDescription className="text-xs">{emergencyContact.supportHours}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <a
                  href={`tel:${emergencyContact.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-accent/50 transition-all group"
                >
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Phone Helpline</div>
                    <div className="text-sm font-bold font-mono">{emergencyContact.phone}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${emergencyContact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">WhatsApp Live Support</div>
                    <div className="text-sm font-bold font-mono">{emergencyContact.phone}</div>
                  </div>
                </a>

                <a
                  href={`mailto:${emergencyContact.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/80 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Email Helpdesk</div>
                    <div className="text-sm font-bold truncate">{emergencyContact.email}</div>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerPageShell>
  );
}


