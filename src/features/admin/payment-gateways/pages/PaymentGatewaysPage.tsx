'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button, buttonVariants } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { toast } from 'sonner';
import {
  CreditCard,
  Link2,
  RefreshCw,
  Plus,
  ShieldCheck,
  TrendingUp,
  Sliders,
  DollarSign,
  Activity,
} from 'lucide-react';
import type { PaymentGatewayDetail } from '@/data/admin/extras.data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PaymentGatewaysPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'paymentGateways'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'paymentGateways');
      return res as { items: PaymentGatewayDetail[] };
    },
  });
  const [items, setItems] = useState<PaymentGatewayDetail[] | null>(null);
  const list = items ?? data?.items ?? [];

  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((g) => g.enabled).length;
    const todayVolume = list.reduce((s, g) => s + g.todayVolumeBdt, 0);
    const avgSuccess = total > 0 ? Math.round(list.reduce((s, g) => s + g.successRatePct, 0) / total) : 0;
    return { total, active, todayVolume, avgSuccess };
  }, [list]);

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (isError || !data) {
    return <EmptyState title="Failed to load payment gateways" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="Payment Gateways & Merchant Settlements"
        subtitle="Manage bKash Tokenized, Nagad Direct, Rocket, Upay, and SSLCommerz API integration credentials."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Payment Gateways' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('New Gateway Provider dialog (mock)')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Gateway
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configured Gateways</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.total}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">MFS & Card channels</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active & Live</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.active}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Accepting subscriber payments</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today Collection</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">৳{stats.todayVolume.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Settled gateway volume</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Success Rate</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">{stats.avgSuccess}%</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Transaction completion ratio</div>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((gw) => (
          <Card
            key={gw.id}
            className={cn(
              'border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden',
              !gw.enabled && 'opacity-65'
            )}
          >
            <CardHeader className="p-5 border-b border-border/50 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-foreground">{gw.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold uppercase',
                      gw.mode === 'live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}
                  >
                    {gw.mode}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs text-muted-foreground">{gw.appKeyMasked}</CardDescription>
              </div>
              <Switch
                checked={gw.enabled}
                onCheckedChange={(checked) => {
                  setItems(list.map((g) => (g.id === gw.id ? { ...g, enabled: checked } : g)));
                  toast.success(`${gw.name} ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Today Volume</p>
                  <p className="text-sm font-bold font-mono text-foreground">৳{gw.todayVolumeBdt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Success Rate</p>
                  <p className="text-sm font-bold font-mono text-emerald-400">{gw.successRatePct}%</p>
                </div>
              </div>

              {gw.merchantNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Merchant Account:</span>
                  <span className="font-mono font-bold text-foreground">{gw.merchantNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-mono text-[11px]">{gw.webhookUrl}</span>
              </div>

              <div className="pt-2 border-t border-border/50 flex justify-end">
                <Link
                  href={`/admin/payment-gateways/${gw.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs h-8 gap-1.5 border-border/80 hover:bg-accent')}
                >
                  <Sliders className="h-3.5 w-3.5" /> Configure Credentials
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
