'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Activity, 
  Filter, 
  Server,
  Zap,
  Play
} from 'lucide-react';
import type { CorporateQueueJob } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<CorporateQueueJob>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const j = row.original;
  return (
    j.customerName.toLowerCase().includes(q) ||
    j.routerName.toLowerCase().includes(q) ||
    j.action.toLowerCase().includes(q) ||
    j.packageName.toLowerCase().includes(q)
  );
};

export function CorporateQueuesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRouter, setSelectedRouter] = useState<string>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'corporateQueues'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'corporateQueues');
      return res as { items: CorporateQueueJob[] };
    },
  });

  const rawItems = data?.items ?? [];

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchRouter = selectedRouter === 'all' || item.routerName === selectedRouter;
      return matchStatus && matchRouter;
    });
  }, [rawItems, selectedStatus, selectedRouter]);

  const uniqueRouters = useMemo(() => {
    return Array.from(new Set(rawItems.map((i) => i.routerName)));
  }, [rawItems]);

  const stats = useMemo(() => {
    const total = rawItems.length;
    const success = rawItems.filter((i) => i.status === 'success').length;
    const running = rawItems.filter((i) => i.status === 'queued').length;
    const failed = rawItems.filter((i) => i.status === 'failed').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 100;
    return { total, success, running, failed, successRate };
  }, [rawItems]);

  const columns = useMemo<LegacyColumnDef<CorporateQueueJob, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Corporate Client',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-primary shrink-0" />
              {row.original.customerName}
            </div>
            <div className="text-xs text-muted-foreground font-mono pl-5">
              {row.original.packageName}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Queue Action',
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted/60 border border-border/60 text-foreground">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: 'routerName',
        header: 'Core Router / NAS',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Server className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.routerName}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Execution Status',
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant="outline"
              className={`capitalize font-medium text-xs px-2.5 py-0.5 ${
                s === 'failed'
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : s === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse'
              }`}
            >
              {s === 'success' && <CheckCircle2 className="mr-1 h-3 w-3 inline" />}
              {s === 'failed' && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
              {s === 'queued' && <RotateCw className="mr-1 h-3 w-3 inline animate-spin" />}
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'attempts',
        header: 'Sync Attempts',
        cell: ({ row }) => (
          <div className="text-xs font-mono text-muted-foreground">
            {row.original.attempts} {row.original.attempts === 1 ? 'try' : 'tries'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            {row.original.status === 'failed' ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                onClick={() => toast.success(`Requeued queue sync for ${row.original.customerName}`)}
              >
                <RotateCw className="mr-1.5 h-3 w-3" />
                Retry Sync
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toast.info(`Queue sync logs verified for ${row.original.customerName}`)}
              >
                <Zap className="mr-1.5 h-3 w-3 text-primary" />
                Verify
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load corporate queues" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Queues & Bandwidth Sync"
        subtitle="Real-time MikroTik parent/child queue enforcement for enterprise dedicated links"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Corporate', url: '/admin/corporate/leads' },
          { label: 'Bandwidth Queues' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Queues status refreshed');
              }}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Triggered global MikroTik queue re-sync (mock)')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Sync All Queues
            </Button>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Corporate Queues</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{stats.total}</div>
          <p className="mt-1 text-xs text-muted-foreground">Active corporate B2B queues</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Synced & Active</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-400">{stats.success}</div>
          <p className="mt-1 text-xs text-muted-foreground">{stats.successRate}% operational rate</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Processing / In-Flight</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-amber-400">{stats.running}</div>
          <p className="mt-1 text-xs text-muted-foreground">Pending router handshake</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Sync Failures</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-red-400">{stats.failed}</div>
          <p className="mt-1 text-xs text-muted-foreground">Requires manual retry or check</p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" /> Status:
            </span>
            {['all', 'success', 'queued', 'failed'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={selectedStatus === st ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(st)}
                className={`h-7 text-xs capitalize ${
                  selectedStatus === st
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                {st}
              </Button>
            ))}
          </div>

          {uniqueRouters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Router:</span>
              <select
                value={selectedRouter}
                onChange={(e) => setSelectedRouter(e.target.value)}
                className="h-8 rounded-lg border border-border/70 bg-background/80 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All NAS / Routers</option>
                {uniqueRouters.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          searchKey="customerName"
          searchPlaceholder="Search by client, package, or router..."
          searchFilterFn={searchFilter}
        />
      </div>
    </div>
  );
}
