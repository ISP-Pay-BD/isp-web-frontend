'use client';

import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformMetering } from '@/features/platform/shared/hooks/use-platform-catalog';

export function PlatformMeteringPage() {
  const { data, isLoading, isError, refetch } = usePlatformMetering();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load metering" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (data.length === 0) {
    return <EmptyState title="No metering data" description="Tenant usage will appear here once meters report." />;
  }

  const totalCustomers = data.reduce((s, r) => s + r.customers, 0);
  const totalSms = data.reduce((s, r) => s + r.smsSent, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader title="Usage metering" subtitle="Tenant consumption for billing and fair-use" />
      <p className="text-sm text-muted-foreground tabular-nums">
        {data.length} tenants · {totalCustomers.toLocaleString()} customers · {totalSms.toLocaleString()} SMS
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((m) => (
          <Card key={m.tenantId} className="border-border/60 shadow-sm ring-1 ring-foreground/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-base">{m.domain}</CardTitle>
              <p className="text-xs text-muted-foreground">Period {m.period}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Customers</div>
                <div className="tabular-nums font-semibold">{m.customers.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">API</div>
                <div className="tabular-nums font-semibold">{(m.apiCalls / 1000).toFixed(0)}K</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">SMS</div>
                <div className="tabular-nums font-semibold">{m.smsSent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Storage</div>
                <div className="tabular-nums font-semibold">{m.storageGb} GB</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
