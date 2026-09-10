'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useRouters } from '../hooks/useRouters';
import type { RouterItem } from '@/data/admin/network-ops.data';
import { RouterModal } from '../components/RouterModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Router, RefreshCw, Activity, CheckCircle2, Edit, Trash2, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';

const routerSearchFilter = (row: LegacyRow<RouterItem>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    r.name.toLowerCase().includes(q) ||
    r.ip.includes(q) ||
    r.area.toLowerCase().includes(q)
  );
};

export function RoutersPage() {
  const { data: initialRouters = [], isLoading, isError, refetch } = useRouters();
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<RouterItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (routers.length === 0 && initialRouters.length > 0) {
    setRouters(initialRouters);
  }

  const list = routers.length > 0 ? routers : initialRouters;
  const totalRouters = list.length;
  const onlineRouters = list.filter((r) => r.status === 'online').length;
  const totalUsers = list.reduce((sum, r) => sum + r.users, 0);

  const handleTestConnection = (router: RouterItem) => {
    toast.promise(
      new Promise((res, rej) => {
        setTimeout(() => {
          if (router.status === 'online') {
            res({ ping: '2ms', version: router.routerOsVersion ?? 'v7.14' });
          } else {
            rej(new Error('Connection timed out to ' + router.ip));
          }
        }, 600);
      }),
      {
        loading: `Pinging ${router.ip}:${router.port}...`,
        success: (data) => `Connected to ${router.name} (${(data as { ping: string }).ping})`,
        error: (err) => (err as Error).message,
      },
    );
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('MikroTik interfaces, queues, and active users synced successfully.');
    }, 900);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setRouters((prev) => prev.filter((r) => r.id !== deleteId));
    toast.success('Router removed from database.');
    setDeleteId(null);
  };

  const handleSaveRouter = (values: {
    name: string;
    ip: string;
    port: number;
    username: string;
    model: string;
    area: string;
  }) => {
    if (selectedRouter) {
      setRouters((prev) =>
        prev.map((r) => (r.id === selectedRouter.id ? { ...r, ...values } : r)),
      );
    } else {
      const newItem: RouterItem = {
        id: `rtr_${Date.now()}`,
        name: values.name,
        ip: values.ip,
        port: values.port,
        username: values.username,
        model: values.model,
        area: values.area,
        status: 'online',
        users: 0,
        uptime: 'Just connected',
        cpuLoad: 5,
        freeRamMb: 850,
        totalRamMb: 1024,
        freeHddMb: 450,
        totalHddMb: 512,
        boardName: values.model,
        routerOsVersion: 'v7.14.3',
      };
      setRouters((prev) => [newItem, ...prev]);
    }
  };

  const columns = useMemo<LegacyColumnDef<RouterItem, unknown>[]>(
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
            <div className="text-xs text-muted-foreground">{row.original.area} POP</div>
          </div>
        ),
      },
      {
        accessorKey: 'ip',
        header: 'Host IP & Port',
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-medium text-foreground">{row.original.ip}</div>
            <div className="font-mono text-xs text-muted-foreground">Port: {row.original.port}</div>
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
            <div className="text-xs font-mono">user: {row.original.username}</div>
            <div className="text-xs text-muted-foreground font-mono">pass: ••••••••</div>
          </div>
        ),
      },
      {
        accessorKey: 'model',
        header: 'Model / OS',
        cell: ({ row }) => (
          <div>
            <div className="text-xs font-medium">{row.original.model}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {row.original.routerOsVersion ?? 'RouterOS'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'users',
        header: 'Active Users',
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-sm">{row.original.users}</span>
            <span className="text-xs text-muted-foreground ml-1">users</span>
          </div>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.uptime}</span>
        ),
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
                title="Ping / Test Connection"
                onClick={() => handleTestConnection(router)}
              >
                <Zap className="h-4 w-4 text-amber-500" />
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
              <Button
                variant="ghost"
                size="icon"
                title="Delete Router"
                onClick={() => setDeleteId(router.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading && routers.length === 0) {
    return <PageSkeleton variant="table" rows={6} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load routers"
          description="Could not load MikroTik router inventory."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

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
            <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedRouter(null);
                setModalOpen(true);
              }}
            >
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
            <p className="text-xs text-muted-foreground mt-0.5">RouterOS core & edge devices</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Online Gateways</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{onlineRouters} / {totalRouters}</div>
            <p className="text-xs text-muted-foreground mt-0.5">API port 8728 responding</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Active PPPoE Sessions</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Authenticated subscribers</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>API Latency</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">4.2 ms</div>
            <p className="text-xs text-muted-foreground mt-0.5">Sub-second queue sync</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search by router name, IP, or POP area..."
        searchFilterFn={routerSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No MikroTik connected"
        emptyDescription="Connect a router to push PPPoE users, read live traffic, and monitor CPU."
        toolbarActions={
          <Button
            size="sm"
            onClick={() => {
              setSelectedRouter(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Router
          </Button>
        }
      />

      <RouterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={selectedRouter}
        onSuccess={handleSaveRouter}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Disconnect Router?"
        description="Are you sure you want to remove this MikroTik router? Customer line synchronization will pause for this gateway."
        confirmLabel="Remove Router"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
