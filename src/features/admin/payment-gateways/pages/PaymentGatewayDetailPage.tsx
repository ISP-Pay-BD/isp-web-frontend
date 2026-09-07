'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { PaymentGatewayDetail } from '@/data/admin/extras.data';

export function PaymentGatewayDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'paymentGateways'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'paymentGateways');
      return res as { items: PaymentGatewayDetail[] };
    },
  });

  const gw = data?.items.find((g) => g.id === id);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load gateway" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (!gw) {
    return (
      <EmptyState
        title="Gateway not found"
        description="This payment gateway id is not in the mock catalog."
        actionLabel="Back to gateways"
        onAction={() => router.push('/admin/payment-gateways')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={gw.name}
        subtitle="Merchant credentials and webhook endpoints (mock)"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Payment Gateways', url: '/admin/payment-gateways' },
          { label: gw.name },
        ]}
        actions={
          <Button onClick={() => toast.success('Gateway settings saved (mock)')}>Save</Button>
        }
      />

      <Card className="border-border/60 max-w-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Configuration
            <Badge variant={gw.mode === 'live' ? 'default' : 'secondary'}>{gw.mode}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {gw.merchantNumber && (
            <div className="space-y-2">
              <Label>Merchant number</Label>
              <Input defaultValue={gw.merchantNumber} />
            </div>
          )}
          <div className="space-y-2">
            <Label>App key</Label>
            <Input defaultValue={gw.appKeyMasked} />
          </div>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input defaultValue={gw.webhookUrl} className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
