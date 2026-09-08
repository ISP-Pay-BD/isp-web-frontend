'use client';

import { useParams } from 'next/navigation';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantHealth } from '@/features/platform/shared/hooks/use-platform-catalog';
import { cn } from '@/lib/utils';

export function TenantHealthPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? 'tenant_demo';
  const { data, isLoading, isError, refetch } = useTenantHealth(id);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError) {
    return <EmptyState title="Failed to load health" actionLabel="Retry" onAction={() => refetch()} />;
  }
  if (!data) {
    return <EmptyState title="Tenant not found" description="No health scorecard for this tenant id." />;
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader title="Tenant health" subtitle={`Scorecard for ${id}`} />
      <Card className="max-w-md border-border/60 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-base">Health score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold tabular-nums text-primary">{data.score}</div>
          <ul className="mt-4 space-y-2 text-sm">
            {data.factors.map((f) => (
              <li key={f.label} className="flex justify-between border-b border-border/40 py-1.5 last:border-0">
                <span className="text-muted-foreground">{f.label}</span>
                <span
                  className={cn(
                    'font-medium',
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
        </CardContent>
      </Card>
    </div>
  );
}
