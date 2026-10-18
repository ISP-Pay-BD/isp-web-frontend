'use client';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared';
import { useDeleteIpPool, useIpPools } from '../hooks/useIpPools';
import { utilisationPct, type IpPool, type IpPoolType } from '../types';
import { IpPoolModal } from '../components/IpPoolModal';
import { SyncPoolsMenu } from '../components/SyncPoolsMenu';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Globe2, Layers, CheckCircle2, ShieldCheck, Trash2, Pencil } from 'lucide-react';

import { formatCount } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
const DEFAULT_PAGE_SIZE = 20;

export function IpPoolsPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<IpPoolType | ''>('');
  const { data, isLoading, isError, error, refetch } = useIpPools({ page, pageSize, search, type: type || undefined });
  const deletePool = useDeleteIpPool();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IpPool | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IpPool | null>(null);

  const pools = data?.items ?? [];
  const summary = data?.summary;
  const totalIps = summary?.totalIps ?? 0;
  const usedIps = summary?.usedIps ?? 0;

  // Stable identity: DataTable re-runs its debounce effect when this changes.
  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    deletePool.mutate(target.id, {
      onSuccess: ({ routerSynced }) =>
        routerSynced
          ? toast.success(t('admin.ipPools.page.deleted', 'IP pool {name} deleted', { name: target.name }))
          : toast.warning(t('admin.ipPools.page.deletedNoRouter', 'IP pool {name} deleted, but it could not be removed from the router', { name: target.name })),
    });
  };

  const columns = useMemo<LegacyColumnDef<IpPool, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ipPools.page.colName', 'Pool Name'),
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
        header: t('admin.ipPools.page.colRouter', 'Router'),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">{row.original.routerName || '—'}</span>
        ),
      },
      {
        id: 'range',
        accessorKey: 'startIp',
        header: t('admin.ipPools.page.colRange', 'IP Range / CIDR'),
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
        header: t('admin.ipPools.page.colGateway', 'Gateway'),
        cell: ({ row }) =>
          row.original.gateway ? (
            <code className="font-mono text-xs">{row.original.gateway}</code>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'type',
        header: t('admin.ipPools.page.colType', 'Type'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge
              variant={row.original.type === 'public' ? 'default' : 'secondary'}
              className="capitalize text-xs"
            >
              {row.original.type === 'public' ? t('admin.ipPools.page.typePublic', 'Public') : t('admin.ipPools.page.typePrivate', 'Private')}
            </Badge>
            {row.original.status === 'inactive' ? (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {t('admin.ipPools.page.inactive', 'Inactive')}
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        id: 'utilization',
        accessorKey: 'used',
        header: t('admin.ipPools.page.colUtilization', 'Utilization'),
        cell: ({ row }) => {
          const { used, size } = row.original;
          const usagePercent = utilisationPct(used, size);
          return (
            <div className="min-w-[160px] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {used} / {size ?? '—'}
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
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              title={t('admin.ipPools.page.edit', 'Edit IP Pool')}
              aria-label={t('admin.ipPools.page.edit', 'Edit IP Pool')}
              onClick={() => {
                setEditing(row.original);
                setModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={t('admin.ipPools.page.delete', 'Delete IP Pool')}
              aria-label={t('admin.ipPools.page.delete', 'Delete IP Pool')}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading && !data) {
    return <PageSkeleton variant="table" rows={5} />;
  }
  if (isError && !data) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('admin.ipPools.page.loadFailed', 'Failed to load IP pools')}
          description={errorMessage(error, t('admin.ipPools.page.loadFailedHint', 'Could not fetch address pools.'))}
          actionLabel={t('admin.customers.list.retry', 'Retry')}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ipPools.page.title', 'Corporate & Static IP Pools')}
        subtitle={t('admin.ipPools.page.subtitle', 'Manage public/private subnets, CIDR assignments, and live MikroTik pool usage')}
        breadcrumb={[
          { label: t('nav.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('admin.olt.page.breadcrumbNetwork', 'Network Ops') },
          { label: t('nav.ip-pools', 'IP Pools') },
        ]}
        actions={
          <>
            <SyncPoolsMenu />
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.ipPools.page.add', 'Add IP Pool')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ipPools.page.kpiPools', 'Configured Pools')}</span>
            <Globe2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{summary?.pools ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('admin.ipPools.page.kpiPoolsSplit', '{priv} private / {pub} public', { priv: summary?.privatePools ?? 0, pub: (summary?.pools ?? 0) - (summary?.privatePools ?? 0) })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ipPools.page.kpiIps', 'Total Managed IPs')}</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{formatCount(totalIps)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('admin.ipPools.page.kpiIpsHint', '{n} public routable IPs', { n: formatCount(summary?.publicIps ?? 0) })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ipPools.page.kpiUsed', 'Allocated / In Use')}</span>
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground tabular-nums">{formatCount(usedIps)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.ipPools.page.kpiUsedHint', 'Active & reserved static assignments')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>{t('admin.ipPools.page.kpiUtil', 'Overall Utilization')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {utilisationPct(usedIps, totalIps)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{t('admin.ipPools.page.kpiUtilHint', 'Pool capacity assigned')}</p>
          </div>
        </div>
      </div>

      <DataTable urlState
        columns={columns}
        data={pools}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.ipPools.page.search', 'Search by pool name, IP range, router...')}
        emptyTitle={search || type ? t('admin.ipPools.page.emptyFiltered', 'No IP pools match your filters') : t('admin.ipPools.page.emptyNone', 'No IP pools configured')}
        emptyDescription={t('admin.ipPools.page.emptyHint', 'Add an IP pool to allocate static or dynamic addresses for PPPoE and Hotspot users.')}
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
          <>
            <Select
              value={type || 'all'}
              onValueChange={(val) => {
                setType(val === 'public' || val === 'private' ? val : '');
                setPage(1);
              }}
            >
              <SelectTrigger aria-label={t('admin.ipPools.page.filterType', 'Filter by type')} className="h-9 w-[140px] text-xs">
                <SelectValue>
                  {(value: string | null) =>
                    value === 'public'
                      ? t('admin.ipPools.page.publicPools', 'Public pools')
                      : value === 'private'
                        ? t('admin.ipPools.page.privatePools', 'Private pools')
                        : t('admin.ipPools.page.allTypes', 'All types')
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.ipPools.page.allTypes', 'All types')}</SelectItem>
                <SelectItem value="public">{t('admin.ipPools.page.publicPools', 'Public pools')}</SelectItem>
                <SelectItem value="private">{t('admin.ipPools.page.privatePools', 'Private pools')}</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('admin.ipPools.page.add', 'Add IP Pool')}
            </Button>
          </>
        }
      />

      <IpPoolModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        pool={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admin.ipPools.page.deleteTitle', 'Delete IP pool {name}?', { name: deleteTarget?.name ?? '' })}
        description={t('admin.ipPools.page.deleteDesc', 'The pool is removed from the database and from its MikroTik router. Pools with active or reserved assignments cannot be deleted.')}
        confirmLabel={t('admin.ipPools.page.deleteConfirm', 'Delete Pool')}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
