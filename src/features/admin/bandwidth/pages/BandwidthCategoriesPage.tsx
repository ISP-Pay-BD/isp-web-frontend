'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthCategoryItem } from '@/data/admin/bandwidth.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
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
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Download, Tags, Layers, Trash2, MapPin } from 'lucide-react';
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
  const [price, setPrice] = useState(350);
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
      subcategoriesCount: 1,
      itemsCount: 0,
    };
    setCategories((prev) => [newCat, ...prev]);
    toast.success('Bandwidth category created.');
    setModalOpen(false);
    setName('');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Category Name', 'Coverage Area', 'Base Rate / Mbps (BDT)', 'Active Products'];
    const rows = list.map((c) => [
      c.id,
      c.name,
      c.area,
      c.priceBdt,
      c.itemsCount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_categories_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bandwidth categories exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthCategoryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category Classification',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'area',
        header: 'Coverage Territory',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{row.original.area}</span>
          </div>
        ),
      },
      {
        accessorKey: 'priceBdt',
        header: 'Benchmark Base Rate',
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(row.original.priceBdt)} / Mbps
          </span>
        ),
      },
      {
        accessorKey: 'itemsCount',
        header: 'Catalog Products',
        size: 150,
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.itemsCount} SKUs Linked
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setCategories((prev) => prev.filter((c) => c.id !== row.original.id));
                toast.success('Category classification removed.');
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
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
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Item Categories"
        subtitle="Upstream category groups, benchmark rate rules, and coverage area definitions"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Categories' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Categories
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.length}</span>{' '}
          <span className="text-muted-foreground">category classifications</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{list.reduce((s, c) => s + c.itemsCount, 0)}</span>{' '}
          <span className="text-muted-foreground">active catalog SKUs mapped</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            ৳{list.length ? Math.round(list.reduce((s, c) => s + c.priceBdt, 0) / list.length) : 0} / Mbps
          </span>{' '}
          <span className="text-muted-foreground">avg benchmark base rate</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search categories by name or territory..."
        searchFilterFn={categorySearchFilter}
        facetFilters={[{ columnId: 'area', title: 'Coverage Territory' }]}
        emptyTitle="No categories found"
        emptyDescription="Create a bandwidth category to group catalog items."
      />

      {/* Add Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Tags className="h-4 w-4 text-primary" /> Add Bandwidth Category
            </DialogTitle>
            <DialogDescription className="text-xs">
              Group products into DIA, Peering, Submarine, or Content Cache categories.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Name *</Label>
              <Input
                placeholder="e.g. Submarine Cable (SEA-ME-WE-5)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Base Rate / Mbps (BDT)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Coverage Territory</Label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Save Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
