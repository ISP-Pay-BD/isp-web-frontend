'use client';

import Link from 'next/link';
import {
  CreditCard,
  Wifi,
  LifeBuoy,
  Wallet,
  ArrowRight,
  ShieldAlert,
  DownloadCloud,
  UploadCloud,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  Newspaper,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

export function CustomerDashboardPage() {
  const { data, isLoading, isError, refetch } = useCustomerDashboard();

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
  const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = diffDays > 0 && diffDays <= 7;
  const isExpired = diffDays <= 0 || !isActive;

  const quotaPercent = Math.min(100, Math.round((subscription.quotaUsedGb / subscription.quotaTotalGb) * 100));

  return (
    <CustomerPageShell
      title="Dashboard"
      subtitle={`Welcome back, ${subscription.userId}. Manage your internet service, payments, and router.`}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/customer/payments/pay">
            <Button className="font-semibold shadow-sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Bill {formatBdtWithSymbol(subscription.priceBdt)}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Expiry Warning Banner if expiring soon or expired */}
        {isExpiringSoon && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-sm">Subscription expiring in {diffDays} days!</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recharge before {formatDate(subscription.expiryDate)} to avoid broadband interruption.
                </p>
              </div>
            </div>
            <Link href="/customer/payments/pay">
              <Button size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/20 text-xs">
                Renew Now
              </Button>
            </Link>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <span className="font-semibold text-sm">Broadband connection expired / suspended</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please pay your monthly dues to resume high-speed internet service immediately.
                </p>
              </div>
            </div>
            <Link href="/customer/payments/pay">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
                Instant Recharge
              </Button>
            </Link>
          </div>
        )}

        {/* Hero Grid: Current Plan & Live Usage Chart matching PHP user.php */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Plan Card (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1a0b38] via-[#24114d] to-[#0f0426] text-white shadow-xl border border-white/10">
            {/* Top orange accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f75803] to-[#ff9e66]" />

            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                    Current Plan
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                    {subscription.packageName}
                  </h2>
                  <p className="text-xs text-white/70 mt-1 font-mono">
                    ID: {subscription.userId} · Valid till {formatDate(subscription.expiryDate)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 font-bold text-xs rounded-full border',
                    isActive
                      ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                      : 'border-rose-400/30 bg-rose-500/20 text-rose-300',
                  )}
                >
                  <span
                    className={cn(
                      'mr-1.5 inline-block h-2 w-2 rounded-full',
                      isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400',
                    )}
                  />
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* 3 Metric Mini Cards */}
              <div className="grid grid-cols-3 gap-2.5 mt-6">
                <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Speed</span>
                  <div className="text-base font-extrabold text-white mt-1">
                    {subscription.speedMbps} <span className="text-xs font-normal">Mbps</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Monthly Fee</span>
                  <div className="text-base font-extrabold text-white mt-1">
                    {formatBdtWithSymbol(subscription.priceBdt)}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Expires In</span>
                  <div
                    className={cn(
                      'text-base font-extrabold mt-1',
                      isExpiringSoon ? 'text-amber-300' : 'text-white',
                    )}
                  >
                    {diffDays > 0 ? `${diffDays} days` : 'Expired'}
                  </div>
                </div>
              </div>

              {/* Quota Progress */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Monthly Data Usage</span>
                  <span className="font-semibold">
                    {subscription.quotaUsedGb} GB / {subscription.quotaTotalGb} GB ({quotaPercent}%)
                  </span>
                </div>
                <Progress value={quotaPercent} className="h-2 bg-white/10" />
              </div>
            </div>

            {/* Plan Card Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2.5">
              <Link href="/customer/payments/pay" className="flex-1 min-w-[140px]">
                <Button className="w-full bg-[#f75803] hover:bg-[#ff6e22] text-white font-bold h-10 shadow-md">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </Link>
              <Link href="/customer/subscription" className="flex-1 min-w-[140px]">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium h-10"
                >
                  Subscription Details
                </Button>
              </Link>
            </div>
          </div>

          {/* Real-time Traffic Throughput Chart (7 cols on lg) */}
          <Card className="lg:col-span-7 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-primary" />
                    Live Bandwidth Traffic
                  </CardTitle>
                  <CardDescription className="text-xs">
                    PPPoE interface throughput (Mbps) · Auto-polled
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f75803]" />
                    Download (RX)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
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
                        <stop offset="5%" stopColor="#f75803" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f75803" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timeLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}M`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [`${val ?? 0} Mbps`]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="downloadMbps"
                      name="Download"
                      stroke="#f75803"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#downloadGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="uploadMbps"
                      name="Upload"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#uploadGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <DownloadCloud className="h-3.5 w-3.5 text-primary" />
                  <span>Peak: {Math.max(...trafficData.map((d) => d.downloadMbps))} Mbps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
                  <span>Avg: {(trafficData.reduce((s, d) => s + d.uploadMbps, 0) / trafficData.length).toFixed(1)} Mbps</span>
                </div>
                <Link href="/customer/router" className="text-primary hover:underline font-medium">
                  Router Diagnostics →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4 KPI Cards matching PHP dashboard KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Next Bill Due</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">
                  {formatBdtWithSymbol(subscription.priceBdt)}
                </h3>
                <Link
                  href="/customer/payments/pay"
                  className="inline-flex items-center text-xs text-primary font-semibold mt-2 hover:underline"
                >
                  Pay now <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-xl p-3 bg-primary/10 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/50 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Connection Health</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  {isActive ? 'Online' : 'Offline'}
                </h3>
                <span className="inline-flex items-center text-xs text-muted-foreground mt-2">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" /> 0% packet drop
                </span>
              </div>
              <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500/50 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Support Tickets</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{openTicketsCount} Open</h3>
                <Link
                  href="/customer/support"
                  className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 hover:underline"
                >
                  View tickets <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <LifeBuoy className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-blue-500/50 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Paid</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">
                  {formatBdtWithSymbol(paymentsSummary.totalPaidBdt)}
                </h3>
                <Link
                  href="/customer/payments"
                  className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 hover:underline"
                >
                  Payment history <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Wallet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Service Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Quick Router Tools</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription className="text-xs">Self-service internet troubleshooting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/customer/router"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium">Line Reset & DNS Flush</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/customer/router/wifi"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium">Change WiFi SSID & Password</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/customer/router/devices"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium">Inspect Connected Devices</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Announcements / Notices Feed */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  Provider Notices
                </CardTitle>
                <Link href="/customer/news" className="text-xs text-primary hover:underline font-semibold">
                  All News
                </Link>
              </div>
              <CardDescription className="text-xs">Official maintenance alerts & announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestNotices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="border-b pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold line-clamp-1">{notice.title}</h4>
                    {notice.pinned && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
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

          {/* Emergency Support & NOC contacts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Emergency Support
              </CardTitle>
              <CardDescription className="text-xs">{emergencyContact.supportHours}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={`tel:${emergencyContact.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
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
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-emerald-500/10 transition-colors"
              >
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">WhatsApp Live Support</div>
                  <div className="text-sm font-bold font-mono">{emergencyContact.phone}</div>
                </div>
              </a>

              <a
                href={`mailto:${emergencyContact.email}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
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
    </CustomerPageShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
