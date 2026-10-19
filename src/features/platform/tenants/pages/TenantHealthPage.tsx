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
import { useTranslations } from '@/i18n/locale-context';

export function TenantHealthPage() {
  const t = useTranslations();
  const gradeLabel = {
    healthy: t('platform.tenants.health.gradeHealthy', 'Healthy'),
    watch: t('platform.tenants.health.gradeWatch', 'Watch'),
    at_risk: t('platform.tenants.health.gradeAtRisk', 'At risk'),
  } as const;
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const { data, isLoading, isError, error, refetch, isFetching } = useTenantHealth(id);

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.tenants.health.loadFailed', 'Failed to load health')}
        description={error instanceof Error ? error.message : undefined}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.tenants.health.title', 'Tenant health')}
        subtitle={t('platform.tenants.health.subtitle', 'Scorecard for {name}', { name: data.tenantName })}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.tenants', 'Tenants'), href: '/platform/tenants' },
          { label: data.tenantName, href: `/platform/tenants/${data.tenantId}` },
          { label: t('platform.tenants.health.crumb', 'Health') },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? t('platform.tenants.health.refreshing', 'Refreshing…') : t('admin.dashboard.refresh', 'Refresh')}
          </Button>
        }
      />
      <Card className="max-w-xl border-border/60 shadow-sm ring-1 ring-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t('platform.tenants.health.score', 'Health score')}</CardTitle>
          <Badge
            variant="outline"
            tone={data.grade === 'healthy' ? 'success' : data.grade === 'watch' ? 'warning' : data.grade === 'at_risk' ? 'danger' : undefined}
          >
            {gradeLabel[data.grade]}
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
          <p className="mt-4 text-xs text-muted-foreground">
            {t('platform.tenants.health.checked', 'Checked {time}', { time: platformDateTime(data.lastCheckedAt) })} ·{' '}
            <Link href={`/platform/tenants/${data.tenantId}`} className="underline">
              {t('platform.tenants.health.backToTenant', 'Back to tenant')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
