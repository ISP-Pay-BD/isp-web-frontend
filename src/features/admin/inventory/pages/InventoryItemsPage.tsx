'use client';

import { Suspense, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Boxes,
  CheckCircle2,
  CircleSlash,
  MoreHorizontal,
  Package,
  Layers,
  Edit,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog, PageSkeleton } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { num } from '@/lib/api/case';
import { INVENTORY_URL, idParam, mapItem, type InventoryCategory, type InventoryItem, type ItemPayload } from '../api';
import { useDeleteInventoryItem, useInventoryItems, useSaveInventoryItem } from '../hooks/use-inventory-items';
import { useAllInventoryCategories } from '../hooks/use-inventory-categories';
import { useInventorySummary } from '../hooks/use-inventory-summary';
import { StockMovementDialog } from '../components/StockMovementDialog';
import { KpiTile } from '../shared/KpiTile';
import { ListState } from '../shared/ListState';
import { OptionSelect } from '../shared/OptionSelect';
import { FieldError, fieldError } from '../shared/form-utils';
import { useUrlParam } from '@/hooks/use-url-state';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '../shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

export function InventoryItemsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" rows={8} />}>
      <InventoryItemsView />
    </Suspense>
  );
}

function InventoryItemsView() {
  const t = useTranslations();
  const statusOptions = [
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'inactive', label: t('status.inactive', 'Inactive') },
  ];
  const table = useServerTable();
  const [categoryId, setCategoryId] = useUrlParam('category_id');
  const [status, setStatus] = useState('');
  const query = useInventoryItems({ page: table.page, pageSize: table.pageSize, search: table.search, categoryId, status });
  const summary = useInventorySummary();
  const categoriesQuery = useAllInventoryCategories();
  const deleteItem = useDeleteInventoryItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);
  const s = summary.data;
  const kpi = (v: number | undefined) => (v === undefined ? '—' : formatCount(v));

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (
        await fetchAllPages<unknown>(`${INVENTORY_URL}/items`, {
          search: table.search || undefined,
          category_id: idParam(categoryId),
          status: status || undefined,
        })
      ).map(mapItem);
      downloadCsv(
        `inventory_items_${todayYmd()}.csv`,
        [
          t('admin.inventory.items.csvName', 'Item Name'),
          t('admin.inventory.items.colCategory', 'Category'),
          t('admin.inventory.items.csvSub', 'Sub-category'),
          t('admin.inventory.items.csvPrice', 'Unit Price (BDT)'),
          t('admin.inventory.items.csvVat', 'VAT %'),
          t('admin.inventory.items.colStatus', 'Status'),
          t('admin.inventory.items.csvDesc', 'Description'),
        ],
        rows.map((i) => [i.itemName, i.category, i.subcategory, i.unitPrice, i.vat, i.status, i.description]),
      );
      toast.success(t('admin.inventory.items.exported', 'Exported {n} items', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.inventory.categories.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: t('admin.inventory.items.colItem', 'Item'),
        enableHiding: false,
        size: 280,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm line-clamp-1">{item.itemName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Layers className="h-3 w-3" />
                  {item.subcategory ? `${item.category} / ${item.subcategory}` : item.category || '—'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: t('admin.inventory.items.colCategory', 'Category'),
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background/50 font-normal">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: t('admin.inventory.items.colPrice', 'Unit Price'),
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.unitPrice)}
          </span>
        ),
      },
      {
        accessorKey: 'vat',
        header: t('admin.inventory.items.colVat', 'VAT'),
        size: 90,
        cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.vat}%</span>,
      },
      {
        accessorKey: 'status',
        header: t('admin.inventory.items.colStatus', 'Status'),
        size: 110,
        cell: ({ row }) => {
          const active = row.original.status === 'active';
          return (
            <Badge
              variant="outline"
              tone={active ? 'success' : 'neutral'}
            >
              {active ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('admin.inventory.common.rowActions', 'Row actions')}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t('admin.inventory.items.actions', 'Item Actions')}</DropdownMenuLabel>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(item);
                      setFormOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.items.edit', 'Edit Item')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="create">
                  <DropdownMenuItem onClick={() => setAdjusting(item)}>
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.items.adjust', 'Adjust Stock')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setDeleting(item)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.items.delete', 'Delete Item')}
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

  const page = query.data;
  const filtered = Boolean(table.search || categoryId || status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.inventory.items.title', 'Inventory Items Catalog')}
        subtitle={t('admin.inventory.items.subtitle', 'Catalogue of network hardware, fiber accessories, CPE devices and other stock items.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.inventory', 'Inventory'), href: '/admin/inventory/items' },
          { label: t('admin.inventory.items.crumb', 'Items Catalog') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.inventory.categories.exporting', 'Exporting…') : t('admin.inventory.categories.export', 'Export CSV')}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={openCreate} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.inventory.items.add', 'Add Item')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label={t('admin.inventory.items.kpiTotal', 'Total Items')}
          icon={<Boxes className="h-4 w-4 text-primary" />}
          value={kpi(s?.totalItems)}
          hint={t('admin.inventory.items.kpiTotalHint', 'Cataloged items')}
        />
        <KpiTile
          label={t('status.active', 'Active')}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          value={kpi(s?.activeItems)}
          hint={t('admin.inventory.items.kpiActiveHint', 'Available for use')}
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
        <KpiTile
          label={t('status.inactive', 'Inactive')}
          icon={<CircleSlash className="h-4 w-4 text-muted-foreground" />}
          value={kpi(s?.inactiveItems)}
          hint={t('admin.inventory.items.kpiInactiveHint', 'Hidden from use')}
        />
        <KpiTile
          label={t('admin.inventory.categories.kpiCategories', 'Categories')}
          icon={<Layers className="h-4 w-4 text-primary" />}
          value={kpi(s?.categoriesCount)}
          hint={t('admin.inventory.items.kpiCategoriesHint', 'Category groups')}
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!filtered && page?.meta.total === 0}
        errorTitle={t('admin.inventory.items.loadFailed', 'Failed to load items')}
        emptyTitle={t('admin.inventory.items.emptyNone', 'No items yet')}
        emptyDescription={t('admin.inventory.items.emptyNoneHint', 'Add your first catalogue item to start tracking stock.')}
        icon={<Package className="h-5 w-5" />}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.inventory.items.search', 'Search items...')}
          emptyTitle={t('admin.inventory.items.emptyFiltered', 'No items match your filters')}
          server={{
            page: table.page,
            pageSize: table.pageSize,
            total: page?.meta.total ?? 0,
            onPageChange: table.setPage,
            onPageSizeChange: table.onPageSizeChange,
            search: table.search,
            onSearchChange: table.onSearchChange,
          }}
          toolbarActions={
            <div className="flex flex-wrap items-center gap-2">
              <OptionSelect
                value={categoryId}
                onChange={(v) => {
                  setCategoryId(v);
                  table.resetPage();
                }}
                options={categoryOptions}
                noneLabel={t('admin.inventory.items.allCategories', 'All categories')}
                className="h-9 w-48 text-xs"
              />
              <OptionSelect
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  table.resetPage();
                }}
                options={statusOptions}
                noneLabel={t('admin.inventory.items.allStatuses', 'All statuses')}
                className="h-9 w-36 text-xs"
              />
            </div>
          }
        />
      </ListState>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          {formOpen ? (
            <ItemForm
              item={editing}
              categories={categories}
              categoriesLoading={categoriesQuery.isLoading}
              defaultCategoryId={categoryId}
              onDone={() => setFormOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('admin.inventory.items.deleteTitle', 'Delete item?')}
        description={deleting ? t('admin.inventory.items.deleteDesc', '"{name}" will be removed from the catalogue.', { name: deleting.itemName }) : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          deleteItem.mutate(target.id, { onSuccess: () => toast.success(t('admin.inventory.common.deleted', '"{name}" deleted', { name: target.itemName })) });
          setDeleting(null);
        }}
      />

      <StockMovementDialog
        open={adjusting !== null}
        onOpenChange={(o) => !o && setAdjusting(null)}
        type="adjust"
        prefill={adjusting ? { itemId: adjusting.id } : undefined}
      />
    </div>
  );
}

function ItemForm({
  item,
  categories,
  categoriesLoading,
  defaultCategoryId,
  onDone,
}: {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  categoriesLoading: boolean;
  defaultCategoryId: string;
  onDone: () => void;
}) {
  const t = useTranslations();
  const statusOptions = [
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'inactive', label: t('status.inactive', 'Inactive') },
  ];
  const isEdit = item !== null;
  const [itemName, setItemName] = useState(item?.itemName ?? '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCategoryId);
  const [subIndex, setSubIndex] = useState(item?.subcategoryIndex !== null && item ? String(item.subcategoryIndex) : '');
  const [price, setPrice] = useState(item ? String(item.unitPrice) : '');
  const [vat, setVat] = useState(item ? String(item.vat) : '');
  const [status, setStatus] = useState(item?.status ?? 'active');
  const [description, setDescription] = useState(item?.description ?? '');
  const [localError, setLocalError] = useState<Record<string, string>>({});
  const save = useSaveInventoryItem();
  const err = save.error;

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const subOptions = (categories.find((c) => c.id === categoryId)?.subcategories ?? []).map((sc) => ({
    value: String(sc.index),
    label: sc.name,
  }));
  const errorFor = (...keys: string[]) => keys.map((k) => localError[k]).find(Boolean) ?? fieldError(err, ...keys);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (itemName.trim().length < 3) errors.item_name = t('admin.inventory.items.errName', 'Item name must be at least 3 characters');
    if (!categoryId) errors.category_id = t('admin.inventory.items.errCategory', 'Select a category');
    if (vat !== '' && (num(vat, -1) < 0 || num(vat) > 100)) errors.vat = t('admin.inventory.items.errVat', 'VAT must be between 0 and 100');
    setLocalError(errors);
    if (Object.keys(errors).length > 0) return;

    const body: ItemPayload = {
      item_name: itemName.trim(),
      category_id: idParam(categoryId),
      subcategory_index: subIndex !== '' ? Number(subIndex) : undefined,
      status,
      price: num(price),
      vat: vat !== '' ? num(vat) : undefined,
      description: description.trim() || undefined,
    };
    save.mutate(
      { id: item?.id, body },
      {
        onSuccess: () => {
          toast.success(
            isEdit
              ? t('admin.inventory.common.updated', '"{name}" updated', { name: body.item_name })
              : t('admin.inventory.items.added', '"{name}" added to the catalogue', { name: body.item_name }),
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
          <Package className="h-5 w-5 text-primary" />
          {isEdit ? t('admin.inventory.items.editTitle', 'Edit Inventory Item') : t('admin.inventory.items.addTitle', 'Add Inventory Item')}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? t('admin.inventory.items.editDesc', 'Update the catalogue details of this item.')
            : t('admin.inventory.items.addDesc', 'Register a new item in the inventory catalogue.')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="item-name">{t('admin.inventory.items.fieldName', 'Item Name')} *</Label>
          <Input
            id="item-name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            aria-invalid={Boolean(errorFor('item_name')) || undefined}
            required
          />
          <FieldError message={errorFor('item_name')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="item-cat">{t('admin.inventory.items.colCategory', 'Category')} *</Label>
            <OptionSelect
              id="item-cat"
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                setSubIndex('');
              }}
              options={categoryOptions}
              placeholder={categoriesLoading ? t('admin.inventory.items.loading', 'Loading…') : t('admin.inventory.items.selectCategory', 'Select category')}
              disabled={isEdit || categoriesLoading}
              invalid={Boolean(errorFor('category_id'))}
            />
            <FieldError message={errorFor('category_id')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-sub">{t('admin.inventory.items.csvSub', 'Sub-category')}</Label>
            <OptionSelect
              id="item-sub"
              value={subIndex}
              onChange={setSubIndex}
              options={subOptions}
              noneLabel={t('admin.inventory.items.none', 'None')}
              disabled={isEdit || subOptions.length === 0}
              invalid={Boolean(errorFor('subcategory_index'))}
            />
            <FieldError message={errorFor('subcategory_index')} />
          </div>
        </div>
        {isEdit ? (
          <p className="-mt-2 text-xs text-muted-foreground">{t('admin.inventory.items.categoryLocked', 'The category of an existing item cannot be changed.')}</p>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="item-price">{t('admin.inventory.items.csvPrice', 'Unit Price (BDT)')}</Label>
            <Input
              id="item-price"
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={Boolean(errorFor('unit', 'price')) || undefined}
            />
            <FieldError message={errorFor('unit', 'price')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-vat">{t('admin.inventory.items.csvVat', 'VAT %')}</Label>
            <Input
              id="item-vat"
              type="number"
              min={0}
              max={100}
              step="any"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              aria-invalid={Boolean(errorFor('vat')) || undefined}
            />
            <FieldError message={errorFor('vat')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-status">{t('admin.inventory.items.colStatus', 'Status')}</Label>
            <OptionSelect id="item-status" value={status} onChange={(v) => setStatus(v || 'active')} options={statusOptions} />
            <FieldError message={errorFor('status')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="item-desc">{t('admin.inventory.items.csvDesc', 'Description')}</Label>
          <Textarea id="item-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <FieldError message={errorFor('description')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending
            ? t('admin.inventory.common.saving', 'Saving…')
            : isEdit
              ? t('admin.inventory.common.saveChanges', 'Save Changes')
              : t('admin.inventory.items.addToCatalog', 'Add to Catalog')}
        </Button>
      </DialogFooter>
    </form>
  );
}
