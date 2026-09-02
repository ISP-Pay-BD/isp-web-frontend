'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAdminSubscription } from '../hooks/use-admin-subscription';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format';

export function SelfRechargePage() {
  const { data, isLoading, isError, refetch, rechargeMutation } = useAdminSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  if (isLoading) return <PageSkeleton rows={5} />;
  if (isError || !data) {
    return (
      <EmptyState title="Failed to load subscription" description="Could not fetch ISP Pay BD license details." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  const { subscription, plans } = data;
  const isActive = subscription.status === 'active';
  const usagePercent = Math.min(100, Math.round((subscription.activeCustomers / subscription.maxCustomers) * 100));
  const planId = selectedPlanId || subscription.planId;

  const handleRecharge = async () => {
    await rechargeMutation.mutateAsync({ planId, method: paymentMethod });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Self Recharge</h1>
        <p className="text-muted-foreground text-sm">
          Renew your ISP Pay BD SaaS license to keep billing, SMS, and network modules active.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">{subscription.tenantName}</span>
                <Badge variant={isActive ? 'default' : 'destructive'}>{subscription.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{subscription.licenseKey}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Expires</div>
              <div className="font-mono font-semibold">{formatDate(subscription.expiryDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{subscription.planName}</CardTitle>
          <CardDescription>
            <CurrencyDisplay amount={subscription.priceBdt} className="font-semibold text-foreground" /> / month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Customer capacity</span>
              <span className="font-mono">{subscription.activeCustomers} / {subscription.maxCustomers}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Renew License
          </CardTitle>
          <CardDescription>Select a plan and payment method to extend your subscription.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <Select value={planId} onValueChange={(v) => v && setSelectedPlanId(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ৳{p.priceBdt.toLocaleString()}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="sslcommerz">SSLCommerz (Card)</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlanId(p.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  planId === p.id ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                }`}
              >
                <div className="font-medium text-sm">{p.name.split('—')[0]?.trim()}</div>
                <div className="text-lg font-bold mt-1">৳{p.priceBdt.toLocaleString()}</div>
                <ul className="mt-2 space-y-0.5">
                  {p.features.slice(0, 2).map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleRecharge} disabled={rechargeMutation.isPending}>
              <CreditCard className="mr-1.5 h-4 w-4" />
              {rechargeMutation.isPending ? 'Processing...' : 'Recharge Now'}
            </Button>
            <Link href="/admin/payment">
              <Button variant="outline">
                View Payment History <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
