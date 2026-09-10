'use client';

import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformMetering } from '@/features/platform/shared/hooks/use-platform-catalog';

export function PlatformMeteringPage() {
  const { data, isLoading, isError, refetch } = usePlatformMetering();

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load metering" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (data.length === 0) {
    return (
      <EmptyState
        title="No metering data"
        description="Tenant usage will appear here once meters report."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const totalCustomers = data.reduce((s, r) => s + r.customers, 0);
  const totalSms = data.reduce((s, r) => s + r.smsSent, 0);
  const totalStorageGb = data.reduce((s, r) => s + r.storageGb, 0);
  const totalApiCalls = data.reduce((s, r) => s + r.apiCalls, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Usage Metering"
        subtitle="Tenant real-time resource consumption, SMS quota usage, and API throughput"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Metering' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.length}</span>{' '}
          <span className="text-muted-foreground">metered tenants</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{totalCustomers.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">active subscribers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{totalSms.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">SMS consumed</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">{(totalApiCalls / 1000).toFixed(1)}k</span>{' '}
          <span className="text-muted-foreground">API requests</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{totalStorageGb.toFixed(1)} GB</span>{' '}
          <span className="text-muted-foreground">storage footprint</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((m) => (
          <Card key={m.tenantId} className="border-border/60 bg-card hover:border-primary/40 transition-all">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-base font-bold text-foreground">{m.domain}</CardTitle>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {m.period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 pt-4">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Customers</div>
                <div className="tabular-nums font-bold text-sm text-foreground mt-0.5">{m.customers.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">API Calls</div>
                <div className="tabular-nums font-bold text-sm text-blue-500 mt-0.5">{(m.apiCalls / 1000).toFixed(0)}K</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">SMS Sent</div>
                <div className="tabular-nums font-bold text-sm text-primary mt-0.5">{m.smsSent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Storage</div>
                <div className="tabular-nums font-bold text-sm text-foreground mt-0.5">{m.storageGb} GB</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
