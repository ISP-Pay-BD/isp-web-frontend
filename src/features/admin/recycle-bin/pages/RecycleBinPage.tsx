'use client';

import { useState, useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  RotateCcw,
  Trash2,
  Users,
  Package,
  FileText,
  LifeBuoy,
  UserCog,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';
import { useRecycleBin } from '../hooks/use-recycle-bin';

const entityConfig: Record<string, { icon: typeof Users }> = {
  customer: { icon: Users },
  package: { icon: Package },
  invoice: { icon: FileText },
  ticket: { icon: LifeBuoy },
  employee: { icon: UserCog },
};

const recycleSearchFilter = (
  row: LegacyRow<RecycleBinItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const item = row.original;
  return (
    item.title.toLowerCase().includes(q) ||
    item.identifier.toLowerCase().includes(q) ||
    item.details.toLowerCase().includes(q) ||
    item.entityType.toLowerCase().includes(q)
  );
};

export function RecycleBinPage() {
  const { data, isLoading, isError, refetch } = useRecycleBin();
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'restore' | 'delete';
    item: RecycleBinItem;
  } | null>(null);

  const list = items.length > 0 ? items : (data?.items ?? []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      customer: 0,
      package: 0,
      invoice: 0,
      ticket: 0,
      employee: 0,
    };
    for (const item of list) {
      if (counts[item.entityType] !== undefined) counts[item.entityType]++;
    }
    return [
      { label: 'Customers', count: counts.customer },
      { label: 'Packages', count: counts.package },
      { label: 'Invoices', count: counts.invoice },
      { label: 'Tickets', count: counts.ticket },
      { label: 'Employees', count: counts.employee },
    ];
  }, [list]);

  const handleRestore = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} restored successfully`);
    setConfirmAction(null);
  };

  const handleDeleteForever = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} permanently deleted`);
    setConfirmAction(null);
  };

  const columns = useMemo<LegacyColumnDef<RecycleBinItem, unknown>[]>(
    () => [
      {
        accessorKey: 'entityType',
        header: 'Type',
        size: 120,
        cell: ({ row }) => {
          const cfg = entityConfig[row.original.entityType] ?? entityConfig.customer;
          const EntityIcon = cfg.icon;
          return (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <EntityIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="capitalize">{row.original.entityType}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Title',
        size: 180,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="font-semibold text-sm">{row.original.title}</div>
        ),
      },
      {
        accessorKey: 'identifier',
        header: 'Identifier',
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
            {row.original.identifier}
          </span>
        ),
      },
      {
        accessorKey: 'details',
        header: 'Details',
        size: 220,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
            {row.original.details}
          </span>
        ),
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{row.original.deletedAt}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-emerald-500/10 hover:text-emerald-600"
              onClick={() => setConfirmAction({ type: 'restore', item: row.original })}
              title="Restore item"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmAction({ type: 'delete', item: row.original })}
              title="Delete forever"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
        <EmptyState
          title="Failed to load recycle bin"
          description="There was an error loading deleted items."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recycle Bin"
        subtitle="Restore or permanently delete soft-deleted records"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Recycle Bin' },
        ]}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border/60 py-3 text-sm">
        {stats.map((stat) => (
          <p key={stat.label}>
            <span className="font-semibold tabular-nums">{stat.count}</span>{' '}
            <span className="text-muted-foreground">{stat.label.toLowerCase()}</span>
          </p>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="title"
        searchPlaceholder="Search deleted items..."
        searchFilterFn={recycleSearchFilter}
        facetFilters={[{ columnId: 'entityType', title: 'Type' }]}
        emptyTitle="Recycle bin is empty"
        emptyDescription="No deleted items to restore. Deleted records will appear here."
      />

      {list.length > 0 && (
        <div className="flex items-center gap-3 border border-border px-4 py-3 text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs">
            Items are permanently deleted after 30 days.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'restore' ? 'Restore item?' : 'Delete permanently?'}
        description={
          confirmAction?.type === 'restore'
            ? `Restore "${confirmAction.item.title}" to the system?`
            : `Permanently delete "${confirmAction?.item.title}"? This cannot be undone.`
        }
        confirmLabel={confirmAction?.type === 'restore' ? 'Restore' : 'Delete Forever'}
        destructive={confirmAction?.type === 'delete'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'restore') handleRestore(confirmAction.item);
          else handleDeleteForever(confirmAction.item);
        }}
      />
    </div>
  );
}
