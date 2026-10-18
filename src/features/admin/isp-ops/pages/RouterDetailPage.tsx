'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Activity, RefreshCw, WifiOff } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouterDetail, useRouterLive } from '@/features/admin/routers/hooks/useRouterDetail';
import { useTranslations } from '@/i18n/locale-context';

const pct = (v: number | null) => (v === null ? '—' : `${v}%`);

export function RouterDetailPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const nav = useRouter();
  const detail = useRouterDetail(params.id);
  const live = useRouterLive(params.id);

  if (detail.isLoading) return <PageSkeleton variant="detail" />;
  if (detail.isError || !detail.data) {
    const notFound = detail.error?.status === 404;
    return (
      <EmptyState
        title={notFound ? t('admin.ops.routerDetail.notFound', 'Router not found') : t('admin.ops.routerDetail.loadFailed', 'Failed to load router')}
        description={notFound ? t('admin.ops.routerDetail.notFoundHint', 'This router may have been removed from the inventory.') : detail.error?.message}
        actionLabel={notFound ? t('admin.ops.routerDetail.backToRouters', 'Back to routers') : t('admin.customers.list.retry', 'Retry')}
        onAction={() => (notFound ? nav.push('/admin/routers') : detail.refetch())}
      />
    );
  }

  const router = detail.data;
  const snap = live.data;
  const offline = live.isError && (live.error?.status === 503 || live.error?.status === 502);

  return (
    <div className="space-y-6">
      <PageHeader
        title={router.name}
        subtitle={[`${router.host}:${router.port}`, snap?.version ? `RouterOS ${snap.version}` : null].filter(Boolean).join(' · ')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.routers', 'Routers'), url: '/admin/routers' },
          { label: router.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => live.refetch()} disabled={live.isFetching}>
              <RefreshCw className={cn('mr-1.5 h-4 w-4', live.isFetching && 'animate-spin')} />
              {t('admin.dashboard.refresh', 'Refresh')}
            </Button>
            <Link href={`/admin/routers/${router.id}/users`} className={cn(buttonVariants({ size: 'sm' }))}>
              <Activity className="mr-1.5 h-4 w-4" />
              {t('admin.ops.routerDetail.liveUsers', 'Live PPPoE users')}
            </Link>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.ops.routerDetail.cpu', 'CPU'), value: snap ? pct(snap.cpuLoad) : '—' },
          { label: t('admin.ops.routerDetail.ram', 'RAM'), value: snap ? pct(snap.memoryUsedPct) : '—' },
          { label: t('admin.ops.routerDetail.uptime', 'Uptime'), value: snap?.uptime || '—' },
          { label: t('admin.ops.routerDetail.onlineUsers', 'online users'), value: snap ? snap.onlineUsers : (router.cachedActive ?? '—') },
          { label: t('admin.ops.routerDetail.customers', 'customers'), value: router.customers },
        ]}
      />

      {live.isLoading ? (
        <PageSkeleton variant="cards" />
      ) : offline || live.isError ? (
        <EmptyState
          icon={<WifiOff className="h-5 w-5" />}
          title={offline ? t('admin.ops.routerDetail.offline', 'Router offline') : t('admin.ops.routerDetail.unreadable', 'Could not read the router')}
          description={
            (live.error?.message ?? t('admin.ops.routerDetail.noAnswer', 'The RouterOS API did not answer.')) +
            (router.cachedUpdatedAt
              ? ` ${t('admin.ops.routerDetail.lastPoll', 'Last successful poll: {time}.', { time: router.cachedUpdatedAt })}`
              : '')
          }
          actionLabel={t('admin.ops.routerDetail.tryAgain', 'Try again')}
          onAction={() => live.refetch()}
        />
      ) : snap ? (
        <>
          <Card className="rounded-xl border-border/60">
            <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm sm:grid-cols-4">
              {[
                [t('admin.ops.routerDetail.identity', 'Identity'), snap.identity],
                [t('admin.ops.routerDetail.board', 'Board'), snap.model],
                [t('admin.ops.routerDetail.architecture', 'Architecture'), snap.architecture],
                [
                  t('admin.ops.routerDetail.cpu', 'CPU'),
                  [snap.cpu, snap.cpuCount ? t('admin.ops.routerDetail.cores', '{n} cores', { n: snap.cpuCount }) : ''].filter(Boolean).join(' · '),
                ],
                [t('admin.ops.routerDetail.firmware', 'Firmware'), snap.firmware],
                [t('admin.ops.routerDetail.serial', 'Serial'), snap.serialNumber],
                [t('admin.ops.routerDetail.diskUsed', 'Disk used'), pct(snap.hddUsedPct)],
                [t('admin.ops.routerDetail.configuredUsers', 'Configured users'), String(snap.configuredUsers)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value || '—'}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2 sm:col-span-4">
                <StatusBadge status={router.status} />
                <Badge variant="outline">{t('admin.ops.routerDetail.checked', 'Checked {time}', { time: snap.checkedAt })}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm">{t('admin.ops.routerDetail.interfaces', 'Interfaces ({n})', { n: snap.interfaces.length })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {snap.interfaces.length === 0 ? (
                  <p className="text-muted-foreground">{t('admin.ops.routerDetail.noInterfaces', 'No interfaces reported.')}</p>
                ) : (
                  snap.interfaces.map((i) => (
                    <div key={i.name} className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-medium">{i.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{[i.type, i.comment].filter(Boolean).join(' · ')}</p>
                      </div>
                      <StatusBadge status={i.disabled ? 'suspended' : i.running ? 'online' : 'offline'} label={
                          i.disabled
                            ? t('admin.ops.routerDetail.ifDisabled', 'disabled')
                            : i.running
                              ? t('admin.ops.routerDetail.ifRunning', 'running')
                              : t('admin.ops.routerDetail.ifDown', 'down')
                        } />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm">{t('admin.ops.routerDetail.logTitle', 'Recent router log')}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 space-y-1.5 overflow-y-auto text-xs">
                {snap.logs.length === 0 ? (
                  <p className="text-muted-foreground">{t('admin.ops.routerDetail.noLogs', 'No log lines.')}</p>
                ) : (
                  snap.logs.map((l, idx) => (
                    <div key={`${l.time}-${idx}`} className="flex gap-2">
                      <span className="shrink-0 font-mono text-muted-foreground">{l.time}</span>
                      <span className="shrink-0 text-muted-foreground">{l.topics}</span>
                      <span className="text-foreground">{l.message}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
