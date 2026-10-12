'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { RotateCcw, Trash2, Users, Package, LifeBuoy, UserCog, Clock, AlertTriangle, RotateCw, Network, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  useDeleteRecycleBinItems,
  useEmptyRecycleBin,
  useRecycleBin,
  useRestoreRecycleBinItems,
  type RecycleBinItem,
} from '../hooks/use-recycle-bin';

/** Entities the backend TrashService can bin (app/Config/Trash.php). */
const ENTITIES: Record<string, { label: string; icon: typeof Users }> = {
  customer: { label: 'Customers', icon: Users },
  reseller: { label: 'Resellers', icon: Network },
  package: { label: 'Packages', icon: Package },
  employee: { label: 'Employees', icon: UserCog },
  support_ticket: { label: 'Support Tickets', icon: LifeBuoy },
};

const fmt = (iso: string) => (iso ? new Date(iso.replace(' ', 'T')).toLocaleString() : '—');

export function RecycleBinPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useRecycleBin({ page, pageSize, search, entity });
  const restore = useRestoreRecycleBinItems();
  const purge = useDeleteRecycleBinItems();
  const empty = useEmptyRecycleBin();
  const [confirmAction, setConfirmAction] = useState<{ type: 'restore' | 'delete' | 'emptyAll'; item?: RecycleBinItem } | null>(null);

  const counts = data?.counts ?? {};
  const binTotal = Object.values(counts).reduce((a, b) => a + Number(b), 0);
  const chips = useMemo(() => {
    const keys = [...new Set([...Object.keys(ENTITIES), ...Object.keys(data?.counts ?? {})])];
    return keys.map((key) => ({ key, label: ENTITIES[key]?.label ?? key.replace(/_/g, ' '), icon: ENTITIES[key]?.icon ?? Archive, count: Number(data?.counts?.[key] ?? 0) }));
  }, [data?.counts]);

  const columns = useMemo<LegacyColumnDef<RecycleBinItem, unknown>[]>(
    () => [
      {
        accessorKey: 'entity',
        header: 'Type',
        size: 140,
        cell: ({ row }) => {
          const Icon = ENTITIES[row.original.entity]?.icon ?? Archive;
          return (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border capitalize bg-muted/40 border-border/70 text-foreground">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{row.original.entity.replace(/_/g, ' ')}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'label',
        header: 'Deleted item',
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-sm text-foreground">{row.original.label}</div>
            {row.original.sourceId && <div className="font-mono text-[11px] text-muted-foreground">ID {row.original.sourceId}</div>}
          </div>
        ),
      },
      {
        accessorKey: 'deletedBy',
        header: 'Deleted by',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.deletedBy || '—'}</span>,
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            <span>{fmt(row.original.deletedAt)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'expiresAt',
        header: 'Purged on',
        cell: ({ row }) => <span className="text-xs text-muted-foreground font-mono">{fmt(row.original.expiresAt)}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="text-xs font-medium text-muted-foreground text-right block">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Can menu="recycle_bin" action="restore">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium"
                onClick={() => setConfirmAction({ type: 'restore', item: row.original })}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Restore
              </Button>
            </Can>
            <Can menu="recycle_bin" action="delete_forever">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:bg-destructive/10 text-xs"
                aria-label="Delete forever"
                onClick={() => setConfirmAction({ type: 'delete', item: row.original })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError || !data) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load recycle bin" description={errorMessage(error)} actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  const runConfirmed = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;
    if (action.type === 'emptyAll') {
      empty.mutate(undefined, { onSuccess: (res) => toast.success(res.deleted > 0 ? `${res.deleted} item(s) permanently deleted` : 'Recycle bin is already empty') });
    } else if (action.item && action.type === 'restore') {
      const item = action.item;
      restore.mutate([item.id], { onSuccess: () => toast.success(`${item.label} restored`) });
    } else if (action.item) {
      const item = action.item;
      purge.mutate([item.id], { onSuccess: () => toast.success(`${item.label} permanently deleted`) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recycle Bin"
        subtitle="Deleted customers, resellers, packages, staff and tickets — restore them before they are purged"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Recycle Bin' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/70 hover:border-border hover:bg-card/80 text-xs">
              <RotateCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
            {binTotal > 0 && (
              <Can menu="recycle_bin" action="empty">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={empty.isPending}
                  onClick={() => setConfirmAction({ type: 'emptyAll' })}
                  className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Empty Recycle Bin
                </Button>
              </Can>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {chips.map((stat) => {
          const Icon = stat.icon;
          const isActive = entity === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => {
                setEntity(isActive ? '' : stat.key);
                setPage(1);
              }}
              className={`rounded-xl border p-3.5 text-left transition-all backdrop-blur-md ${
                isActive ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20 ring-1 ring-primary' : 'border-border/70 bg-card/60 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-muted/60 text-foreground border border-border/50">{stat.count}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground capitalize">{stat.label}</div>
              <p className="text-[11px] text-muted-foreground">{isActive ? 'Click to clear filter' : 'Click to filter'}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        <DataTable
          columns={columns}
          data={data.items}
          getRowId={(row) => row.id}
          searchPlaceholder="Search deleted items by name or who deleted them..."
          emptyTitle="Recycle bin is clean"
          emptyDescription={`Deleted records are kept here for ${data.retentionDays} days.`}
          server={{
            page,
            pageSize,
            total: data.meta.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            search,
            onSearchChange: (value) => {
              setSearch(value);
              setPage(1);
            },
          }}
        />

        {binTotal > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs text-foreground/80">
              <strong className="text-amber-400">Retention:</strong> deleted records are kept for {data.retentionDays} days, then purged automatically.
              Restoring puts the record and its related rows back.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === 'emptyAll' ? 'Empty the recycle bin?' : confirmAction?.type === 'restore' ? 'Restore item?' : 'Delete permanently?'}
        description={
          confirmAction?.type === 'emptyAll'
            ? `All ${binTotal} deleted record(s) will be destroyed. This cannot be undone.`
            : confirmAction?.type === 'restore'
              ? `Restore "${confirmAction.item?.label}"?`
              : `Permanently erase "${confirmAction?.item?.label}"? This cannot be undone.`
        }
        confirmLabel={confirmAction?.type === 'emptyAll' ? 'Empty bin' : confirmAction?.type === 'restore' ? 'Restore' : 'Delete forever'}
        destructive={confirmAction?.type !== 'restore'}
        onConfirm={runConfirmed}
      />
    </div>
  );
}
