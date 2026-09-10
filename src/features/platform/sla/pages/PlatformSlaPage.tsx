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
  const avgUptime = (data.reduce((s, r) => s + r.uptimePct, 0) / (data.length || 1)).toFixed(2);
  const totalOpenTickets = data.reduce((s, r) => s + r.openTickets, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Tenant SLA Monitoring"
        subtitle="Real-time multi-tenant uptime tracking, availability targets, and escalated tickets"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Tenant SLA' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.length}</span>{' '}
          <span className="text-muted-foreground">monitored tenants</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{avgUptime}%</span>{' '}
          <span className="text-muted-foreground">average cluster uptime</span>
        </p>
        <p>
          <span className={`font-semibold tabular-nums ${watching > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {watching}
          </span>{' '}
          <span className="text-muted-foreground">tenants requiring attention</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{totalOpenTickets}</span>{' '}
          <span className="text-muted-foreground">open support tickets</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((r) => (
          <Card key={r.tenantId} className="border-border/60 bg-card hover:border-primary/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/40">
              <CardTitle className="font-mono text-base font-bold text-foreground">{r.tenantSlug}.isppaybd.com</CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize font-semibold text-xs px-2 py-0.5',
                  r.severity === 'ok' && 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                  r.severity === 'watch' && 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
                  r.severity === 'critical' && 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10',
                )}
              >
                {r.severity}
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-between items-center text-sm pt-4">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Live Uptime</div>
                <div className="tabular-nums font-bold text-base text-foreground mt-0.5">{r.uptimePct.toFixed(2)}%</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Target: {r.targetPct}%</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium text-muted-foreground">Open Tickets</div>
                <div className="tabular-nums font-bold text-base text-primary mt-0.5">{r.openTickets}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Priority Escalated</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
