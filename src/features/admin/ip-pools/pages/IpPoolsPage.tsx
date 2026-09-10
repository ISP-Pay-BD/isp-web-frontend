'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useIpPools } from '../hooks/useIpPools';
import type { IpPoolItem } from '@/data/admin/network-ops.data';
import { IpPoolModal } from '../components/IpPoolModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Globe2, Layers, CheckCircle2, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const poolSearchFilter = (row: LegacyRow<IpPoolItem>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.name.toLowerCase().includes(q) ||
    p.startIp.includes(q) ||
    p.endIp.includes(q) ||
    (p.routerName?.toLowerCase().includes(q) ?? false)
  );
};

export function IpPoolsPage() {
  const { data, isLoading, isError, refetch } = useIpPools();
  const [pools, setPools] = useState<IpPoolItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const initialPools = data?.pools ?? [];
  const routers = data?.routers ?? [];

  if (pools.length === 0 && initialPools.length > 0) {
    setPools(initialPools);
  }

  const list = pools.length > 0 ? pools : initialPools;
  const totalPools = list.length;
  const totalIps = list.reduce((sum, p) => sum + p.total, 0);
  const totalUsedIps = list.reduce((sum, p) => sum + p.used, 0);
  const publicIpsCount = list.filter((p) => p.type === 'public').reduce((sum, p) => sum + p.total, 0);

  const handleSyncFromMikrotik = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Synced /ip pool from all connected MikroTik routers.');
    }, 800);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setPools((prev) => prev.filter((p) => p.id !== deleteId));
    toast.success('IP pool removed.');
    setDeleteId(null);
  };

  const handleAddPool = (values: {
    name: string;
    routerId: string;
    routerName: string;
    defineBy: 'range' | 'cidr';
    startIp: string;
    endIp: string;
    cidr?: string;
    gateway: string;
    type: 'public' | 'private';
    total: number;
  }) => {
    const newPool: IpPoolItem = {
      id: `pool_${Date.now()}`,
      name: values.name,
      routerId: values.routerId,
      routerName: values.routerName,
      defineBy: values.defineBy,
      startIp: values.startIp,
      endIp: values.endIp,
      cidr: values.cidr,
      gateway: values.gateway,
      type: values.type,
      used: 0,
      total: values.total,
      status: 'active',
    };
    setPools((prev) => [newPool, ...prev]);
  };

  const columns = useMemo<LegacyColumnDef<IpPoolItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Pool Name',
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.name}</div>
            {row.original.cidr ? (
              <div className="text-xs text-muted-foreground font-mono">{row.original.cidr}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'routerName',
        header: 'Router Gateway',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.routerName ?? 'Default Gateway'}
          </span>
        ),
      },
      {
        id: 'range',
        accessorKey: 'startIp',
        header: 'IP Range / CIDR',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="font-mono text-xs">
            {row.original.startIp} <span className="text-muted-foreground">→</span>{' '}
            {row.original.endIp}
          </div>
        ),
      },
      {
        accessorKey: 'gateway',
        header: 'Gateway',
        cell: ({ row }) => <code className="font-mono text-xs">{row.original.gateway}</code>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant={row.original.type === 'public' ? 'default' : 'secondary'}
            className="capitalize text-xs"
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: 'utilization',
        accessorKey: 'used',
        header: 'Utilization',
        cell: ({ row }) => {
          const usagePercent = Math.round((row.original.used / (row.original.total || 1)) * 100);
          return (
            <div className="min-w-[160px] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {row.original.used} / {row.original.total}
                </span>
                <span className="text-muted-foreground">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              title="Delete IP Pool"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && pools.length === 0) {
    return <PageSkeleton variant="table" rows={5} />;
  }
  if (isError && pools.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load IP pools"
          description="Could not fetch address pools."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate & Static IP Pools"
        subtitle="Manage public/private subnets, CIDR assignments, and live MikroTik pool usage"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Network Ops' },
          { label: 'IP Pools' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleSyncFromMikrotik} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Pools
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add IP Pool
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Configured Pools</span>
            <Globe2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalPools}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Subnets & address pools</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Managed IPs</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{totalIps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{publicIpsCount} public routable IPs</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Allocated / In Use</span>
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{totalUsedIps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active PPPoE & Hotspot leases</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Overall Utilization</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalIps > 0 ? `${Math.round((totalUsedIps / totalIps) * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Pool capacity assigned</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search by pool name, IP range, router..."
        searchFilterFn={poolSearchFilter}
        facetFilters={[{ columnId: 'type', title: 'Type' }]}
        emptyTitle="No IP pools configured"
        emptyDescription="Add an IP pool to allocate static or dynamic addresses for PPPoE and Hotspot users."
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add IP Pool
          </Button>
        }
      />

      <IpPoolModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        routers={routers}
        onSuccess={handleAddPool}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete IP Pool?"
        description="Are you sure you want to delete this pool from the database? Allocated IPs will remain until released by router."
        confirmLabel="Delete Pool"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
