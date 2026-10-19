'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { Plus, Scale, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import type { InventoryUnit } from '../api';
import { useDeleteUnit, useInventoryUnits, useSaveUnit } from '../hooks/use-inventory-units';
import { useInventorySummary } from '../hooks/use-inventory-summary';
import { KpiTile } from '../shared/KpiTile';
import { ListState } from '../shared/ListState';
import { FieldError, fieldError, fmtDateTime } from '../shared/form-utils';
import { useServerTable } from '../shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

export function InventoryUnitsPage() {
  const t = useTranslations();
  const table = useServerTable();
  const query = useInventoryUnits({ page: table.page, pageSize: table.pageSize, search: table.search });
  const summary = useInventorySummary();
  const deleteUnit = useDeleteUnit();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryUnit | null>(null);
  const [deleting, setDeleting] = useState<InventoryUnit | null>(null);

  const page = query.data;

  const columns = useMemo<LegacyColumnDef<InventoryUnit, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.inventory.units.colName', 'Unit Name'),
        enableHiding: false,
        size: 280,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Scale className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.inventory.common.created', 'Created'),
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{fmtDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('admin.inventory.common.rowActions', 'Row actions')}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t('admin.inventory.units.options', 'Unit Options')}</DropdownMenuLabel>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(u);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.units.edit', 'Edit Unit')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(u)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.units.delete', 'Delete Unit')}
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.inventory.units.title', 'Measurement Units')}
        subtitle={t('admin.inventory.units.subtitle', 'Units used on purchase requisition and bill lines (pieces, meters, boxes…).')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.inventory', 'Inventory'), href: '/admin/inventory/items' },
          { label: t('admin.inventory.units.title', 'Measurement Units') },
        ]}
        actions={
          <Can menu={MENU} action="create">
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('admin.inventory.units.add', 'Add Unit')}
            </Button>
          </Can>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label={t('admin.inventory.units.kpiTotal', 'Total Units')}
          icon={<Scale className="h-4 w-4 text-primary" />}
          value={summary.data ? formatCount(summary.data.unitsCount) : '—'}
          hint={t('admin.inventory.units.kpiHint', 'Defined measurement units')}
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle={t('admin.inventory.units.loadFailed', 'Failed to load units')}
        emptyTitle={t('admin.inventory.units.emptyNone', 'No units yet')}
        emptyDescription={t('admin.inventory.units.emptyNoneHint', 'Add the units you buy and stock items in.')}
        icon={<Scale className="h-5 w-5" />}
        rows={6}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.inventory.units.search', 'Search units...')}
          emptyTitle={t('admin.inventory.units.emptySearch', 'No units match your search')}
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
        />
      </ListState>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          {formOpen ? <UnitForm unit={editing} onDone={() => setFormOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.inventory.units.deleteTitle', 'Delete unit?')}
        description={deleting ? t('admin.inventory.common.willBeDeleted', '"{name}" will be deleted.', { name: deleting.name }) : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteUnit.mutate(target.id, { onSuccess: () => toast.success(t('admin.inventory.units.deleted', 'Unit "{name}" deleted', { name: target.name })) });
          setDeleting(null);
        }}
      />
    </div>
  );
}

function UnitForm({ unit, onDone }: { unit: InventoryUnit | null; onDone: () => void }) {
  const t = useTranslations();
  const [name, setName] = useState(unit?.name ?? '');
  const save = useSaveUnit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    save.mutate(
      { id: unit?.id, name: name.trim() },
      {
        onSuccess: () => {
          toast.success(
            unit
              ? t('admin.inventory.units.updated', 'Unit "{name}" updated', { name: name.trim() })
              : t('admin.inventory.units.created', 'Unit "{name}" created', { name: name.trim() }),
          );
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          {unit ? t('admin.inventory.units.editTitle', 'Edit Measurement Unit') : t('admin.inventory.units.addTitle', 'Add Measurement Unit')}
        </DialogTitle>
        <DialogDescription>{t('admin.inventory.units.formDesc', 'Units are selectable on requisition and purchase bill lines.')}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="unit-name">{t('admin.inventory.units.fieldName', 'Unit Name')} *</Label>
          <Input
            id="unit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(fieldError(save.error, 'name')) || undefined}
            required
          />
          <FieldError message={fieldError(save.error, 'name')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? t('admin.inventory.common.saving', 'Saving…') : t('admin.inventory.units.save', 'Save Unit')}
        </Button>
      </DialogFooter>
    </form>
  );
}
