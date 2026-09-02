'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useIpPools } from '../hooks/useIpPools';
import type { IpPoolItem } from '@/data/admin/network-ops.data';
import { IpPoolModal } from '../components/IpPoolModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Globe2, Layers, CheckCircle2, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function IpPoolsPage() {
  const { data, isLoading } = useIpPools();
  const [pools, setPools] = useState<IpPoolItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const initialPools = data?.pools ?? [];
  const routers = data?.routers ?? [];

  if (pools.length === 0 && initialPools.length > 0) {
    setPools(initialPools);
  }

  const list = pools.length > 0 ? pools : initialPools;

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.startIp.includes(search) ||
    p.endIp.includes(search) ||
    (p.routerName?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

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

  if (isLoading && pools.length === 0) {
    return <PageSkeleton rows={5} />;
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

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subnets / Pools"
          value={totalPools}
          description="Assigned across routers"
          icon={Layers}
        />
        <StatCard
          title="Total Managed IPs"
          value={totalIps}
          description="Usable host addresses"
          icon={Globe2}
        />
        <StatCard
          title="Assigned / In-Use"
          value={totalUsedIps}
          description={`${Math.round((totalUsedIps / (totalIps || 1)) * 100)}% allocation rate`}
          icon={CheckCircle2}
          trend={{ value: `${totalIps - totalUsedIps} free`, positive: true }}
        />
        <StatCard
          title="Public Real IPs"
          value={publicIpsCount}
          description="BTRC compliant white IPs"
          icon={ShieldCheck}
        />
      </div>

      {/* Search & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Input
            placeholder="Search by pool name, IP range, router..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <span className="text-xs text-muted-foreground self-end sm:self-auto">
            Showing {filtered.length} of {totalPools} pools
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Globe2 className="h-10 w-10" />}
            title="No IP pools configured"
            description="Add an IP pool to allocate static or dynamic addresses for PPPoE and Hotspot users."
            actionLabel="Add IP Pool"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>Router Gateway</TableHead>
                    <TableHead>IP Range / CIDR</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((pool, index) => {
                    const usagePercent = Math.round((pool.used / (pool.total || 1)) * 100);
                    return (
                      <TableRow key={pool.id}>
                        <TableCell className="text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">{pool.name}</div>
                          {pool.cidr && <div className="text-xs text-muted-foreground font-mono">{pool.cidr}</div>}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-foreground">{pool.routerName ?? 'Default Gateway'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">
                            {pool.startIp} <span className="text-muted-foreground">→</span> {pool.endIp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-xs">{pool.gateway}</code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={pool.type === 'public' ? 'default' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {pool.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{pool.used} / {pool.total}</span>
                              <span className="text-muted-foreground">{usagePercent}%</span>
                            </div>
                            <Progress value={usagePercent} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete IP Pool"
                            onClick={() => setDeleteId(pool.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

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
