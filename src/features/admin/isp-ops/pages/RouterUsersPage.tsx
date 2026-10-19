'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { RefreshCw, WifiOff } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { useRouterDetail } from '@/features/admin/routers/hooks/useRouterDetail';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import {
  useDisconnectSession,
  useRouterSessions,
  type PppoeRow,
  type SessionMode,
} from '@/features/admin/routers/hooks/useRouterSessions';

function mb(bytes: number) {
  return bytes > 0 ? (bytes / 1_048_576).toFixed(1) : '—';
}

export function RouterUsersPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const routerId = params.id;
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [mode, setMode] = useState<SessionMode>('active');
  const [kickTarget, setKickTarget] = useState<PppoeRow | null>(null);

  const router = useRouterDetail(routerId);
  const sessions = useRouterSessions(routerId, { page, pageSize, search, mode });
  const disconnect = useDisconnectSession();

  const modes: { value: SessionMode; label: string }[] = [
    { value: 'all', label: t('admin.ops.routerUsers.modeAll', 'All') },
    { value: 'active', label: t('status.online', 'Online') },
    { value: 'inactive', label: t('status.offline', 'Offline') },
  ];

  const columns = useMemo<LegacyColumnDef<PppoeRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.routerUsers.colUsername', 'Username'),
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-xs">{row.original.name}</span>
            <div className="text-xs text-muted-foreground">{row.original.profile}</div>
          </div>
        ),
      },
      {
        accessorKey: 'active',
        header: t('admin.ops.routerUsers.colStatus', 'Status'),
        cell: ({ row }) => <StatusBadge status={row.original.active ? 'online' : 'offline'} />,
      },
      {
        accessorKey: 'address',
        header: 'IP',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.address || '—'}</span>,
      },
      {
        accessorKey: 'callerId',
        header: t('admin.ops.routerUsers.colCaller', 'MAC / Caller ID'),
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.callerId || '—'}</span>,
      },
      {
        id: 'uptime',
        header: t('admin.ops.routerUsers.colUptime', 'Uptime / Last logout'),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {row.original.active ? row.original.uptime || '—' : row.original.lastLoggedOut || '—'}
          </span>
        ),
      },
      {
        id: 'traffic',
        header: t('admin.ops.routerUsers.colTraffic', 'Down / Up (MB)'),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {mb(row.original.bytesOut)} / {mb(row.original.bytesIn)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) =>
          row.original.active && row.original.sessionId ? (
            <Button size="sm" variant="outline" onClick={() => setKickTarget(row.original)}>
              {t('admin.ops.routerUsers.kick', 'Kick')}
            </Button>
          ) : null,
      },
    ],
    [t],
  );

  if (sessions.isLoading) return <PageSkeleton variant="table" />;
  if (sessions.isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.routerUsers.loadFailed', 'Failed to load sessions')}
        description={sessions.error?.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => sessions.refetch()}
      />
    );
  }

  const data = sessions.data;
  const name = router.data?.name ?? t('admin.ops.routerUsers.routerFallback', 'Router {id}', { id: routerId });

  const confirmKick = () => {
    const target = kickTarget;
    if (!target) return;
    disconnect.mutate(
      { routerId, sessionId: target.sessionId, username: target.name },
      {
        onSuccess: () => toast.success(t('admin.ops.routerUsers.disconnected', '{name} disconnected', { name: target.name })),
        onSettled: () => setKickTarget(null),
      },
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.ops.routerUsers.title', 'PPPoE users · {name}', { name })}
        subtitle={t('admin.ops.routerUsers.subtitle', 'Live sessions read from the router — Kick drops the session on the NAS')}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Routers', url: '/admin/routers' },
          { label: name, url: `/admin/routers/${routerId}` },
          { label: t('admin.ops.routerUsers.crumbUsers', 'Users') },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => sessions.refetch()} disabled={sessions.isFetching}>
            <RefreshCw className={cn('mr-1.5 h-4 w-4', sessions.isFetching && 'animate-spin')} />
            {t('admin.ops.routerUsers.refresh', 'Refresh')}
          </Button>
        }
      />

      {data && !data.reachable ? (
        <EmptyState
          icon={<WifiOff className="h-5 w-5" />}
          title={t('admin.ops.routerUsers.offlineTitle', 'Router offline')}
          description={data.error || t('admin.ops.routerUsers.offlineDesc', 'The router did not answer, so live sessions are unavailable.')}
          actionLabel={t('admin.ops.routerUsers.tryAgain', 'Try again')}
          onAction={() => sessions.refetch()}
        />
      ) : (
        <>
          <OpsSummaryStrip
            items={[
              { value: data?.activeCount ?? 0, label: t('admin.ops.routerUsers.sumOnline', 'online') },
              { value: mode === 'active' ? '—' : (data?.inactiveCount ?? 0), label: t('admin.ops.routerUsers.sumOffline', 'offline') },
              { value: data?.total ?? 0, label: t('admin.ops.routerUsers.sumMatching', 'matching') },
            ]}
          />
          <DataTable urlState
            columns={columns}
            data={data?.rows ?? []}
            getRowId={(row) => row.name}
            searchPlaceholder={t('admin.ops.routerUsers.search', 'Search username, IP, MAC, profile…')}
            emptyTitle={search ? t('admin.ops.routerUsers.noMatch', 'No user matches your search') : t('admin.ops.routerUsers.empty', 'No PPPoE users')}
            server={table.server(data?.total ?? 0)}
            toolbarActions={
              <div className="flex items-center gap-1">
                {modes.map((m) => (
                  <Button
                    key={m.value}
                    size="sm"
                    variant={mode === m.value ? 'default' : 'outline'}
                    onClick={() => {
                      setMode(m.value);
                      table.resetPage();
                    }}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            }
          />
        </>
      )}

      <ConfirmDialog
        open={!!kickTarget}
        onOpenChange={(open) => !open && setKickTarget(null)}
        title={t('admin.ops.routerUsers.kickTitle', 'Disconnect session?')}
        description={kickTarget ? t('admin.ops.routerUsers.kickDesc', '{user} will be dropped from {router}. The client can reconnect immediately.', { user: kickTarget.name, router: name }) : undefined}
        confirmLabel={t('admin.ops.routerUsers.kickConfirm', 'Disconnect')}
        destructive
        onConfirm={confirmKick}
      />
    </div>
  );
}
