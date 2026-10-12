'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { Radio, Server, Activity, Send, ShieldCheck, CheckCircle2, XCircle, Settings2, Zap } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRouterOptions } from '@/features/admin/routers/hooks/useRouters';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useSetupRadius, useTestRouterConnection } from '@/features/admin/routers/hooks/useRouterMutations';
import { useDisconnectLogs, useDisconnectSession, type DisconnectLog } from '@/features/admin/routers/hooks/useRouterSessions';
import type { RouterRow } from '@/features/admin/routers/types';

export function RadiusPanelPage() {
  const nas = useRouterOptions({ ownedOnly: true });
  const logTable = useServerTable();
  const logs = useDisconnectLogs({ page: logTable.page, pageSize: logTable.pageSize, search: logTable.search });
  const { mutateAsync: setupRadius } = useSetupRadius();
  const { mutateAsync: testConnection } = useTestRouterConnection();
  const disconnect = useDisconnectSession();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [coaUsername, setCoaUsername] = useState('');
  const [coaRouterId, setCoaRouterId] = useState('');

  const routers = useMemo(() => nas.data ?? [], [nas.data]);
  const polled = routers.filter((r) => r.cachedStatus !== '').length;
  const reachable = routers.filter((r) => r.cachedStatus === 'online').length;
  const summary = logs.data?.summary;
  const successRate = summary && summary.total > 0 ? `${Math.round((summary.ok / summary.total) * 100)}%` : '—';

  const runSetup = useCallback(
    async (router: RouterRow) => {
      setBusyId(router.id);
      try {
        const res = await setupRadius(router.id);
        toast.success(`${router.name}: ${(res?.steps ?? ['RADIUS configured']).join(' ')}`);
      } catch {
        // the mutation cache already toasted the backend message
      } finally {
        setBusyId(null);
      }
    },
    [setupRadius],
  );

  const runTest = useCallback(
    async (router: RouterRow) => {
      setBusyId(router.id);
      try {
        await testConnection({ id: router.id, host: router.host, port: router.port, username: router.username });
        toast.success(`${router.name} answered on ${router.host}:${router.port}`);
      } catch {
        // the mutation cache already toasted the backend message
      } finally {
        setBusyId(null);
      }
    },
    [testConnection],
  );

  const handleSendDisconnect = (e: React.FormEvent) => {
    e.preventDefault();
    const username = coaUsername.trim();
    const routerId = coaRouterId || routers[0]?.id;
    if (!username || !routerId) {
      toast.error('Enter a PPPoE username and pick the router');
      return;
    }
    disconnect.mutate(
      { routerId, username },
      {
        onSuccess: () => {
          toast.success(`${username} disconnected`);
          setCoaModalOpen(false);
          setCoaUsername('');
        },
      },
    );
  };

  const nasColumns = useMemo<LegacyColumnDef<RouterRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'NAS Client',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <Link href={`/admin/routers/${row.original.id}`} className="font-semibold text-foreground text-sm hover:underline">
                {row.original.name}
              </Link>
              <p className="text-xs text-muted-foreground font-mono">{row.original.host}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'port',
        header: 'API Port',
        cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.port || '—'}</span>,
      },
      {
        accessorKey: 'cachedStatus',
        header: 'Last Poll',
        cell: ({ row }) =>
          row.original.cachedStatus ? (
            <div className="flex flex-col items-start gap-0.5">
              <StatusBadge status={row.original.cachedStatus} />
              {row.original.cachedUpdatedAt ? (
                <span className="text-[11px] text-muted-foreground">{row.original.cachedUpdatedAt}</span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Never polled</span>
          ),
      },
      {
        id: 'sessions',
        header: 'PPPoE Online',
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {row.original.cachedActive === null ? '—' : `${row.original.cachedActive} / ${row.original.cachedTotal}`}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={busyId === row.original.id}
              onClick={() => runTest(row.original)}
            >
              <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
              Test API
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={busyId === row.original.id}
              onClick={() => runSetup(row.original)}
            >
              <Settings2 className="h-3.5 w-3.5 mr-1" />
              Setup RADIUS
            </Button>
          </div>
        ),
      },
    ],
    [busyId, runSetup, runTest],
  );

  const logColumns = useMemo<LegacyColumnDef<DisconnectLog, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.createdAt}</span>,
      },
      {
        accessorKey: 'routerName',
        header: 'NAS Gateway',
        cell: ({ row }) => <span className="font-semibold text-xs text-foreground">{row.original.routerName || '—'}</span>,
      },
      {
        accessorKey: 'username',
        header: 'Target User',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-primary">{row.original.username || row.original.sessionId || '—'}</span>
        ),
      },
      {
        accessorKey: 'message',
        header: 'Detail',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.message}</span>,
      },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.result === 'ok'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }
          >
            {row.original.result === 'ok' ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Disconnected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Failed
              </span>
            )}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (nas.isLoading) return <PageSkeleton variant="table" />;
  if (nas.isError) {
    return <EmptyState title="Failed to load RADIUS" description={nas.error?.message} actionLabel="Retry" onAction={() => nas.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FreeRADIUS & CoA / PoD"
        subtitle="Your MikroTik routers are the Network Access Servers — configure RADIUS on them and force PPPoE disconnects"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'RADIUS' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCoaModalOpen(true)} disabled={routers.length === 0}>
              <Send className="h-4 w-4 mr-1.5 text-primary" />
              Send Disconnect
            </Button>
            <Link href="/admin/routers" className={cn(buttonVariants({ size: 'sm' }))}>
              <Server className="h-4 w-4 mr-1.5" />
              Manage Routers
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured NAS</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{routers.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active routers</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>NAS Health</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {reachable} / {polled}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Reachable at the last poll</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Disconnect Requests</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{summary?.total ?? '—'}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Logged PoD attempts</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Success Rate</span>
            <Radio className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{successRate}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Sessions actually dropped</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="nas" className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="nas" className="text-xs">
              <Server className="h-3.5 w-3.5 mr-1.5" />
              NAS Clients ({routers.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Disconnect Audit Trail ({summary?.total ?? 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="nas" className="space-y-4 m-0">
          <DataTable
            columns={nasColumns}
            data={routers}
            getRowId={(r) => r.id}
            searchKey="name"
            searchPlaceholder="Search NAS client by name..."
            emptyTitle="No active routers"
            emptyDescription="Add a MikroTik router first — it becomes a RADIUS NAS client here."
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 m-0">
          {logs.isError ? (
            <EmptyState
              title="Failed to load the disconnect log"
              description={logs.error?.message}
              actionLabel="Retry"
              onAction={() => logs.refetch()}
            />
          ) : (
            <DataTable
              columns={logColumns}
              data={logs.data?.items ?? []}
              isLoading={logs.isLoading}
              getRowId={(r) => r.id}
              searchPlaceholder="Search by username or router..."
              emptyTitle="No disconnects yet"
              emptyDescription="Every forced disconnect from this panel or the router users page is recorded here."
              server={logTable.server(logs.data?.meta.total ?? 0)}
              toolbarActions={
                <Button size="sm" onClick={() => setCoaModalOpen(true)} disabled={routers.length === 0}>
                  <Send className="h-4 w-4 mr-1.5" />
                  Send Disconnect
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={coaModalOpen} onOpenChange={setCoaModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Disconnect a PPPoE Session</DialogTitle>
            <DialogDescription>
              Drops the user&apos;s active session on the selected router (Packet of Disconnect). The client can reconnect immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendDisconnect} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="coaUsername">PPPoE Username *</Label>
              <Input id="coaUsername" value={coaUsername} onChange={(e) => setCoaUsername(e.target.value)} required maxLength={100} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coaNas">Router (NAS)</Label>
              <Select value={coaRouterId || routers[0]?.id || ''} onValueChange={(val) => { if (val) setCoaRouterId(String(val)); }}>
                <SelectTrigger id="coaNas">
                  <SelectValue placeholder="Select router..." />
                </SelectTrigger>
                <SelectContent>
                  {routers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.host})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCoaModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={disconnect.isPending}>
                {disconnect.isPending ? 'Sending...' : 'Disconnect'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
