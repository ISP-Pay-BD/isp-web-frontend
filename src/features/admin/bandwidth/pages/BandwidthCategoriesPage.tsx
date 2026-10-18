'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { Plus, Download, Tags, Pencil, Trash2, CornerDownRight } from 'lucide-react';
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
import {
  useBandwidthCategories,
  useCreateBandwidthCategory,
  useDeleteBandwidthCategory,
  useUpdateBandwidthCategory,
  type CategoryInput,
} from '../hooks/useBandwidthCatalog';
import type { ActiveStatus, BandwidthCategory } from '../types';
import { FieldError, OptionSelect } from '../components/OptionSelect';
import { downloadCsv, fieldErrorsOf, isoDay } from '../utils';

/** Category and sub-category rows flattened for one table (sub-categories follow their parent). */
interface CategoryRow {
  key: string;
  kind: 'Category' | 'Sub-category';
  categoryId: number;
  subIndex: number | null;
  name: string;
  parentName: string;
  status: ActiveStatus;
  shortDescription: string;
  itemCount: number;
  subCount: number;
}

function flatten(categories: BandwidthCategory[]): CategoryRow[] {
  return categories.flatMap((c) => [
    {
      key: `c-${c.id}`,
      kind: 'Category' as const,
      categoryId: c.id,
      subIndex: null,
      name: c.name,
      parentName: '',
      status: c.status,
      shortDescription: c.shortDescription,
      itemCount: c.itemCount + c.subcategories.reduce((s, x) => s + x.itemCount, 0),
      subCount: c.subcategories.length,
    },
    ...c.subcategories.map((s) => ({
      key: `s-${c.id}-${s.index}`,
      kind: 'Sub-category' as const,
      categoryId: c.id,
      subIndex: s.index,
      name: s.name,
      parentName: c.name,
      status: s.status,
      shortDescription: s.shortDescription,
      itemCount: s.itemCount,
      subCount: 0,
    })),
  ]);
}

const categorySearchFilter = (row: LegacyRow<CategoryRow>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const c = row.original;
  return [c.name, c.parentName, c.shortDescription].some((v) => v.toLowerCase().includes(q));
};

type DialogState = { mode: 'create' } | { mode: 'edit'; row: CategoryRow } | null;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function BandwidthCategoriesPage() {
  const { data, isLoading, isError, refetch } = useBandwidthCategories();
  const deleteCategory = useDeleteBandwidthCategory();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);

  const categories = useMemo(() => data ?? [], [data]);
  const rows = useMemo(() => flatten(categories), [categories]);
  const subTotal = rows.filter((r) => r.kind === 'Sub-category').length;
  const itemTotal = categories.reduce((s, c) => s + c.itemCount + c.subcategories.reduce((a, x) => a + x.itemCount, 0), 0);

  const handleExportCsv = () => {
    downloadCsv(
      `bandwidth_categories_${isoDay()}.csv`,
      ['Type', 'Name', 'Parent', 'Status', 'Description', 'Items'],
      rows.map((r) => [r.kind, r.name, r.parentName, r.status, r.shortDescription, r.itemCount]),
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteCategory.mutate(
      { id: toDelete.categoryId, subIndex: toDelete.subIndex },
      { onSuccess: () => toast.success(`${toDelete.kind} deleted`) },
    );
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<CategoryRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
        enableHiding: false,
        size: 280,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            {row.original.kind === 'Category' ? (
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                <Tags className="h-4 w-4" />
              </div>
            ) : (
              <CornerDownRight className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.name}</div>
              {row.original.parentName ? (
                <div className="text-[10px] text-muted-foreground">under {row.original.parentName}</div>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'kind',
        header: 'Type',
        size: 120,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.kind}</span>,
      },
      {
        accessorKey: 'shortDescription',
        header: 'Description',
        size: 240,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.shortDescription || '—'}</span>,
      },
      {
        accessorKey: 'itemCount',
        header: 'Items',
        size: 110,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.itemCount} items
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status === 'active' ? 'active' : 'suspended'} label={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label="Edit" onClick={() => setDialog({ mode: 'edit', row: row.original })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete"
              onClick={() => setToDelete(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={4} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load categories" description="Could not fetch bandwidth categories." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Item Categories"
        subtitle="Category and sub-category groups of the bandwidth item catalogue"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Categories' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={rows.length === 0} className="text-xs border-border/80 hover:bg-accent">
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Categories
            </Button>
            <Button size="sm" onClick={() => setDialog({ mode: 'create' })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{categories.length}</span>{' '}
          <span className="text-muted-foreground">categories</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{subTotal}</span>{' '}
          <span className="text-muted-foreground">sub-categories</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{itemTotal}</span>{' '}
          <span className="text-muted-foreground">catalogue items</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.key}
        searchKey="name"
        searchPlaceholder="Search categories by name or description..."
        searchFilterFn={categorySearchFilter}
        facetFilters={[
          { columnId: 'kind', title: 'Type' },
          { columnId: 'status', title: 'Status' },
        ]}
        emptyTitle="No categories found"
        emptyDescription="Create a bandwidth category to group catalogue items."
      />

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          {dialog ? (
            <CategoryForm
              key={dialog.mode === 'edit' ? dialog.row.key : 'new'}
              editing={dialog.mode === 'edit' ? dialog.row : null}
              categories={categories}
              onDone={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.kind.toLowerCase() ?? 'category'} "${toDelete?.name ?? ''}"?`}
        description={
          toDelete?.kind === 'Category'
            ? 'A category that still has sub-categories cannot be deleted.'
            : 'A sub-category that still has items cannot be deleted.'
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function CategoryForm({ editing, categories, onDone }: { editing: CategoryRow | null; categories: BandwidthCategory[]; onDone: () => void }) {
  const create = useCreateBandwidthCategory();
  const update = useUpdateBandwidthCategory();
  const [form, setForm] = useState<CategoryInput>({
    name: editing?.name ?? '',
    status: editing?.status ?? 'active',
    shortDescription: editing?.shortDescription ?? '',
  });
  const [parentId, setParentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const callbacks = {
      onSuccess: () => {
        toast.success(editing ? `${editing.kind} updated` : parentId ? 'Sub-category added' : 'Category added');
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (editing) update.mutate({ ...form, id: editing.categoryId, subIndex: editing.subIndex }, callbacks);
    else create.mutate({ ...form, parentId: parentId ? Number(parentId) : null }, callbacks);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Tags className="h-4 w-4 text-primary" /> {editing ? `Edit ${editing.kind.toLowerCase()}` : 'Add bandwidth category'}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {editing?.parentName ? `Sub-category under ${editing.parentName}.` : 'Pick a parent to create a sub-category instead.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-3.5 pt-2">
        {!editing ? (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Parent category</Label>
            <OptionSelect
              value={parentId}
              onChange={setParentId}
              emptyLabel="None — top-level category"
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
            <FieldError message={errors.parent_id} />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="cat-name" className="text-xs font-semibold">Name *</Label>
          <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-xs h-9" required minLength={3} aria-invalid={Boolean(errors.name) || undefined} />
          <FieldError message={errors.name} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Status *</Label>
          <OptionSelect value={form.status} onChange={(v) => setForm({ ...form, status: v === 'inactive' ? 'inactive' : 'active' })} options={STATUS_OPTIONS} />
          <FieldError message={errors.status} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-desc" className="text-xs font-semibold">Short description</Label>
          <Textarea id="cat-desc" rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="text-xs" />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">Cancel</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </>
  );
}
