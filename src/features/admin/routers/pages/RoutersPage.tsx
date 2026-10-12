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
import { Plus, Router, RefreshCw, CheckCircle2, Edit, Trash2, Zap, Users } from 'lucide-react';

function liveLabel(r: RouterRow) {
  if (r.cachedStatus === 'online') return 'online';
  if (r.cachedStatus === 'offline') return 'offline';
  return null;
}

export function RoutersPage() {
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
        toast.success(`Connected to ${identity} (${router.host}:${router.port})`);
      } catch {
        // the mutation cache already toasted the router's answer
      } finally {
        setTestingId(null);
      }
    },
    [testAsync],
  );

  const handleDelete = () => {
    const target = deleteTarget;
    if (!target) return;
    deleteRouter.mutate(target.id, {
      onSuccess: (res) => toast.success(res?.deleted ? `${target.name} deleted` : `${target.name} deactivated`),
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
        header: 'Router Details',
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
              <div className="text-xs text-muted-foreground">Hotspot: {row.original.hotspotName}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'host',
        header: 'Host IP & Port',
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-medium text-foreground">{row.original.host || '—'}</div>
            <div className="font-mono text-xs text-muted-foreground">Port: {row.original.port || '—'}</div>
          </div>
        ),
      },
      {
        id: 'credentials',
        accessorKey: 'username',
        header: 'API Credentials',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <div className="text-xs font-mono">user: {row.original.username || '—'}</div>
            <div className="text-xs text-muted-foreground font-mono">pass: ••••••••</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const live = liveLabel(row.original);
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusBadge status={row.original.status} />
              {live ? (
                <span className="text-[11px] text-muted-foreground">
                  last poll: {live}
                  {row.original.cachedUpdatedAt ? ` · ${row.original.cachedUpdatedAt}` : ''}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'sessions',
        header: 'PPPoE Users',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.cachedTotal === null ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <div>
              <span className="font-semibold text-sm">{row.original.cachedActive}</span>
              <span className="text-xs text-muted-foreground ml-1">/ {row.original.cachedTotal} online</span>
            </div>
          ),
      },
      {
        accessorKey: 'customers',
        header: 'Customers',
        cell: ({ row }) => <span className="font-semibold text-sm tabular-nums">{row.original.customers}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const router = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/routers/${router.id}/users`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                title="Live PPPoE users"
              >
                <Users className="h-4 w-4 text-primary" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                title="Test Connection"
                disabled={testingId === router.id}
                onClick={() => handleTestConnection(router)}
              >
                <Zap className={cn('h-4 w-4 text-amber-500', testingId === router.id && 'animate-pulse')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Edit Configuration"
                onClick={() => {
                  setSelectedRouter(router);
                  setModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" title="Deactivate Router" onClick={() => setDeleteTarget(router)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [testingId, handleTestConnection],
  );

  if (list.isLoading) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load routers"
          description={list.error?.message ?? 'Could not load MikroTik router inventory.'}
          actionLabel="Retry"
          onAction={() => list.refetch()}
        />
      </div>
    );
  }

  const refreshing = list.isFetching || options.isFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title="MikroTik Routers"
        subtitle="Manage RouterOS gateway routers, live traffic, and sync PPPoE sessions"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network Ops' },
          { label: 'MikroTik Routers' },
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
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Router
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured Gateways</span>
            <Router className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalRouters}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{active.length} active</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Reachable Gateways</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {reachable} / {polled}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">At the last live poll</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Active PPPoE Sessions</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{sessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Last known, across active routers</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Assigned Customers</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{customers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Bound to active routers</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list.data?.items ?? []}
        isLoading={list.isFetching && !list.data}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by router name or host..."
        emptyTitle={search ? 'No router matches your search' : 'No MikroTik connected'}
        emptyDescription="Connect a router to push PPPoE users, read live traffic, and monitor CPU."
        server={table.server(list.data?.meta.total ?? 0)}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Router
          </Button>
        }
      />

      <RouterModal open={modalOpen} onOpenChange={setModalOpen} router={selectedRouter} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deactivate Router?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be marked inactive and stop being polled. Its ${deleteTarget.customers} assigned customers stay in billing.`
            : undefined
        }
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
