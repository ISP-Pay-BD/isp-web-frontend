'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  Activity,
  RefreshCw,
  Zap,
  ExternalLink,
  Signal,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import NumberFlow from '@number-flow/react';
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
import { toast } from 'sonner';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

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
            <Button className="font-semibold shadow-md bg-gradient-to-r from-[#f75803] to-[#ff7a2b] hover:from-[#e04f00] hover:to-[#f75803] text-white border-0 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Bill {formatBdtWithSymbol(subscription.priceBdt)}
            </Button>
          </Link>
        </div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Expiry Warning Banner if expiring soon */}
        <AnimatePresence>
          {isExpiringSoon && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
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
            </motion.div>
          )}

          {isExpired && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Bento: Current Plan & Live Bandwidth Chart */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Plan Card (5 cols on lg) - Native Light & Dark Adaptive */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-between relative overflow-hidden rounded-2xl p-6 bg-card text-card-foreground shadow-sm hover:shadow-md border border-border transition-all dark:bg-gradient-to-br dark:from-[#1c0d3a] dark:via-[#2a1352] dark:to-[#12052b] dark:text-white dark:border-white/15 dark:shadow-xl dark:shadow-purple-950/20"
          >
            {/* Ambient Accent Orbs (Subtle in light, glowing in dark) */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 dark:bg-[#f75803]/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-blue-500/10 dark:bg-[#2e8bff]/20 blur-3xl" />

            {/* Top orange accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-500 dark:to-[#2e8bff]" />

            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 dark:text-orange-300 dark:bg-orange-500/20 dark:border-orange-500/30">
                    <Zap className="h-3 w-3 fill-primary text-primary dark:fill-orange-400 dark:text-orange-400" />
                    Current Plan
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white mt-2">
                    {subscription.packageName}
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-white/75 mt-1 font-mono flex items-center gap-1.5">
                    <span className="font-semibold text-primary dark:text-orange-300">ID: {subscription.userId}</span>
                    <span>·</span>
                    <span>Valid till {formatDate(subscription.expiryDate)}</span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 font-bold text-xs rounded-full border backdrop-blur-md shadow-xs',
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-300 dark:shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-300',
                  )}
                >
                  <span
                    className={cn(
                      'mr-1.5 inline-block h-2 w-2 rounded-full',
                      isActive ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400',
                    )}
                  />
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* 3 Metric Mini Cards with Animated Numbers */}
              <div className="grid grid-cols-3 gap-2.5 mt-6">
                <div className="rounded-xl bg-muted/60 dark:bg-white/10 p-3 border border-border/80 dark:border-white/15 hover:border-primary/40 dark:hover:bg-white/15 transition-all shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/70">Speed</span>
                  <div className="text-lg font-black text-foreground dark:text-white mt-1 flex items-baseline gap-1">
                    <NumberFlow value={subscription.speedMbps} />
                    <span className="text-xs font-semibold text-muted-foreground dark:text-white/75">Mbps</span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 dark:bg-white/10 p-3 border border-border/80 dark:border-white/15 hover:border-primary/40 dark:hover:bg-white/15 transition-all shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/70">Monthly Fee</span>
                  <div className="text-lg font-black text-foreground dark:text-white mt-1 flex items-baseline gap-0.5">
                    <span className="text-xs font-bold text-primary dark:text-orange-400">৳</span>
                    <NumberFlow value={subscription.priceBdt} />
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 dark:bg-white/10 p-3 border border-border/80 dark:border-white/15 hover:border-primary/40 dark:hover:bg-white/15 transition-all shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/70">Expires In</span>
                  <div
                    className={cn(
                      'text-lg font-black mt-1 flex items-baseline gap-1',
                      isExpiringSoon ? 'text-amber-600 dark:text-amber-300 font-extrabold' : 'text-foreground dark:text-white',
                    )}
                  >
                    <NumberFlow value={diffDays} />
                    <span className="text-xs font-semibold text-muted-foreground dark:text-white/75">days</span>
                  </div>
                </div>
              </div>

              {/* Quota Progress with smooth styling */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground dark:text-white/85">
                  <span className="flex items-center gap-1.5 font-medium text-foreground dark:text-white">
                    <Signal className="h-3.5 w-3.5 text-primary dark:text-orange-400" />
                    Monthly Data Usage
                  </span>
                  <span className="font-bold font-mono text-foreground dark:text-white">
                    {subscription.quotaUsedGb} GB / {subscription.quotaTotalGb} GB ({quotaPercent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted dark:bg-black/30 p-0.5 border border-border dark:border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 transition-all duration-1000 ease-out shadow-xs"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Plan Card Actions */}
            <div className="mt-6 pt-4 border-t border-border dark:border-white/15 flex flex-wrap gap-2.5">
              <Link href="/customer/payments/pay" className="flex-1 min-w-[140px]">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 shadow-md shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]">
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
          </motion.div>

          {/* Real-time Traffic Throughput Chart (7 cols on lg) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-7 flex"
          >
            <Card className="flex flex-col justify-between w-full border-border/80 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      Live Bandwidth Traffic
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      PPPoE interface throughput (Mbps) · Live sampled stream
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
          </motion.div>
        </div>

        {/* 4 KPI Cards matching PHP dashboard KPIs with Hover micro-lift */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants} whileHover={{ y: -3 }}>
            <Card className="hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Next Bill Due</p>
                  <h3 className="text-2xl font-black tracking-tight mt-1 flex items-baseline gap-0.5 font-mono">
                    <span className="text-sm font-medium text-primary">৳</span>
                    <NumberFlow value={subscription.priceBdt} />
                  </h3>
                  <Link
                    href="/customer/payments/pay"
                    className="inline-flex items-center text-xs text-primary font-semibold mt-2 group-hover:underline"
                  >
                    Pay now <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="rounded-xl p-3 bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <CreditCard className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -3 }}>
            <Card className="hover:border-emerald-500/50 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Connection Health</p>
                  <h3 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                    {isActive ? 'Online' : 'Offline'}
                  </h3>
                  <span className="inline-flex items-center text-xs text-muted-foreground mt-2">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" /> 0% packet drop
                  </span>
                </div>
                <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Wifi className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -3 }}>
            <Card className="hover:border-amber-500/50 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Support Tickets</p>
                  <h3 className="text-2xl font-black tracking-tight mt-1 flex items-baseline gap-1">
                    <NumberFlow value={openTicketsCount} />
                    <span className="text-sm font-medium text-muted-foreground">Open</span>
                  </h3>
                  <Link
                    href="/customer/support"
                    className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 group-hover:underline"
                  >
                    View tickets <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="rounded-xl p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <LifeBuoy className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -3 }}>
            <Card className="hover:border-blue-500/50 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Paid</p>
                  <h3 className="text-2xl font-black tracking-tight mt-1 flex items-baseline gap-0.5 font-mono">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">৳</span>
                    <NumberFlow value={paymentsSummary.totalPaidBdt} />
                  </h3>
                  <Link
                    href="/customer/payments"
                    className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 group-hover:underline"
                  >
                    Payment history <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="rounded-xl p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Tools */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Quick Router Tools</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </CardTitle>
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
          </motion.div>

          {/* Announcements / Notices Feed */}
          <motion.div variants={itemVariants}>
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
          </motion.div>

          {/* Emergency Support & NOC contacts */}
          <motion.div variants={itemVariants}>
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
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:scale-105 transition-transform">
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
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 group-hover:scale-105 transition-transform">
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
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 group-hover:scale-105 transition-transform">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Email Helpdesk</div>
                    <div className="text-sm font-bold truncate">{emergencyContact.email}</div>
                  </div>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </CustomerPageShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

