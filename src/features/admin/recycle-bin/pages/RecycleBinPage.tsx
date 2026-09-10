'use client';

import { useState, useMemo } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  RotateCw,
  ArchiveRestore,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';
import { useRecycleBin } from '../hooks/use-recycle-bin';

const entityConfig: Record<string, { icon: typeof Users; color: string; label: string }> = {
  customer: { icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Customers' },
  package: { icon: Package, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Packages' },
  invoice: { icon: FileText, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Invoices' },
  ticket: { icon: LifeBuoy, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Support Tickets' },
  employee: { icon: UserCog, color: 'text-primary bg-primary/10 border-primary/20', label: 'Staff' },
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
  const [selectedType, setSelectedType] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'restore' | 'delete' | 'emptyAll';
    item?: RecycleBinItem;
  } | null>(null);

  const list = items.length > 0 ? items : (data?.items ?? []);

  const filteredList = useMemo(() => {
    if (selectedType === 'all') return list;
    return list.filter((item) => item.entityType === selectedType);
  }, [list, selectedType]);

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
      { key: 'customer', label: 'Customers', count: counts.customer, icon: Users },
      { key: 'package', label: 'Packages', count: counts.package, icon: Package },
      { key: 'invoice', label: 'Invoices', count: counts.invoice, icon: FileText },
      { key: 'ticket', label: 'Tickets', count: counts.ticket, icon: LifeBuoy },
      { key: 'employee', label: 'Employees', count: counts.employee, icon: UserCog },
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

  const handleEmptyAll = () => {
    setItems([]);
    toast.success('Recycle bin emptied permanently');
    setConfirmAction(null);
  };

  const columns = useMemo<LegacyColumnDef<RecycleBinItem, unknown>[]>(
    () => [
      {
        accessorKey: 'entityType',
        header: 'Entity Type',
        size: 130,
        cell: ({ row }) => {
          const cfg = entityConfig[row.original.entityType] ?? entityConfig.customer;
          const EntityIcon = cfg.icon;
          return (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border backdrop-blur-sm capitalize bg-muted/40 border-border/70 text-foreground">
              <EntityIcon className="h-3.5 w-3.5 text-primary" />
              <span>{row.original.entityType}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Deleted Item Name',
        size: 200,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="font-semibold text-sm text-foreground">{row.original.title}</div>
        ),
      },
      {
        accessorKey: 'identifier',
        header: 'Unique Identifier',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded border border-border/60 text-foreground">
            {row.original.identifier}
          </span>
        ),
      },
      {
        accessorKey: 'details',
        header: 'Context & Details',
        size: 220,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-1 block">
            {row.original.details}
          </span>
        ),
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted Timestamp',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            <span>{row.original.deletedAt}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="text-xs font-medium text-muted-foreground text-right block">Actions</span>,
        size: 120,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium"
              onClick={() => setConfirmAction({ type: 'restore', item: row.original })}
              title="Restore item"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:bg-destructive/10 text-xs"
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
        title="Recycle Bin & Data Vault"
        subtitle="Safe recovery area for soft-deleted customer profiles, packages, invoices, and service tickets"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Recycle Bin' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success('Recycle bin synced');
              }}
              className="border-border/70 hover:border-border hover:bg-card/80 text-xs"
            >
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            {list.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction({ type: 'emptyAll' })}
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Empty Recycle Bin
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards / Type selector chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = selectedType === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => setSelectedType(selectedType === stat.key ? 'all' : stat.key)}
              className={`rounded-xl border p-3.5 text-left transition-all backdrop-blur-md relative overflow-hidden group ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20 ring-1 ring-primary'
                  : 'border-border/70 bg-card/60 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-muted/60 text-foreground border border-border/50">
                  {stat.count}
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">{stat.label}</div>
              <p className="text-[11px] text-muted-foreground">Click to filter</p>
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
        {selectedType !== 'all' && (
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground">
              Showing filter: <strong className="text-foreground capitalize">{selectedType}s</strong>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedType('all')}
              className="h-6 text-xs text-primary hover:underline p-0"
            >
              Reset filter
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredList}
          getRowId={(row) => row.id}
          searchPlaceholder="Search deleted items by name, ID, or description..."
          searchFilterFn={recycleSearchFilter}
          emptyTitle="Recycle bin is clean"
          emptyDescription="No deleted records matching your filter. Soft-deleted entities will be retained here for 30 days."
        />

        {list.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs text-foreground/80">
              <strong className="text-amber-400">Retention Policy:</strong> Soft-deleted records are preserved for 30 calendar days before automated hard-purge. Restoring immediately returns items to their original tables with full relationship history intact.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'emptyAll'
            ? 'Empty entire recycle bin?'
            : confirmAction?.type === 'restore'
              ? 'Restore item?'
              : 'Delete permanently?'
        }
        description={
          confirmAction?.type === 'emptyAll'
            ? 'This will permanently destroy all soft-deleted records across all categories. This operation cannot be rolled back.'
            : confirmAction?.type === 'restore'
              ? `Restore "${confirmAction.item?.title}" to the system with its active status?`
              : `Permanently erase "${confirmAction?.item?.title}" from disk? This cannot be undone.`
        }
        confirmLabel={
          confirmAction?.type === 'emptyAll'
            ? 'Yes, Empty Bin'
            : confirmAction?.type === 'restore'
              ? 'Restore Record'
              : 'Delete Forever'
        }
        destructive={confirmAction?.type === 'delete' || confirmAction?.type === 'emptyAll'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'emptyAll') handleEmptyAll();
          else if (confirmAction.type === 'restore' && confirmAction.item) handleRestore(confirmAction.item);
          else if (confirmAction.type === 'delete' && confirmAction.item) handleDeleteForever(confirmAction.item);
        }}
      />
    </div>
  );
}

