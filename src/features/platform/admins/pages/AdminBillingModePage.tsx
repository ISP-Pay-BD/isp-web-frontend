'use client';

import { useParams } from 'next/navigation';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useBillingMode } from '@/features/platform/shared/hooks/use-platform-catalog';

export function AdminBillingModePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? 'adm_01';
  const { data, isLoading, isError, refetch } = useBillingMode(id);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError) {
    return <EmptyState title="Failed to load billing mode" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (!data) {
    return <EmptyState title="Admin not found" description="No billing mode configured for this admin." />;
  }

  const nextMode = data.mode === 'prepaid' ? 'postpaid' : 'prepaid';

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant billing mode"
        subtitle={`${data.tenantName} · admin ${id}`}
      />
      <Card className="max-w-lg border-border/60 shadow-sm ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Billing mode</CardTitle>
          <Badge variant="outline" className="capitalize">
            {data.mode}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <Label>Wallet</Label>
            <p className="mt-1 font-medium tabular-nums">{data.walletBdt.toLocaleString()} ৳</p>
          </div>
          {data.nextInvoiceAt ? (
            <p className="text-muted-foreground">
              Next platform invoice · <span className="font-mono text-foreground">{data.nextInvoiceAt}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">Prepaid wallet — renewals debit balance on expiry.</p>
          )}
          <p className="text-muted-foreground">
            Switching modes affects subscription renewals and meter overage charges.
          </p>
          <Button
            size="sm"
            onClick={() => toast.success(`Billing mode set to ${nextMode} (mock)`)}
          >
            Switch to {nextMode}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
