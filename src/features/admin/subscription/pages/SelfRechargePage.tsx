'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Copy,
  Clock,
  Users,
  MessageSquare,
  Server,
  Receipt,
  Download,
  Check,
} from 'lucide-react';
import { useAdminSubscription } from '../hooks/use-admin-subscription';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const isActive = subscription.status === 'active';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
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
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Copy Key
            </Button>
            <Link href="/admin/payment">
              <Button size="sm" variant="outline" className="text-xs">
                <Receipt className="mr-1.5 h-3.5 w-3.5 text-primary" /> Payment History
              </Button>
            </Link>
          </div>
        }
      />

      {/* Row 1: Hero Active License & Capacity Bento Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Hero Card: Active Plan Overview */}
        <Card className="lg:col-span-7 relative overflow-hidden border-0 shadow-md text-white bg-gradient-to-br from-[#1a0b38] via-[#15082e] to-[#0c0118] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-300" />
          <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          <CardContent className="p-6 relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Active SaaS License
                  </span>
                  <Badge variant="secondary" className="bg-white/15 text-white border-white/20 text-[10px] font-bold">
                    {subscription.tenantName}
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
                  {subscription.planName}
                </h2>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-bold font-mono text-white">৳{subscription.priceBdt.toLocaleString()}</span>
                  <span className="text-xs opacity-75 font-normal">/ month billing</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Status
              </div>
            </div>

            {/* License Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="space-y-0.5">
                <span className="opacity-70 text-[11px]">License Key</span>
                <div className="font-mono font-bold truncate text-white">{subscription.licenseKey}</div>
              </div>
              <div className="space-y-0.5">
                <span className="opacity-70 text-[11px]">Next Expiry</span>
                <div className="font-semibold text-white">{formatDate(subscription.expiryDate)}</div>
              </div>
              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="opacity-70 text-[11px]">Billing Term</span>
                <div className="font-semibold text-white">Monthly Postpaid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Capacity & Quota Health */}
        <Card className="lg:col-span-5 border-border/70 bg-card shadow-2xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Tenant Quotas & Usage</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                42 Days Left
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">Real-time resource utilization against plan capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {/* Customer Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Customer Subscribers
                </span>
                <span className="font-mono font-bold text-foreground">
                  {subscription.activeCustomers} / {subscription.maxCustomers} ({usagePercent}%)
                </span>
              </div>
              <Progress value={usagePercent} className="h-2 bg-muted/80" />
            </div>

            {/* SMS Balance Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> Masking SMS Balance
                </span>
                <span className="font-mono font-bold text-foreground">12,450 / 25,000 (50%)</span>
              </div>
              <Progress value={50} className="h-2 bg-muted/80" />
            </div>

            {/* NAS Routers */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-blue-500" /> Connected MikroTik NAS
                </span>
                <span className="font-mono font-bold text-foreground">4 / 10 Routers</span>
              </div>
              <Progress value={40} className="h-2 bg-muted/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Select Plan & Renewal Tiers */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Choose Plan Tier
            </h2>
            <p className="text-xs text-muted-foreground">Select a plan tier to extend or upgrade your operations</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/80 shadow-2xs self-start">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards 3-Column Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const isSelected = planId === p.id;
            const isCurrent = subscription.planId === p.id;
            const planDisplayPrice = billingCycle === 'annual' ? Math.round(p.priceBdt * 12 * 0.85) : p.priceBdt;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 relative group',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md'
                    : 'border-border/80 bg-card hover:border-primary/40 hover:shadow-xs'
                )}
              >
                {/* Header Tag */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">{p.name.split('—')[0]?.trim()}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Up to {p.maxCustomers >= 99999 ? 'Unlimited' : p.maxCustomers.toLocaleString()} customers
                  </div>

                  {/* Price */}
                  <div className="mt-4 pb-4 border-b border-border/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                        ৳{planDisplayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="mt-4 space-y-2 text-xs">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <div className="pt-6 mt-4">
                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full text-xs font-semibold"
                  >
                    {isSelected ? 'Selected' : 'Choose Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Payment Gateway Selection */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Select Payment Gateway
          </h2>
          <p className="text-xs text-muted-foreground">Direct merchant settlement with instant transaction verification</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.map((m) => {
            const isSelected = paymentMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border/80 bg-card hover:border-primary/40'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.name}
                    </span>
                    {m.badge && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {m.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{m.sub}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-[11px]">Zero merchant fee</span>
                  {isSelected && <Check className="h-4 w-4 text-primary font-bold" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Checkout Summary & Action Bar */}
      <Card className="border-border/70 bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-2xs">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Order Summary
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-lg text-foreground">
                {currentPlan.name.split('—')[0]?.trim()} ({billingCycle === 'annual' ? '12 Months' : '1 Month'})
              </span>
              <span className="text-xs text-muted-foreground">via {paymentMethod.toUpperCase()}</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Instant license activation with zero downtime
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-left sm:text-right">
              <div className="text-[11px] text-muted-foreground">Total Payable</div>
              <div className="text-2xl font-black font-mono text-foreground">
                ৳{calculatedPrice.toLocaleString()}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleRecharge}
              disabled={rechargeMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 shadow-xs"
            >
              <Zap className="mr-2 h-4 w-4" />
              {rechargeMutation.isPending ? 'Processing Recharge...' : 'Recharge & Extend Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
