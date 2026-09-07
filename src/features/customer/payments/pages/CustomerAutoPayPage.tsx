'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCustomerAutoPay } from '../hooks/use-customer-billing-extras';

export function CustomerAutoPayPage() {
  const { data, isLoading, isError, refetch } = useCustomerAutoPay();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load auto-pay" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const settings = data as {
    enabled: boolean;
    method: string;
    maskedAccount: string;
    retryCount: number;
    nextChargeAt: string;
    lastChargeAt: string;
    lastStatus: string;
  };
  const on = enabled ?? settings.enabled;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auto-pay"
        subtitle="Charge saved method on due date"
        breadcrumb={[
          { label: 'Dashboard', url: '/customer/dashboard' },
          { label: 'Payments', url: '/customer/payments' },
          { label: 'Auto-pay' },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        Next charge · <span className="font-mono text-foreground">{settings.nextChargeAt}</span>
        {' · '}
        Last {settings.lastStatus}
      </p>
      <Card className="max-w-lg border-border/60 shadow-sm ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Settings</CardTitle>
          <Badge variant="outline" className="capitalize">
            {settings.method}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autopay">Enable auto-pay</Label>
            <Switch
              id="autopay"
              checked={on}
              onCheckedChange={(v) => {
                setEnabled(v);
                toast.success(v ? 'Auto-pay enabled (mock)' : 'Auto-pay disabled (mock)');
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Method: {settings.method} {settings.maskedAccount} · Retry {settings.retryCount}× on failure
          </p>
          <p className="text-xs text-muted-foreground">Last charge {settings.lastChargeAt}</p>
          <Button size="sm" variant="outline" onClick={() => toast.success('Payment method updated (mock)')}>
            Change method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
