'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useRouters } from '../hooks/useRouters';
import type { RouterItem } from '@/data/admin/network-ops.data';
import { RouterModal } from '../components/RouterModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Router, RefreshCw, Activity, CheckCircle2, AlertCircle, Edit, Trash2, Zap, Server } from 'lucide-react';
import { toast } from 'sonner';

export function RoutersPage() {
  const { data: initialRouters = [], isLoading } = useRouters();
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<RouterItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync initial query data to local state for client interactions
  if (routers.length === 0 && initialRouters.length > 0) {
    setRouters(initialRouters);
  }

  const filtered = (routers.length > 0 ? routers : initialRouters).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.ip.includes(search) ||
    r.area.toLowerCase().includes(search.toLowerCase())
  );

  const totalRouters = (routers.length > 0 ? routers : initialRouters).length;
  const onlineRouters = (routers.length > 0 ? routers : initialRouters).filter((r) => r.status === 'online').length;
  const totalUsers = (routers.length > 0 ? routers : initialRouters).reduce((sum, r) => sum + r.users, 0);

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
      }
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
        prev.map((r) => (r.id === selectedRouter.id ? { ...r, ...values } : r))
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

  if (isLoading && routers.length === 0) {
    return <PageSkeleton rows={6} />;
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

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Routers"
          value={totalRouters}
          description="Provisioned in network"
          icon={Router}
        />
        <StatCard
          title="Online Routers"
          value={onlineRouters}
          description={`${onlineRouters}/${totalRouters} responding`}
          icon={CheckCircle2}
          trend={{ value: 'Operational', positive: true }}
        />
        <StatCard
          title="Active Sessions"
          value={totalUsers}
          description="Connected PPPoE / Hotspot"
          icon={Activity}
        />
        <StatCard
          title="Avg API Latency"
          value="4.2 ms"
          description="Local loop fiber interconnect"
          icon={Zap}
        />
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Input
            placeholder="Search by router name, IP, or POP area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <span className="text-xs text-muted-foreground self-end sm:self-auto">
            Showing {filtered.length} of {totalRouters} routers
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Server className="h-10 w-10" />}
            title="No MikroTik connected"
            description="Connect a router to push PPPoE users, read live traffic, and monitor CPU."
            actionLabel="Connect Router"
            onAction={() => {
              setSelectedRouter(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Router Details</TableHead>
                    <TableHead>Host IP & Port</TableHead>
                    <TableHead>API Credentials</TableHead>
                    <TableHead>Model / OS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((router, index) => (
                    <TableRow key={router.id}>
                      <TableCell className="text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{router.name}</div>
                        <div className="text-xs text-muted-foreground">{router.area} POP</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs font-medium text-foreground">{router.ip}</div>
                        <div className="font-mono text-xs text-muted-foreground">Port: {router.port}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">user: {router.username}</div>
                        <div className="text-xs text-muted-foreground font-mono">pass: ••••••••</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{router.model}</div>
                        <div className="text-xs text-muted-foreground font-mono">{router.routerOsVersion ?? 'RouterOS'}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={router.status} />
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">{router.users}</span>
                        <span className="text-xs text-muted-foreground ml-1">users</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {router.uptime}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

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
