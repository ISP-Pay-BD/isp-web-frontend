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

const pct = (v: number | null) => (v === null ? '—' : `${v}%`);

export function RouterDetailPage() {
  const params = useParams<{ id: string }>();
  const nav = useRouter();
  const detail = useRouterDetail(params.id);
  const live = useRouterLive(params.id);

  if (detail.isLoading) return <PageSkeleton variant="detail" />;
  if (detail.isError || !detail.data) {
    const notFound = detail.error?.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Router not found' : 'Failed to load router'}
        description={notFound ? 'This router may have been removed from the inventory.' : detail.error?.message}
        actionLabel={notFound ? 'Back to routers' : 'Retry'}
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
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Routers', url: '/admin/routers' },
          { label: router.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => live.refetch()} disabled={live.isFetching}>
              <RefreshCw className={cn('mr-1.5 h-4 w-4', live.isFetching && 'animate-spin')} />
              Refresh
            </Button>
            <Link href={`/admin/routers/${router.id}/users`} className={cn(buttonVariants({ size: 'sm' }))}>
              <Activity className="mr-1.5 h-4 w-4" />
              Live PPPoE users
            </Link>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'CPU', value: snap ? pct(snap.cpuLoad) : '—' },
          { label: 'RAM', value: snap ? pct(snap.memoryUsedPct) : '—' },
          { label: 'Uptime', value: snap?.uptime || '—' },
          { label: 'online users', value: snap ? snap.onlineUsers : (router.cachedActive ?? '—') },
          { label: 'customers', value: router.customers },
        ]}
      />

      {live.isLoading ? (
        <PageSkeleton variant="cards" />
      ) : offline || live.isError ? (
        <EmptyState
          icon={<WifiOff className="h-5 w-5" />}
          title={offline ? 'Router offline' : 'Could not read the router'}
          description={
            (live.error?.message ?? 'The RouterOS API did not answer.') +
            (router.cachedUpdatedAt ? ` Last successful poll: ${router.cachedUpdatedAt}.` : '')
          }
          actionLabel="Try again"
          onAction={() => live.refetch()}
        />
      ) : snap ? (
        <>
          <Card className="rounded-xl border-border/60">
            <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm sm:grid-cols-4">
              {[
                ['Identity', snap.identity],
                ['Board', snap.model],
                ['Architecture', snap.architecture],
                ['CPU', [snap.cpu, snap.cpuCount ? `${snap.cpuCount} cores` : ''].filter(Boolean).join(' · ')],
                ['Firmware', snap.firmware],
                ['Serial', snap.serialNumber],
                ['Disk used', pct(snap.hddUsedPct)],
                ['Configured users', String(snap.configuredUsers)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value || '—'}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2 sm:col-span-4">
                <StatusBadge status={router.status} />
                <Badge variant="outline">Checked {snap.checkedAt}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm">Interfaces ({snap.interfaces.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {snap.interfaces.length === 0 ? (
                  <p className="text-muted-foreground">No interfaces reported.</p>
                ) : (
                  snap.interfaces.map((i) => (
                    <div key={i.name} className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-medium">{i.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{[i.type, i.comment].filter(Boolean).join(' · ')}</p>
                      </div>
                      <StatusBadge status={i.disabled ? 'suspended' : i.running ? 'online' : 'offline'} label={i.disabled ? 'disabled' : i.running ? 'running' : 'down'} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm">Recent router log</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 space-y-1.5 overflow-y-auto text-xs">
                {snap.logs.length === 0 ? (
                  <p className="text-muted-foreground">No log lines.</p>
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
