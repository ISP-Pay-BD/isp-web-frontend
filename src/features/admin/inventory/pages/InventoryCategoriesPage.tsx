'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const MENU = 'inventory_purchess';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

type FormState =
  | { mode: 'create'; parentId?: string }
  | { mode: 'edit'; category: InventoryCategory }
  | { mode: 'edit-sub'; category: InventoryCategory; sub: InventorySubcategory };

type DeleteState =
  | { kind: 'category'; category: InventoryCategory }
  | { kind: 'sub'; category: InventoryCategory; sub: InventorySubcategory };

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <Badge
      variant="outline"
      className={active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
    >
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function InventoryCategoriesPage() {
  const router = useRouter();
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
  const kpi = (v: number | undefined) => (v === undefined ? '—' : v.toLocaleString());

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const rows = (await fetchAllPages<unknown>(`${INVENTORY_URL}/categories`, { search: table.search || undefined })).map(
        mapCategory,
      );
      downloadCsv(
        `inventory_categories_${todayYmd()}.csv`,
        ['Category', 'Status', 'Short Description', 'Items', 'Sub-categories'],
        rows.map((c) => [c.name, c.status, c.shortDescription, c.itemCount, c.subcategories.map((sc) => sc.name).join('; ')]),
      );
      toast.success(`Exported ${rows.length} categories`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<LegacyColumnDef<InventoryCategory, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
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
        header: 'Short Description',
        size: 260,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-1">{row.original.shortDescription || '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'itemCount',
        header: 'Items',
        size: 110,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-mono tabular-nums font-semibold">
            {row.original.itemCount} items
          </Badge>
        ),
      },
      {
        id: 'subcategories',
        header: 'Sub-categories',
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
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Category Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/inventory/items?category_id=${encodeURIComponent(cat.id)}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubsSnapshot(cat)}>
                  <ListTree className="h-3.5 w-3.5 mr-2" />
                  Sub-categories
                </DropdownMenuItem>
                <Can menu={MENU} action="create">
                  <DropdownMenuItem onClick={() => setForm({ mode: 'create', parentId: cat.id })}>
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add Sub-category
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="update">
                  <DropdownMenuItem onClick={() => setForm({ mode: 'edit', category: cat })}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit Category
                  </DropdownMenuItem>
                </Can>
                <Can menu={MENU} action="delete">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-rose-500 focus:text-rose-500"
                    onClick={() => setDeleting({ kind: 'category', category: cat })}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Category
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        subtitle="Classification groups and sub-categories for catalogue items."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Categories' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Can menu={MENU} action="create">
              <Button size="sm" onClick={() => setForm({ mode: 'create' })} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiTile label="Categories" icon={<Layers className="h-4 w-4 text-primary" />} value={kpi(s?.categoriesCount)} hint="Category groups defined" />
        <KpiTile
          label="Sub-categories"
          icon={<ListTree className="h-4 w-4 text-primary" />}
          value={kpi(s?.subcategoriesCount)}
          hint="Nested classifications"
        />
        <KpiTile
          label="Catalogue Items"
          icon={<Boxes className="h-4 w-4 text-emerald-500" />}
          value={kpi(s?.totalItems)}
          hint="Items across all categories"
          hintClassName="text-emerald-600 dark:text-emerald-400 font-medium"
        />
      </div>

      <ListState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        isEmpty={!table.search && page?.meta.total === 0}
        errorTitle="Failed to load categories"
        emptyTitle="No categories yet"
        emptyDescription="Create a category to start organising catalogue items."
        icon={<FolderTree className="h-5 w-5" />}
        rows={6}
      >
        <DataTable
          columns={columns}
          data={page?.items ?? []}
          getRowId={(r) => r.id}
          searchPlaceholder="Search categories..."
          emptyTitle="No categories match your search"
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
                  {subsCategory.name} — Sub-categories
                </DialogTitle>
                <DialogDescription>
                  {subsCategory.subcategories.length} sub-categories · {subsCategory.itemCount} items in this category
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] space-y-2 overflow-y-auto py-2">
                {subsCategory.subcategories.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    No sub-categories yet.
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
                          {sub.itemCount} items{sub.shortDescription ? ` · ${sub.shortDescription}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Can menu={MENU} action="update">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            aria-label={`Edit ${sub.name}`}
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
                            aria-label={`Delete ${sub.name}`}
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
                  Close
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
                    Add Sub-category
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
        title={deleting?.kind === 'sub' ? 'Delete sub-category?' : 'Delete category?'}
        description={
          deleting?.kind === 'sub'
            ? `"${deleting.sub.name}" will be removed from ${deleting.category.name}. Sub-categories that still have items cannot be deleted.`
            : deleting
              ? `"${deleting.category.name}" will be deleted. Categories that still have sub-categories cannot be deleted.`
              : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          if (target.kind === 'sub') {
            deleteSub.mutate(
              { categoryId: target.category.id, index: target.sub.index },
              { onSuccess: () => toast.success(`Sub-category "${target.sub.name}" deleted`) },
            );
          } else {
            deleteCategory.mutate(target.category.id, {
              onSuccess: () => toast.success(`Category "${target.category.name}" deleted`),
            });
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}

function CategoryForm({ state, onDone }: { state: FormState; onDone: () => void }) {
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
      ? 'Edit Category'
      : state.mode === 'edit-sub'
        ? 'Edit Sub-category'
        : isSub
          ? 'Create Sub-category'
          : 'Create Inventory Category';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setLocalError('Name must be at least 3 characters');
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
        { onSuccess: done(parentId ? `Sub-category "${body.name}" created` : `Category "${body.name}" created`) },
      );
    } else if (state.mode === 'edit') {
      update.mutate({ id: state.category.id, body }, { onSuccess: done(`Category "${body.name}" updated`) });
    } else {
      updateSub.mutate(
        { categoryId: state.category.id, index: state.sub.index, body },
        { onSuccess: done(`Sub-category "${body.name}" updated`) },
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
            ? `Sub-category of ${state.category.name}.`
            : 'Group catalogue items for filtering and reporting.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {state.mode === 'create' ? (
          <div className="space-y-1.5">
            <Label htmlFor="cat-parent">Parent Category</Label>
            <OptionSelect
              id="cat-parent"
              value={parentId}
              onChange={setParentId}
              options={parentOptions}
              noneLabel="None — top-level category"
              disabled={allCategories.isLoading}
            />
            <FieldError message={fieldError(err, 'parent_id')} />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="cat-name">{isSub ? 'Sub-category Name *' : 'Category Name *'}</Label>
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
          <Label htmlFor="cat-status">Status *</Label>
          <OptionSelect id="cat-status" value={status} onChange={(v) => setStatus(v || 'active')} options={STATUS_OPTIONS} />
          <FieldError message={fieldError(err, 'status')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Short Description</Label>
          <Input id="cat-desc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          <FieldError message={fieldError(err, 'short_description')} />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : state.mode === 'create' ? 'Create' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}
