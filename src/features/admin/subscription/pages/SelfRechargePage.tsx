'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Zap,
  Shield,
  CheckCircle2,
  Copy,
  Users,
  MessageSquare,
  Server,
  Receipt,
  Check,
} from 'lucide-react';
import { useAdminSubscription } from '../hooks/use-admin-subscription';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentMethodOption {
  id: string;
  name: string;
  sub: string;
  color: string;
  badge?: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'bkash',
    name: 'bKash Merchant',
    sub: 'Instant auto-renewal via bKash App or USSD',
    color: '#e2136e',
    badge: 'Popular',
  },
  {
    id: 'nagad',
    name: 'Nagad Gateway',
    sub: 'Fast checkout with Nagad direct billing',
    color: '#f7941d',
  },
  {
    id: 'sslcommerz',
    name: 'Cards / SSLCommerz',
    sub: 'Visa, MasterCard, American Express, Internet Banking',
    color: '#2563eb',
  },
  {
    id: 'bank',
    name: 'Bank EFT Transfer',
    sub: 'Corporate invoice & direct bank deposit',
    color: '#10b981',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function AnimatedProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
      />
    </div>
  );
}

export function SelfRechargePage() {
  const { data, isLoading, isError, refetch, rechargeMutation } = useAdminSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load subscription"
        description="Could not fetch ISP Pay BD license details from tenant server."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { subscription, plans } = data;
  const usagePercent = Math.min(100, Math.round((subscription.activeCustomers / subscription.maxCustomers) * 100));
  const planId = selectedPlanId || subscription.planId;

  const currentPlan = plans.find((p) => p.id === planId) || plans[1] || plans[0]!;
  const rawPrice = currentPlan.priceBdt;
  const calculatedPrice = billingCycle === 'annual' ? Math.round(rawPrice * 12 * 0.85) : rawPrice;

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(subscription.licenseKey);
    toast.success('License key copied to clipboard');
  };

  const handleRecharge = async () => {
    await rechargeMutation.mutateAsync({ planId, method: paymentMethod });
  };

  return (
    <motion.div
      className="space-y-6 max-w-7xl mx-auto pb-12"
      variants={stagger}
      initial={false}
      animate="show"
    >
      {/* Top Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Self Recharge & License Management"
          subtitle="Renew your ISP Pay BD SaaS license, upgrade capacity, and view payment invoices"
          breadcrumb={[
            { label: 'Admin', url: '/admin/dashboard' },
            { label: 'Self Recharge' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLicense}
                className="text-xs border-border/80 hover:bg-accent transition-all duration-150"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Copy Key
              </Button>
              <Link href="/admin/payment">
                <Button size="sm" variant="outline" className="text-xs transition-all duration-150">
                  <Receipt className="mr-1.5 h-3.5 w-3.5 text-primary" /> Payment History
                </Button>
              </Link>
            </div>
          }
        />
      </motion.div>

      {/* Row 1: Hero Active License & Capacity Bento Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Hero Card: Active Plan Overview */}
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <Card className="relative overflow-hidden border-0 shadow-lg flex flex-col justify-between h-full bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-background dark:from-[#1a0b38] dark:via-[#15082e] dark:to-[#0c0118]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-300" />
            <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl pointer-events-none" />

            <CardContent className="p-6 relative z-10 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Active SaaS License
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 dark:bg-white/15 dark:text-white dark:border-white/20 text-[10px] font-bold">
                      {subscription.tenantName}
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground dark:text-white mt-2">
                    {subscription.planName}
                  </h2>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold font-mono text-foreground dark:text-white">৳{subscription.priceBdt.toLocaleString()}</span>
                    <span className="text-xs font-normal text-muted-foreground dark:text-white/60">/ month billing</span>
                  </div>
                </div>

                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 text-xs font-semibold shrink-0"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live Status
                </motion.div>
              </div>

              {/* License Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50 dark:border-white/10 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground dark:text-white/60">License Key</span>
                  <div className="font-mono font-bold truncate text-foreground dark:text-white">{subscription.licenseKey}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground dark:text-white/60">Next Expiry</span>
                  <div className="font-semibold text-foreground dark:text-white">{formatDate(subscription.expiryDate)}</div>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-muted-foreground dark:text-white/60">Billing Term</span>
                  <div className="font-semibold text-foreground dark:text-white">Monthly Postpaid</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Card: Capacity & Quota Health */}
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 flex flex-col justify-between h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Tenant Quotas & Usage</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  42 Days Left
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">Real-time resource utilization against plan capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              {/* Customer Capacity Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </span>
                    Customer Subscribers
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {subscription.activeCustomers} / {subscription.maxCustomers} ({usagePercent}%)
                  </span>
                </div>
                <AnimatedProgressBar value={usagePercent} color="var(--color-primary)" />
              </div>

              {/* SMS Balance Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    </span>
                    Masking SMS Balance
                  </span>
                  <span className="font-mono font-bold text-foreground">12,450 / 25,000 (50%)</span>
                </div>
                <AnimatedProgressBar value={50} color="#10b981" />
              </div>

              {/* NAS Routers */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                      <Server className="h-3.5 w-3.5 text-blue-500" />
                    </span>
                    Connected MikroTik NAS
                  </span>
                  <span className="font-mono font-bold text-foreground">4 / 10 Routers</span>
                </div>
                <AnimatedProgressBar value={40} color="#3b82f6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Select Plan & Renewal Tiers */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </span>
              Choose Plan Tier
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Select a plan tier to extend or upgrade your operations</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/60 shadow-sm ring-1 ring-foreground/5 self-start">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5',
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards 3-Column Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p, index) => {
            const isSelected = planId === p.id;
            const isCurrent = subscription.planId === p.id;
            const planDisplayPrice = billingCycle === 'annual' ? Math.round(p.priceBdt * 12 * 0.85) : p.priceBdt;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => setSelectedPlanId(p.id)}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-colors duration-200 relative group',
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/25 shadow-md shadow-primary/5'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 ring-1 ring-foreground/5'
                )}
              >
                {/* Header Tag */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">{p.name.split('—')[0]?.trim()}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Up to {p.maxCustomers >= 99999 ? 'Unlimited' : p.maxCustomers.toLocaleString()} customers
                  </div>

                  {/* Price */}
                  <div className="mt-4 pb-4 border-b border-border/50">
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${p.id}-${billingCycle}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25 }}
                          className="text-2xl sm:text-3xl font-black font-mono text-foreground"
                        >
                          ৳{planDisplayPrice.toLocaleString()}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-xs text-muted-foreground font-normal">
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="mt-4 space-y-2.5 text-xs">
                    {p.features.map((feat, i) => (
                      <motion.li
                        key={feat}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-foreground font-medium">{feat}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <div className="pt-6 mt-4">
                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'w-full text-xs font-semibold h-9 transition-all duration-200',
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                        : 'border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/30'
                    )}
                  >
                    {isSelected ? 'Selected' : 'Choose Plan'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Row 3: Payment Gateway Selection */}
      <motion.div variants={fadeUp} className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </span>
            Select Payment Gateway
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Direct merchant settlement with instant transaction verification</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.map((m, index) => {
            const isSelected = paymentMethod === m.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod(m.id)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-colors duration-200 flex flex-col justify-between group',
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/20 shadow-sm shadow-primary/5'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-sm ring-1 ring-foreground/5'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <motion.span
                        className={cn(
                          'h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all',
                          isSelected ? 'ring-current' : 'ring-transparent'
                        )}
                        style={{ backgroundColor: m.color, color: m.color }}
                        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      />
                      {m.name}
                    </span>
                    {m.badge && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
                        {m.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{m.sub}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-[11px]">Zero merchant fee</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="h-3 w-3 font-bold" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Row 4: Checkout Summary & Action Bar */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 bg-gradient-to-r from-card via-card/95 to-primary/[0.04] shadow-sm ring-1 ring-foreground/5">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Order Summary
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold text-lg text-foreground">
                  {currentPlan.name.split('—')[0]?.trim()} ({billingCycle === 'annual' ? '12 Months' : '1 Month'})
                </span>
                <span className="text-xs text-muted-foreground">via {paymentMethod.toUpperCase()}</span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Instant license activation with zero downtime
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left sm:text-right">
                <div className="text-[11px] text-muted-foreground">Total Payable</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calculatedPrice}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-black font-mono text-foreground"
                  >
                    ৳{calculatedPrice.toLocaleString()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={handleRecharge}
                  disabled={rechargeMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 shadow-md shadow-primary/20 h-10"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {rechargeMutation.isPending ? 'Processing Recharge...' : 'Recharge & Extend Now'}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
