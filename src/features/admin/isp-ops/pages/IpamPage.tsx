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

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const DEFAULT_PAGE_SIZE = 20;

/** IPAM = the tenant's IP pools viewed as a subnet inventory (GET /v1/ip-pools). */
export function IpamPage() {
  const t = useTranslations();
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
        header: t('admin.ops.ipam.colCidr', 'Subnet Prefix (CIDR)'),
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
        header: t('admin.ops.ipam.colPurpose', 'Assigned Purpose'),
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
        header: t('admin.ops.ipam.colUtilization', 'Allocation & Utilization'),
        cell: ({ row }) => {
          const { used, size } = row.original;
          const util = utilisationPct(used, size);
          return (
            <div className="min-w-[170px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums text-foreground">
                  {t('admin.ops.ipam.usedOfSize', '{used} / {size} IPs', { used: formatCount(used), size: size === null ? '—' : formatCount(size) })}
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
        header: t('admin.ops.ipam.colType', 'Type'),
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs border-border/70">
            {row.original.type === 'public'
              ? t('admin.ops.ipam.typePublic', 'public')
              : row.original.type === 'private'
                ? t('admin.ops.ipam.typePrivate', 'private')
                : row.original.type}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
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
              {t('admin.ops.ipam.freeIps', 'Free IPs')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading && !data) return <PageSkeleton variant="table" />;
  if (isError && !data) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.ipam.loadFailed', 'Failed to load IPAM')}
        description={errorMessage(error, t('admin.ops.ipam.loadFailedHint', 'Could not fetch IP pools.'))}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.ipam.title', 'IPAM — IP Address Management')}
        subtitle={t('admin.ops.ipam.subtitle', 'Subnet inventory and address utilization across your router IP pools')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.network', 'Network') },
          { label: 'IPAM' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <SyncPoolsMenu />
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.ops.ipam.addSubnet', 'Add Subnet')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ops.ipam.kpiSubnets', 'Total Subnets')}</span>
            <Binary className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{summary?.pools ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('admin.ops.ipam.poolSplit', '{publicCount} public / {privateCount} private pools', { publicCount: publicPools, privateCount: privatePools })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ops.ipam.kpiAssigned', 'Assigned Addresses')}</span>
            <Network className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatCount(totalAllocated)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.ops.ipam.outOf', 'Out of {n} IPs', { n: formatCount(totalCapacity) })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ops.ipam.kpiUtilization', 'Overall Utilization')}</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {utilisationPct(totalAllocated, totalCapacity)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.ops.ipam.capacityAllocated', 'Capacity allocated')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ops.ipam.kpiFree', 'Free Addresses')}</span>
            <CircleDashed className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCount(Math.max(0, totalCapacity - totalAllocated))}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.ops.ipam.available', 'Available for assignment')}</p>
          </div>
        </div>
      </div>

      <DataTable urlState
        columns={columns}
        data={blocks}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ops.ipam.searchPlaceholder', 'Search by CIDR, IP range, pool name, or router...')}
        emptyTitle={search ? t('admin.ops.ipam.emptyFiltered', 'No subnets match your search') : t('admin.ops.ipam.emptyNone', 'No subnets registered')}
        emptyDescription={t('admin.ops.ipam.emptyDesc', 'Add an IP pool to start tracking subnet utilization.')}
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
            {t('admin.ops.ipam.addSubnet', 'Add Subnet')}
          </Button>
        }
      />

      <IpPoolModal open={modalOpen} onOpenChange={setModalOpen} />
      <IpPoolAvailabilityDialog pool={inspecting} onOpenChange={(open) => !open && setInspecting(null)} />
    </div>
  );
}
