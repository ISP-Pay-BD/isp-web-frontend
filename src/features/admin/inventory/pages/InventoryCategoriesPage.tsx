'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Layers,
  FolderTree,
  Boxes,
  ListTree,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Can, ConfirmDialog } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { INVENTORY_URL, idParam, mapCategory, type CategoryPayload, type InventoryCategory, type InventorySubcategory } from '../api';
import {
  useAllInventoryCategories,
  useCreateCategory,
  useDeleteCategory,
  useDeleteSubcategory,
  useInventoryCategories,
  useUpdateCategory,
  useUpdateSubcategory,
} from '../hooks/use-inventory-categories';
import { useInventorySummary } from '../hooks/use-inventory-summary';
import { KpiTile } from '../shared/KpiTile';
import { ListState } from '../shared/ListState';
import { OptionSelect } from '../shared/OptionSelect';
import { FieldError, fieldError } from '../shared/form-utils';
import { downloadCsv, fetchAllPages, todayYmd, useServerTable } from '../shared/table-utils';

import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
const MENU = 'inventory_purchess';

type FormState =
  | { mode: 'create'; parentId?: string }
  | { mode: 'edit'; category: InventoryCategory }
  | { mode: 'edit-sub'; category: InventoryCategory; sub: InventorySubcategory };

type DeleteState =
  | { kind: 'category'; category: InventoryCategory }
  | { kind: 'sub'; category: InventoryCategory; sub: InventorySubcategory };

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations();
  const active = status === 'active';
  return (
    <Badge
      variant="outline"
      tone={active ? 'success' : 'neutral'}
    >
      {active ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}
    </Badge>
  );
}

export function InventoryCategoriesPage() {
  const t = useTranslations();
  const table = useServerTable();
  const query = useInventoryCategories({ page: table.page, pageSize: table.pageSize, search: table.search });
  const summary = useInventorySummary();
  const deleteCategory = useDeleteCategory();
  const deleteSub = useDeleteSubcategory();

  const [form, setForm] = useState<FormState | null>(null);
  const [subsSnapshot, setSubsSnapshot] = useState<InventoryCategory | null>(null);
  const [deleting, setDeleting] = useState<DeleteState | null>(null);
  const [exporting, setExporting] = useState(false);

  const page = query.data;
  // Keep the sub-category dialog in sync with refetched rows after edits.
  const subsCategory = subsSnapshot ? (page?.items.find((c) => c.id === subsSnapshot.id) ?? subsSnapshot) : null;
  const s = summary.data;
  const kpi = (v: number | undefined) => (v === undefined ? '—' : formatCount(v));

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (await fetchAllPages<unknown>(`${INVENTORY_URL}/categories`, { search: table.search || undefined })).map(
        mapCategory,
      );
      downloadCsv(
        `inventory_categories_${todayYmd()}.csv`,
        [
          t('admin.inventory.categories.colCategory', 'Category'),
          t('admin.inventory.categories.colStatus', 'Status'),
          t('admin.inventory.categories.colDesc', 'Short Description'),
          t('admin.inventory.categories.colItems', 'Items'),
          t('admin.inventory.categories.colSubs', 'Sub-categories'),
        ],
        rows.map((c) => [c.name, c.status, c.shortDescription, c.itemCount, c.subcategories.map((sc) => sc.name).join('; ')]),
      );
      toast.success(t('admin.inventory.categories.exported', 'Exported {n} categories', { n: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('admin.inventory.categories.exportFailed', 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<InventoryCategory, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.inventory.categories.colCategory', 'Category'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <FolderTree className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'shortDescription',
        header: t('admin.inventory.categories.colDesc', 'Short Description'),
        size: 260,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-1">{row.original.shortDescription || '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.inventory.categories.colStatus', 'Status'),
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'itemCount',
        header: t('admin.inventory.categories.colItems', 'Items'),
        size: 110,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-mono tabular-nums font-semibold">
            {t('admin.inventory.categories.itemsCount', '{n} items', { n: row.original.itemCount })}
          </Badge>
        ),
      },
      {
        id: 'subcategories',
        header: t('admin.inventory.categories.colSubs', 'Sub-categories'),
        size: 140,
        cell: ({ row }) => {
          const count = row.original.subcategories.length;
          return (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              onClick={() => setSubsSnapshot(row.original)}
            >
              <ListTree className="h-3.5 w-3.5" />
              <span className="tabular-nums">{count}</span>
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('admin.inventory.common.rowActions', 'Row actions')}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{t('admin.inventory.categories.actions', 'Category Actions')}</DropdownMenuLabel>
                <DropdownMenuItem render={<Link href={`/admin/inventory/items?category_id=${encodeURIComponent(cat.id)}`} />}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  {t('admin.inventory.categories.viewItems', 'View Items')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubsSnapshot(cat)}>
                  <ListTree className="h-3.5 w-3.5 mr-2" />
                  {t('admin.inventory.categories.colSubs', 'Sub-categories')}
                </DropdownMenuItem>
                <Can menu={MENU} action="create">
                  <DropdownMenuItem onClick={() => setForm({ mode: 'create', parentId: cat.id })}>
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.categories.addSub', 'Add Sub-category')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem onClick={() => setForm({ mode: 'edit', category: cat })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.categories.edit', 'Edit Category')}
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-rose-500 focus:text-rose-500"
                    onClick={() => setDeleting({ kind: 'category', category: cat })}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('admin.inventory.categories.delete', 'Delete Category')}
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
        title={t('admin.inventory.categories.title', 'Inventory Categories')}
        subtitle={t('admin.inventory.categories.subtitle', 'Classification groups and sub-categories for catalogue items.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), href: '/admin/dashboard' },
          { label: t('common.crumb.inventory', 'Inventory'), href: '/admin/inventory/items' },
          { label: t('admin.inventory.categories.crumb', 'Categories') },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? t('admin.inventory.categories.exporting', 'Exporting…') : t('admin.inventory.categories.export', 'Export CSV')}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setForm({ mode: 'create' })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.inventory.categories.create', 'Create Category')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile
          label={t('admin.inventory.categories.kpiCategories', 'Categories')}
          icon={<Layers className="h-4 w-4 text-primary" />}
          value={kpi(s?.categoriesCount)}
          hint={t('admin.inventory.categories.kpiCategoriesHint', 'Category groups defined')}
        />
        <KpiTile
          label={t('admin.inventory.categories.colSubs', 'Sub-categories')}
          icon={<ListTree className="h-4 w-4 text-primary" />}
          value={kpi(s?.subcategoriesCount)}
          hint={t('admin.inventory.categories.kpiSubsHint', 'Nested classifications')}
        />
        <KpiTile
          label={t('admin.inventory.categories.kpiItems', 'Catalogue Items')}
          icon={<Boxes className="h-4 w-4 text-emerald-500" />}
          value={kpi(s?.totalItems)}
          hint={t('admin.inventory.categories.kpiItemsHint', 'Items across all categories')}
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle={t('admin.inventory.categories.loadFailed', 'Failed to load categories')}
        emptyTitle={t('admin.inventory.categories.emptyNone', 'No categories yet')}
        emptyDescription={t('admin.inventory.categories.emptyNoneHint', 'Create a category to start organising catalogue items.')}
        icon={<FolderTree className="h-5 w-5" />}
        rows={6}
      >
        <DataTable urlState
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder={t('admin.inventory.categories.search', 'Search categories...')}
          emptyTitle={t('admin.inventory.categories.emptySearch', 'No categories match your search')}
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

      {/* Create / edit category or sub-category */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form ? <CategoryForm state={form} onDone={() => setForm(null)} /> : null}
        </DialogContent>
      </Dialog>

      {/* Sub-categories of one category */}
      <Dialog open={subsCategory !== null} onOpenChange={(o) => !o && setSubsSnapshot(null)}>
        <DialogContent className="sm:max-w-lg">
          {subsCategory ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ListTree className="h-5 w-5 text-primary" />
                  {t('admin.inventory.categories.subsOf', '{name} — Sub-categories', { name: subsCategory.name })}
                </DialogTitle>
                <DialogDescription>
                  {t('admin.inventory.categories.subsSummary', '{subs} sub-categories · {items} items in this category', {
                    subs: subsCategory.subcategories.length,
                    items: subsCategory.itemCount,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] space-y-2 overflow-y-auto py-2">
                {subsCategory.subcategories.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    {t('admin.inventory.categories.noSubs', 'No sub-categories yet.')}
                  </p>
                ) : (
                  subsCategory.subcategories.map((sub) => (
                    <div
                      key={sub.index}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{sub.name}</span>
                          <StatusBadge status={sub.status} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {t('admin.inventory.categories.itemsCount', '{n} items', { n: sub.itemCount })}
                          {sub.shortDescription ? ` · ${sub.shortDescription}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Can menu={MENU} action="update">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            aria-label={t('admin.inventory.categories.editSub', 'Edit {name}', { name: sub.name })}
                            onClick={() => {
                              setSubsSnapshot(null);
                              setForm({ mode: 'edit-sub', category: subsCategory, sub });
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                        <Can menu={MENU} action="delete">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-500"
                            aria-label={t('admin.inventory.categories.deleteSub', 'Delete {name}', { name: sub.name })}
                            onClick={() => {
                              setSubsSnapshot(null);
                              setDeleting({ kind: 'sub', category: subsCategory, sub });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSubsSnapshot(null)}>
                  {t('common.close', 'Close')}
                </Button>
                <Can menu={MENU} action="create">
                  <Button
                    type="button"
                    onClick={() => {
                      setSubsSnapshot(null);
                      setForm({ mode: 'create', parentId: subsCategory.id });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('admin.inventory.categories.addSub', 'Add Sub-category')}
                  </Button>
                </Can>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={deleting?.kind === 'sub' ? t('admin.inventory.categories.deleteSubTitle', 'Delete sub-category?') : t('admin.inventory.categories.deleteTitle', 'Delete category?')}
        description={
          deleting?.kind === 'sub'
            ? t(
                'admin.inventory.categories.deleteSubDesc',
                '"{name}" will be removed from {category}. Sub-categories that still have items cannot be deleted.',
                { name: deleting.sub.name, category: deleting.category.name },
              )
            : deleting
              ? t(
                  'admin.inventory.categories.deleteDesc',
                  '"{name}" will be deleted. Categories that still have sub-categories cannot be deleted.',
                  { name: deleting.category.name },
                )
              : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          if (target.kind === 'sub') {
            deleteSub.mutate(
              { categoryId: target.category.id, index: target.sub.index },
              { onSuccess: () => toast.success(t('admin.inventory.categories.subDeleted', 'Sub-category "{name}" deleted', { name: target.sub.name })) },
            );
          } else {
            deleteCategory.mutate(target.category.id, {
              onSuccess: () => toast.success(t('admin.inventory.categories.deleted', 'Category "{name}" deleted', { name: target.category.name })),
            });
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}

function CategoryForm({ state, onDone }: { state: FormState; onDone: () => void }) {
  const t = useTranslations();
  const statusOptions = [
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'inactive', label: t('status.inactive', 'Inactive') },
  ];
  const initial =
    state.mode === 'edit' ? state.category : state.mode === 'edit-sub' ? state.sub : null;
  const [name, setName] = useState(initial?.name ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [parentId, setParentId] = useState(state.mode === 'create' ? (state.parentId ?? '') : '');
  const [localError, setLocalError] = useState<string | undefined>();

  const allCategories = useAllInventoryCategories(state.mode === 'create');
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const updateSub = useUpdateSubcategory();
  const active = state.mode === 'create' ? create : state.mode === 'edit' ? update : updateSub;
  const err = active.error;

  const parentOptions = (allCategories.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  const isSub = state.mode === 'edit-sub' || (state.mode === 'create' && parentId !== '');
  const title =
    state.mode === 'edit'
      ? t('admin.inventory.categories.edit', 'Edit Category')
      : state.mode === 'edit-sub'
        ? t('admin.inventory.categories.editSubTitle', 'Edit Sub-category')
        : isSub
          ? t('admin.inventory.categories.createSub', 'Create Sub-category')
          : t('admin.inventory.categories.createTitle', 'Create Inventory Category');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setLocalError(t('admin.inventory.categories.nameMin', 'Name must be at least 3 characters'));
      return;
    }
    setLocalError(undefined);
    const body: CategoryPayload = {
      name: name.trim(),
      status,
      short_description: shortDescription.trim() || undefined,
    };
    const done = (msg: string) => () => {
      toast.success(msg);
      onDone();
    };
    if (state.mode === 'create') {
      create.mutate(
        { ...body, parent_id: idParam(parentId) },
        {
          onSuccess: done(
            parentId
              ? t('admin.inventory.categories.subCreated', 'Sub-category "{name}" created', { name: body.name })
              : t('admin.inventory.categories.created', 'Category "{name}" created', { name: body.name }),
          ),
        },
      );
    } else if (state.mode === 'edit') {
      update.mutate({ id: state.category.id, body }, { onSuccess: done(t('admin.inventory.categories.updated', 'Category "{name}" updated', { name: body.name })) });
    } else {
      updateSub.mutate(
        { categoryId: state.category.id, index: state.sub.index, body },
        { onSuccess: done(t('admin.inventory.categories.subUpdated', 'Sub-category "{name}" updated', { name: body.name })) },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-primary" />
          {title}
        </DialogTitle>
        <DialogDescription>
          {state.mode === 'edit-sub'
            ? t('admin.inventory.categories.subOf', 'Sub-category of {name}.', { name: state.category.name })
            : t('admin.inventory.categories.formDesc', 'Group catalogue items for filtering and reporting.')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {state.mode === 'create' ? (
          <div className="space-y-1.5">
            <Label htmlFor="cat-parent">{t('admin.inventory.categories.parent', 'Parent Category')}</Label>
            <OptionSelect
              id="cat-parent"
              value={parentId}
              onChange={setParentId}
              options={parentOptions}
              noneLabel={t('admin.inventory.categories.parentNone', 'None — top-level category')}
              disabled={allCategories.isLoading}
            />
            <FieldError message={fieldError(err, 'parent_id')} />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="cat-name">{isSub ? t('admin.inventory.categories.subName', 'Sub-category Name *') : t('admin.inventory.categories.name', 'Category Name *')}</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(localError ?? fieldError(err, 'name')) || undefined}
            required
          />
          <FieldError message={localError ?? fieldError(err, 'name')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-status">{t('admin.inventory.categories.statusRequired', 'Status *')}</Label>
          <OptionSelect id="cat-status" value={status} onChange={(v) => setStatus(v || 'active')} options={statusOptions} />
          <FieldError message={fieldError(err, 'status')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">{t('admin.inventory.categories.colDesc', 'Short Description')}</Label>
          <Input id="cat-desc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          <FieldError message={fieldError(err, 'short_description')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending
            ? t('admin.inventory.common.saving', 'Saving…')
            : state.mode === 'create'
              ? t('common.create', 'Create')
              : t('admin.inventory.common.saveChanges', 'Save Changes')}
        </Button>
      </DialogFooter>
    </form>
  );
}
