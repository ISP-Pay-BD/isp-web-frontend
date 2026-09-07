'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthCategoryItem } from '@/data/admin/bandwidth.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const categorySearchFilter = (
  row: LegacyRow<BandwidthCategoryItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const cat = row.original;
  return (
    cat.name.toLowerCase().includes(q) ||
    cat.area.toLowerCase().includes(q)
  );
};

export function BandwidthCategoriesPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [categories, setCategories] = useState<BandwidthCategoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(300);
  const [area, setArea] = useState('All Zones');

  const initial = data?.categories ?? [];
  if (categories.length === 0 && initial.length > 0) {
    setCategories(initial);
  }

  const list = categories.length > 0 ? categories : initial;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newCat: BandwidthCategoryItem = {
      id: `bwc_${Date.now()}`,
      name,
      priceBdt: price,
      area,
      subcategoriesCount: 0,
      itemsCount: 0,
    };
    setCategories((prev) => [newCat, ...prev]);
    toast.success('Category created.');
    setModalOpen(false);
    setName('');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthCategoryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category Name',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-semibold text-foreground inline-flex items-center gap-2">
            <Tags className="h-4 w-4 text-primary" />
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'area',
        header: 'Service Area',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.area}</span>
        ),
      },
      {
        accessorKey: 'priceBdt',
        header: 'Base Rate / Mbps',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {formatBdtWithSymbol(row.original.priceBdt)} / Mbps
          </span>
        ),
      },
      {
        accessorKey: 'itemsCount',
        header: 'Items Count',
        cell: ({ row }) => (
          <span className="text-xs font-mono">{row.original.itemsCount} catalog products</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCategories((prev) => prev.filter((c) => c.id !== row.original.id));
                toast.success('Category removed.');
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

    if (isLoading && categories.length === 0) return <PageSkeleton variant="table" rows={4} />;
  if (isError && categories.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load categories"
          description="Could not fetch bandwidth categories."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Item Categories"
        subtitle="Upstream category groups, pricing guidelines, and coverage areas"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
          { label: 'Categories' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search categories by name or area..."
        searchFilterFn={categorySearchFilter}
        facetFilters={[{ columnId: 'area', title: 'Area' }]}
        emptyTitle="No categories"
        emptyDescription="Create a bandwidth category to group catalog items."
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bandwidth Category</DialogTitle>
            <DialogDescription>Group products into DIA, Peering, Submarine, or Cache categories.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName">Category Name *</Label>
              <Input id="catName" placeholder="e.g. Dedicated Internet (DIA)" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="catPrice">Base Rate / Mbps (BDT)</Label>
                <Input id="catPrice" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="catArea">Coverage Area</Label>
                <Input id="catArea" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
