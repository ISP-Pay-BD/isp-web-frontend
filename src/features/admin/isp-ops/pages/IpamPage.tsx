'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Binary, Plus, Network, Layers, CircleDashed } from 'lucide-react';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useIpPools } from '@/features/admin/ip-pools/hooks/useIpPools';
import { utilisationPct, type IpPool } from '@/features/admin/ip-pools/types';
import { IpPoolModal } from '@/features/admin/ip-pools/components/IpPoolModal';
import { IpPoolAvailabilityDialog } from '@/features/admin/ip-pools/components/IpPoolAvailabilityDialog';
import { SyncPoolsMenu } from '@/features/admin/ip-pools/components/SyncPoolsMenu';

const DEFAULT_PAGE_SIZE = 20;

/** IPAM = the tenant's IP pools viewed as a subnet inventory (GET /v1/ip-pools). */
export function IpamPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useIpPools({ page, pageSize, search });
  const [modalOpen, setModalOpen] = useState(false);
  const [inspecting, setInspecting] = useState<IpPool | null>(null);

  const blocks = data?.items ?? [];
  const summary = data?.summary;
  const totalCapacity = summary?.totalIps ?? 0;
  const totalAllocated = summary?.usedIps ?? 0;
  const privatePools = summary?.privatePools ?? 0;
  const publicPools = (summary?.pools ?? 0) - privatePools;

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns = useMemo<LegacyColumnDef<IpPool, unknown>[]>(
    () => [
      {
        accessorKey: 'cidr',
        header: 'Subnet Prefix (CIDR)',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-foreground">
                {row.original.cidr || `${row.original.startIp} – ${row.original.endIp}`}
              </p>
              <p className="text-xs text-muted-foreground">{row.original.routerName || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Assigned Purpose',
        cell: ({ row }) => (
          <div>
            <span className="text-sm font-medium text-foreground">{row.original.name}</span>
            <div className="text-xs text-muted-foreground line-clamp-1">{row.original.notes || '—'}</div>
          </div>
        ),
      },
      {
        id: 'utilization',
        accessorKey: 'used',
        header: 'Allocation & Utilization',
        cell: ({ row }) => {
          const { used, size } = row.original;
          const util = utilisationPct(used, size);
          return (
            <div className="min-w-[170px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums text-foreground">
                  {used.toLocaleString()} / {size === null ? '—' : size.toLocaleString()} IPs
                </span>
                <span className={util > 85 ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>
                  {util}%
                </span>
              </div>
              <Progress value={util} className="h-1.5" />
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs border-border/70">
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setInspecting(row.original)}
            >
              Free IPs
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState
        title="Failed to load IPAM"
        description={errorMessage(error, 'Could not fetch IP pools.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPAM — IP Address Management"
        subtitle="Subnet inventory and address utilization across your router IP pools"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Network' }, { label: 'IPAM' }]}
        actions={
          <div className="flex items-center gap-2">
            <SyncPoolsMenu />
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Subnet
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Subnets</span>
            <Binary className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{summary?.pools ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{publicPools} public / {privatePools} private pools</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Assigned Addresses</span>
            <Network className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {totalAllocated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Out of {totalCapacity.toLocaleString()} IPs</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Overall Utilization</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {utilisationPct(totalAllocated, totalCapacity)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Capacity allocated</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Free Addresses</span>
            <CircleDashed className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {Math.max(0, totalCapacity - totalAllocated).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Available for assignment</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={blocks}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by CIDR, IP range, pool name, or router..."
        emptyTitle={search ? 'No subnets match your search' : 'No subnets registered'}
        emptyDescription="Add an IP pool to start tracking subnet utilization."
        server={{
          page,
          pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange,
        }}
        toolbarActions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Subnet
          </Button>
        }
      />

      <IpPoolModal open={modalOpen} onOpenChange={setModalOpen} />
      <IpPoolAvailabilityDialog pool={inspecting} onOpenChange={(open) => !open && setInspecting(null)} />
    </div>
  );
}
