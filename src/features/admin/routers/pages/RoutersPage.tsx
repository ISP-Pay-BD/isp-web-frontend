'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared';
import { useRouterOptions, useRouters } from '../hooks/useRouters';
import { useDeleteRouter, useTestRouterConnection } from '../hooks/useRouterMutations';
import { useServerTable } from '../hooks/useServerTable';
import type { RouterRow } from '../types';
import { RouterModal } from '../components/RouterModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { Plus, Router, RefreshCw, CheckCircle2, Edit, Trash2, Zap, Users } from 'lucide-react';

import { formatCount } from '@/lib/format';
function liveLabel(r: RouterRow) {
  if (r.cachedStatus === 'online') return 'online';
  if (r.cachedStatus === 'offline') return 'offline';
  return null;
}

export function RoutersPage() {
  const t = useTranslations();
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const list = useRouters({ page, pageSize, search });
  // Summary cards cover every active router, not just the visible page.
  const options = useRouterOptions();
  const { mutateAsync: testAsync } = useTestRouterConnection();
  const deleteRouter = useDeleteRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<RouterRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RouterRow | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const active = useMemo(() => options.data ?? [], [options.data]);
  const totalRouters = list.data?.meta.total ?? 0;
  const reachable = active.filter((r) => r.cachedStatus === 'online').length;
  const polled = active.filter((r) => r.cachedStatus !== '').length;
  const sessions = active.reduce((sum, r) => sum + (r.cachedActive ?? 0), 0);
  const customers = active.reduce((sum, r) => sum + r.customers, 0);

  const handleTestConnection = useCallback(
    async (router: RouterRow) => {
      setTestingId(router.id);
      try {
        const res = await testAsync({ id: router.id, host: router.host, port: router.port, username: router.username });
        const identity = typeof res?.info?.identity === 'string' ? res.info.identity : router.name;
        toast.success(t('admin.routers.list.connectedTo', 'Connected to {identity} ({host}:{port})', { identity, host: router.host, port: router.port }));
      } catch {
        // the mutation cache already toasted the router's answer
      } finally {
        setTestingId(null);
      }
    },
    [testAsync, t],
  );

  const handleDelete = () => {
    const target = deleteTarget;
    if (!target) return;
    deleteRouter.mutate(target.id, {
      onSuccess: (res) =>
        toast.success(
          res?.deleted
            ? t('admin.routers.list.deleted', '{name} deleted', { name: target.name })
            : t('admin.routers.list.deactivated', '{name} deactivated', { name: target.name }),
        ),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const openCreate = () => {
    setSelectedRouter(null);
    setModalOpen(true);
  };

  const columns = useMemo<LegacyColumnDef<RouterRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.routers.list.colRouter', 'Router Details'),
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <Link
              href={`/admin/routers/${row.original.id}`}
              className="font-semibold text-foreground hover:text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            {row.original.hotspotName ? (
              <div className="text-xs text-muted-foreground">{t('admin.routers.list.hotspot', 'Hotspot: {name}', { name: row.original.hotspotName })}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'host',
        header: t('admin.routers.list.colHost', 'Host IP & Port'),
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-medium text-foreground">{row.original.host || '—'}</div>
            <div className="font-mono text-xs text-muted-foreground">{t('admin.routers.list.port', 'Port: {port}', { port: row.original.port || '—' })}</div>
          </div>
        ),
      },
      {
        id: 'credentials',
        accessorKey: 'username',
        header: t('admin.routers.list.colCredentials', 'API Credentials'),
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <div className="text-xs font-mono">{t('admin.routers.list.user', 'user: {name}', { name: row.original.username || '—' })}</div>
            <div className="text-xs text-muted-foreground font-mono">{t('admin.routers.list.pass', 'pass: ••••••••')}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.routers.list.colStatus', 'Status'),
        cell: ({ row }) => {
          const live = liveLabel(row.original);
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusBadge status={row.original.status} />
              {live ? (
                <span className="text-xs text-muted-foreground">
                  {t('admin.routers.list.lastPoll', 'last poll: {state}', {
                    state: live === 'online' ? t('status.online', 'online') : t('status.offline', 'offline'),
                  })}
                  {row.original.cachedUpdatedAt ? ` · ${row.original.cachedUpdatedAt}` : ''}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'sessions',
        header: t('admin.routers.list.colPppoe', 'PPPoE Users'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.cachedTotal === null ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <div>
              <span className="font-semibold text-sm">{formatCount(row.original.cachedActive ?? 0)}</span>
              <span className="text-xs text-muted-foreground ml-1">{t('admin.routers.list.onlineOf', '/ {total} online', { total: formatCount(row.original.cachedTotal) })}</span>
            </div>
          ),
      },
      {
        accessorKey: 'customers',
        header: t('admin.routers.list.colCustomers', 'Customers'),
        cell: ({ row }) => <span className="font-semibold text-sm tabular-nums">{formatCount(row.original.customers)}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const router = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/routers/${router.id}/users`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                title={t('admin.routers.list.liveUsers', 'Live PPPoE users')}
                aria-label={t('admin.routers.list.liveUsers', 'Live PPPoE users')}
              >
                <Users className="h-4 w-4 text-primary" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                title={t('admin.routers.list.testConnection', 'Test Connection')}
                aria-label={t('admin.routers.list.testConnection', 'Test Connection')}
                disabled={testingId === router.id}
                onClick={() => handleTestConnection(router)}
              >
                <Zap className={cn('h-4 w-4 text-amber-500', testingId === router.id && 'animate-pulse')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title={t('admin.routers.list.editConfig', 'Edit Configuration')}
                aria-label={t('admin.routers.list.editConfig', 'Edit Configuration')}
                onClick={() => {
                  setSelectedRouter(router);
                  setModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" title={t('admin.routers.list.deactivateRouter', 'Deactivate Router')} aria-label={t('admin.routers.list.deactivateRouter', 'Deactivate Router')} onClick={() => setDeleteTarget(router)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [testingId, handleTestConnection, t],
  );

  if (list.isLoading) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('admin.routers.list.loadFailed', 'Failed to load routers')}
          description={list.error?.message ?? t('admin.routers.list.loadFailedDesc', 'Could not load MikroTik router inventory.')}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => list.refetch()}
        />
      </div>
    );
  }

  const refreshing = list.isFetching || options.isFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.routers.list.title', 'MikroTik Routers')}
        subtitle={t('admin.routers.list.subtitle', 'Manage RouterOS gateway routers, live traffic, and sync PPPoE sessions')}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: t('admin.routers.list.crumbOps', 'Network Ops') },
          { label: t('admin.routers.list.title', 'MikroTik Routers') },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                list.refetch();
                options.refetch();
              }}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              {t('admin.routers.list.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.routers.list.newRouter', 'New Router')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.routers.list.kpiConfigured', 'Configured Gateways')}</span>
            <Router className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{formatCount(totalRouters)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.routers.list.activeCount', '{n} active', { n: formatCount(active.length) })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.routers.list.kpiReachable', 'Reachable Gateways')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCount(reachable)} / {formatCount(polled)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.routers.list.kpiReachableHint', 'At the last live poll')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.routers.list.kpiSessions', 'Active PPPoE Sessions')}</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{formatCount(sessions)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.routers.list.kpiSessionsHint', 'Last known, across active routers')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.routers.list.kpiCustomers', 'Assigned Customers')}</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{formatCount(customers)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.routers.list.kpiCustomersHint', 'Bound to active routers')}</p>
          </div>
        </div>
      </div>

      <DataTable urlState
        columns={columns}
        data={list.data?.items ?? []}
        isLoading={list.isFetching && !list.data}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.routers.list.search', 'Search by router name or host...')}
        emptyTitle={search ? t('admin.routers.list.noMatch', 'No router matches your search') : t('admin.routers.list.empty', 'No MikroTik connected')}
        emptyDescription={t('admin.routers.list.emptyDesc', 'Connect a router to push PPPoE users, read live traffic, and monitor CPU.')}
        server={table.server(list.data?.meta.total ?? 0)}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t('admin.routers.list.newRouter', 'New Router')}
          </Button>
        }
      />

      <RouterModal open={modalOpen} onOpenChange={setModalOpen} router={selectedRouter} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.routers.list.deactivateTitle', 'Deactivate Router?')}
        description={
          deleteTarget
            ? t('admin.routers.list.deactivateDesc', '{name} will be marked inactive and stop being polled. Its {n} assigned customers stay in billing.', {
                name: deleteTarget.name,
                n: formatCount(deleteTarget.customers),
              })
            : undefined
        }
        confirmLabel={t('admin.routers.list.deactivate', 'Deactivate')}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
