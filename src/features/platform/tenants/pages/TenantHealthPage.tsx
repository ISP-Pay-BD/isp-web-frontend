'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTenantHealth } from '@/features/platform/shared/hooks/use-platform-catalog';
import { cn } from '@/lib/utils';

const GRADE_LABEL = { healthy: 'Healthy', watch: 'Watch', at_risk: 'At risk' } as const;

export function TenantHealthPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch, isFetching } = useTenantHealth(id);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load health"
        description={error instanceof Error ? error.message : undefined}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant health"
        subtitle={`Scorecard for ${data.tenantName}`}
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Tenants', href: '/platform/tenants' },
          { label: data.tenantName, href: `/platform/tenants/${data.tenantId}` },
          { label: 'Health' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />
      <Card className="max-w-xl border-border/60 shadow-sm ring-1 ring-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Health score</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              data.grade === 'healthy' && 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
              data.grade === 'watch' && 'border-amber-500/40 text-amber-700 dark:text-amber-400',
              data.grade === 'at_risk' && 'border-rose-500/40 text-rose-700 dark:text-rose-400',
            )}
          >
            {GRADE_LABEL[data.grade]}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold tabular-nums text-primary">
            {data.score}
            <span className="ml-1 text-base font-normal text-muted-foreground">/ 100</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {data.factors.map((f) => (
              <li key={f.key} className="flex justify-between gap-4 border-b border-border/40 py-1.5 last:border-0">
                <span className="text-muted-foreground">{f.label}</span>
                <span
                  className={cn(
                    'font-medium text-right',
                    f.tone === 'ok' && 'text-emerald-700 dark:text-emerald-400',
                    f.tone === 'warn' && 'text-amber-700 dark:text-amber-400',
                    f.tone === 'bad' && 'text-rose-700 dark:text-rose-400',
                  )}
                >
                  {f.value}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Checked {platformDateTime(data.lastCheckedAt)} ·{' '}
            <Link href={`/platform/tenants/${data.tenantId}`} className="underline">
              Back to tenant
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
