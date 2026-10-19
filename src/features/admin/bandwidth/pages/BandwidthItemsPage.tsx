'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Plus, Download, Package, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import {
  useBandwidthCategories,
  useBandwidthItems,
  useCreateBandwidthItem,
  useDeleteBandwidthItem,
  useUpdateBandwidthItem,
  type ItemInput,
} from '../hooks/useBandwidthCatalog';
import type { BandwidthCatalogItem, BandwidthCategory } from '../types';
import { FieldError, OptionSelect } from '../components/OptionSelect';
import { activeLabel, downloadCsv, fieldErrorsOf, isoDay, type Translate } from '../utils';

const itemSearchFilter = (row: LegacyRow<BandwidthCatalogItem>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const i = row.original;
  return [i.itemName, i.category, i.subcategory, i.description].some((v) => v.toLowerCase().includes(q));
};

type DialogState = { mode: 'create' } | { mode: 'edit'; item: BandwidthCatalogItem } | null;

const statusOptions = (t: Translate) => [
  { value: 'active', label: activeLabel(t, true) },
  { value: 'inactive', label: activeLabel(t, false) },
];

export function BandwidthItemsPage() {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = useBandwidthItems();
  const categoriesQuery = useBandwidthCategories();
  const deleteItem = useDeleteBandwidthItem();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<BandwidthCatalogItem | null>(null);

  const items = useMemo(() => data ?? [], [data]);
  const activeCount = items.filter((i) => i.status === 'active').length;
  const categoryCount = new Set(items.map((i) => i.categoryId)).size;

  const handleExportCsv = () => {
    downloadCsv(
      `bandwidth_items_${isoDay()}.csv`,
      ['Item', 'Category', 'Sub-category', 'Unit price (BDT)', 'VAT %', 'Status', 'Description'],
      items.map((i) => [i.itemName, i.category, i.subcategory, i.unitPrice, i.vat, i.status, i.description]),
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteItem.mutate(toDelete.id, { onSuccess: () => toast.success(t('admin.bandwidth.items.deleted', 'Item deleted')) });
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthCatalogItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: t('admin.bandwidth.shared.item', 'Item'),
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.itemName}</div>
              {row.original.description ? <div className="text-xs text-muted-foreground mt-0.5">{row.original.description}</div> : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: t('admin.bandwidth.shared.category', 'Category'),
        size: 200,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <Badge variant="outline" className="text-xs font-semibold bg-secondary/80 border-border/60">
              {row.original.category || '—'}
            </Badge>
            {row.original.subcategory ? <div className="text-xs text-muted-foreground">› {row.original.subcategory}</div> : null}
          </div>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: t('admin.bandwidth.items.colUnitPrice', 'Unit Price'),
        size: 140,
        cell: ({ row }) => <span className="font-mono text-sm font-bold text-foreground">{formatBdtWithSymbol(row.original.unitPrice)}</span>,
      },
      {
        accessorKey: 'vat',
        header: t('admin.bandwidth.shared.vat', 'VAT'),
        size: 90,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.vat}%</span>,
      },
      {
        id: 'status',
        accessorFn: (row) => activeLabel(t, row.status === 'active'),
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status === 'active' ? 'active' : 'suspended'} label={activeLabel(t, row.original.status === 'active')} />,
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label={t('common.edit', 'Edit')} onClick={() => setDialog({ mode: 'edit', item: row.original })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={t('common.delete', 'Delete')} onClick={() => setToDelete(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.bandwidth.items.loadFailed', 'Failed to load catalogue items')} description={t('admin.bandwidth.items.loadFailedHint', 'Could not fetch bandwidth catalogue items.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.items.title', 'Bandwidth Catalogue Items')}
        subtitle={t('admin.bandwidth.items.subtitle', 'Items used on provider purchase bills and client sales invoices')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.bandwidth-buy', 'Bandwidth Buy'), url: '/admin/bandwidth/buy' },
          { label: t('admin.bandwidth.buyHub.modItems', 'Catalogue Items') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={items.length === 0} className="text-xs border-border/80 hover:bg-accent">
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {t('admin.bandwidth.items.export', 'Export Catalogue')}
            </Button>
            <Button size="sm" onClick={() => setDialog({ mode: 'create' })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> {t('admin.bandwidth.items.add', 'Add Item')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{items.length}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.items.statItems', 'catalogue items')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{activeCount}</span>{' '}
          <span className="text-muted-foreground">{t('status.active', 'active')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{categoryCount}</span>{' '}
          <span className="text-muted-foreground">{t('admin.bandwidth.items.statCategories', 'categories in use')}</span>
        </p>
      </div>

      <DataTable urlState
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        searchKey="itemName"
        searchPlaceholder={t('admin.bandwidth.items.search', 'Search item by name, category, or description...')}
        searchFilterFn={itemSearchFilter}
        facetFilters={[
          { columnId: 'category', title: t('admin.bandwidth.shared.category', 'Category') },
          { columnId: 'status', title: t('admin.customers.list.statusLabel', 'Status') },
        ]}
        emptyTitle={t('admin.bandwidth.items.emptyTitle', 'No catalogue items')}
        emptyDescription={t('admin.bandwidth.items.emptyHint', 'Add bandwidth items to start recording purchase bills and invoices.')}
      />

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          {dialog ? (
            <ItemForm
              key={dialog.mode === 'edit' ? dialog.item.id : 'new'}
              editing={dialog.mode === 'edit' ? dialog.item : null}
              categories={categoriesQuery.data ?? []}
              categoriesLoading={categoriesQuery.isLoading}
              onDone={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('admin.bandwidth.items.deleteTitle', 'Delete "{name}"?', { name: toDelete?.itemName ?? '' })}
        description={t('admin.bandwidth.items.deleteDesc', 'The item is removed from the catalogue. Existing bills and invoices keep their line text.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ItemForm({
  editing,
  categories,
  categoriesLoading,
  onDone,
}: {
  editing: BandwidthCatalogItem | null;
  categories: BandwidthCategory[];
  categoriesLoading: boolean;
  onDone: () => void;
}) {
  const { t } = useLocale();
  const create = useCreateBandwidthItem();
  const update = useUpdateBandwidthItem();
  const [form, setForm] = useState<ItemInput>({
    itemName: editing?.itemName ?? '',
    categoryId: editing?.categoryId ?? 0,
    subcategoryIndex: editing?.subcategoryIndex ?? null,
    status: editing?.status ?? 'active',
    unitPrice: editing ? String(editing.unitPrice) : '',
    vat: editing ? String(editing.vat) : '',
    description: editing?.description ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const subs = categories.find((c) => c.id === form.categoryId)?.subcategories ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      setErrors({ category_id: t('admin.bandwidth.items.selectCategoryError', 'Select a category') });
      return;
    }
    setErrors({});
    const callbacks = {
      onSuccess: () => {
        toast.success(editing ? t('admin.bandwidth.items.updated', 'Item updated') : t('admin.bandwidth.items.added', 'Item added'));
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (editing) update.mutate({ ...form, id: editing.id }, callbacks);
    else create.mutate(form, callbacks);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> {editing ? t('admin.bandwidth.items.editTitle', 'Edit catalogue item') : t('admin.bandwidth.items.addTitle', 'Add catalogue item')}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {editing
            ? t('admin.bandwidth.items.editDesc', 'An item stays in its category; delete and re-add it to move it.')
            : t('admin.bandwidth.items.addDesc', 'The unit price and VAT prefill bill and invoice lines.')}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-3.5 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="item-name" className="text-xs font-semibold">{t('admin.bandwidth.items.itemName', 'Item name *')}</Label>
          <Input id="item-name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} className="text-xs h-9" required minLength={3} aria-invalid={Boolean(errors.item_name) || undefined} />
          <FieldError message={errors.item_name} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('admin.bandwidth.items.categoryReq', 'Category *')}</Label>
            <OptionSelect
              value={form.categoryId ? String(form.categoryId) : ''}
              onChange={(v) => setForm({ ...form, categoryId: Number(v) || 0, subcategoryIndex: null })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              placeholder={categoriesLoading ? t('common.loading', 'Loading…') : t('admin.bandwidth.items.selectCategory', 'Select category')}
              disabled={Boolean(editing)}
              invalid={Boolean(errors.category_id)}
            />
            <FieldError message={errors.category_id} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('admin.bandwidth.shared.subcategory', 'Sub-category')}</Label>
            <OptionSelect
              value={form.subcategoryIndex === null ? '' : String(form.subcategoryIndex)}
              onChange={(v) => setForm({ ...form, subcategoryIndex: v === '' ? null : Number(v) })}
              emptyLabel={t('admin.bandwidth.items.none', 'None')}
              options={subs.map((s) => ({ value: String(s.index), label: s.name }))}
              disabled={Boolean(editing) || subs.length === 0}
            />
            <FieldError message={errors.subcategory_index} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="item-price" className="text-xs font-semibold">{t('admin.bandwidth.items.unitPrice', 'Unit price (BDT)')}</Label>
            <Input id="item-price" type="number" min="0" step="any" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="text-xs h-9 font-mono font-bold" />
            <FieldError message={errors.unit} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-vat" className="text-xs font-semibold">{t('admin.bandwidth.shared.vatPct', 'VAT %')}</Label>
            <Input id="item-vat" type="number" min="0" max="100" step="any" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value })} className="text-xs h-9 font-mono" />
            <FieldError message={errors.vat} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t('admin.bandwidth.shared.statusReq', 'Status *')}</Label>
          <OptionSelect value={form.status} onChange={(v) => setForm({ ...form, status: v === 'inactive' ? 'inactive' : 'active' })} options={statusOptions(t)} />
          <FieldError message={errors.status} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="item-desc" className="text-xs font-semibold">{t('admin.bandwidth.shared.description', 'Description')}</Label>
          <Textarea id="item-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="text-xs" maxLength={500} />
          <FieldError message={errors.description} />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">{t('common.cancel', 'Cancel')}</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? t('admin.bandwidth.shared.saving', 'Saving…') : editing ? t('admin.bandwidth.items.save', 'Save item') : t('admin.bandwidth.items.addItem', 'Add item')}
          </Button>
        </div>
      </form>
    </>
  );
}
