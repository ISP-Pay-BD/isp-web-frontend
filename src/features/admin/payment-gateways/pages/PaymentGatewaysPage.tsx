'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { buttonVariants } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { toast } from 'sonner';
import { Link2 } from 'lucide-react';
import { useState } from 'react';
import type { PaymentGatewayDetail } from '@/data/admin/extras.data';
import Link from 'next/link';

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

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load gateways" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateways"
        subtitle="bKash, Nagad, Rocket, SSLCommerz — merchant keys & settlements"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Payment Gateways' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((gw) => (
          <Card key={gw.id} className="border-border/60">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{gw.name}</CardTitle>
                <CardDescription className="mt-1 font-mono text-xs">{gw.appKeyMasked}</CardDescription>
              </div>
              <Switch
                checked={gw.enabled}
                onCheckedChange={(checked) => {
                  setItems(list.map((g) => (g.id === gw.id ? { ...g, enabled: checked } : g)));
                  toast.success(`${gw.name} ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant={gw.mode === 'live' ? 'default' : 'secondary'}>{gw.mode}</Badge>
                <Badge variant="outline">{gw.successRatePct}% success</Badge>
              </div>
              {gw.merchantNumber && (
                <p>
                  <span className="text-muted-foreground">Merchant </span>
                  <span className="font-mono">{gw.merchantNumber}</span>
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Today volume </span>
                <CurrencyDisplay amount={gw.todayVolumeBdt} />
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                <span className="truncate font-mono">{gw.webhookUrl}</span>
              </p>
              <Link
                href={`/admin/payment-gateways/${gw.id}`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Configure
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
