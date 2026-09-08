'use client';

import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformSla } from '@/features/platform/shared/hooks/use-platform-catalog';
import { cn } from '@/lib/utils';

export function PlatformSlaPage() {
  const { data, isLoading, isError, refetch } = usePlatformSla();

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load SLA" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (data.length === 0) {
    return (
      <EmptyState
        title="No SLA rows"
        description="Tenant uptime targets will show here."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const watching = data.filter((r) => r.severity !== 'ok').length;

  return (
    <div className="space-y-6">
      <PlatformPageHeader title="Tenant SLA" subtitle="Uptime and support load by tenant" />
      <p className="text-sm text-muted-foreground tabular-nums">
        {data.length} tenants · {watching} need attention
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((r) => (
          <Card key={r.tenantId} className="border-border/60 shadow-sm ring-1 ring-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-base">{r.tenantSlug}</CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  r.severity === 'ok' && 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
                  r.severity === 'watch' && 'border-amber-500/40 text-amber-700 dark:text-amber-400',
                  r.severity === 'critical' && 'border-rose-500/40 text-rose-700 dark:text-rose-400',
                )}
              >
                {r.severity}
              </Badge>
            </CardHeader>
            <CardContent className="flex gap-6 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Uptime %</div>
                <div className="tabular-nums font-semibold">{r.uptimePct.toFixed(2)}</div>
                <div className="text-[11px] text-muted-foreground">Target {r.targetPct}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Open tickets</div>
                <div className="tabular-nums font-semibold">{r.openTickets}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
