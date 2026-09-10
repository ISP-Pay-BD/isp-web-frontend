'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthCatalogItem } from '@/data/admin/bandwidth.data';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Download, Zap, Layers, Trash2, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const itemSearchFilter = (
  row: LegacyRow<BandwidthCatalogItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const item = row.original;
  return (
    item.name.toLowerCase().includes(q) ||
    item.categoryName.toLowerCase().includes(q) ||
    (item.description?.toLowerCase().includes(q) ?? false)
  );
};

export function BandwidthItemsPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [items, setItems] = useState<BandwidthCatalogItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newCapacity, setNewCapacity] = useState(100);
  const [newPrice, setNewPrice] = useState(32000);
  const [newVat, setNewVat] = useState(5);
  const [newType, setNewType] = useState<'upstream' | 'peering' | 'cache' | 'transit'>('upstream');
  const [newCategory, setNewCategory] = useState('Dedicated Internet (DIA)');

  const initialItems = data?.catalogItems ?? [];
  if (items.length === 0 && initialItems.length > 0) {
    setItems(initialItems);
  }

  const list = items.length > 0 ? items : initialItems;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: BandwidthCatalogItem = {
      id: `bwi_${Date.now()}`,
      name: newItemName,
      categoryId: 'bwc_1',
      categoryName: newCategory,
      unitPriceBdt: newPrice,
      vatPercent: newVat,
      capacityMbps: newCapacity,
      type: newType,
    };
    setItems((prev) => [newItem, ...prev]);
    toast.success('Bandwidth catalog SKU created successfully.');
    setModalOpen(false);
    setNewItemName('');
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Catalog item removed from procurement list.');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Item Name', 'Category', 'Type', 'Capacity (Mbps)', 'Price (BDT)', 'VAT %'];
    const rows = list.map((item) => [
      item.id,
      item.name,
      item.categoryName,
      item.type,
      item.capacityMbps,
      item.unitPriceBdt,
      `${item.vatPercent}%`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bandwidth catalog exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthCatalogItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Spec & Description',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.name}</div>
              {row.original.description && (
                <div className="text-[11px] text-muted-foreground mt-0.5">{row.original.description}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category Group',
        size: 180,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-semibold bg-secondary/80 border-border/60">
            {row.original.categoryName}
          </Badge>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Traffic Type',
        size: 120,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-[10px] font-mono font-semibold',
              row.original.type === 'upstream' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
              row.original.type === 'peering' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
              row.original.type === 'cache' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            )}
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: 'capacityMbps',
        header: 'Trunk Capacity',
        size: 130,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-primary">
            <Zap className="h-3 w-3 text-amber-500" />
            {row.original.capacityMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'unitPriceBdt',
        header: 'Contract Price (BDT)',
        size: 150,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.unitPriceBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'vatPercent',
        header: 'Govt VAT',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.vatPercent}%</span>
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
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && items.length === 0) return <PageSkeleton variant="table" rows={6} />;
  if (isError && items.length === 0) {
    return (
      <EmptyState
        title="Failed to load catalog items"
        description="Could not fetch bandwidth catalog items."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Catalog Items"
        subtitle="Upstream IP transit products, BDIX domestic peering, and CDN caching SKUs for procurement"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Catalog Items' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Catalog
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Catalog SKU
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.length}</span>{' '}
          <span className="text-muted-foreground">procurement SKUs</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{`${data?.summary?.totalPurchasedMbps ?? 2500} Mbps`}</span>{' '}
          <span className="text-muted-foreground">total purchased trunk</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{`${data?.summary?.utilizationPercent ?? 82}%`}</span>{' '}
          <span className="text-muted-foreground">network utilization</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(data?.summary?.monthlyCostBdt ?? 605000)}
          </span>{' '}
          <span className="text-muted-foreground">monthly upstream commitment</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search product by name, category, or spec..."
        searchFilterFn={itemSearchFilter}
        facetFilters={[
          { columnId: 'categoryName', title: 'Category' },
          { columnId: 'type', title: 'Traffic Type' },
        ]}
        emptyTitle="No catalog items"
        emptyDescription="Add upstream bandwidth packages to start recording purchase bills."
      />

      {/* Add Item Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Add Bandwidth Catalog Item
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define a new upstream IP transit, peering, or cache product SKU.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItem} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Product Name *</Label>
              <Input
                placeholder="e.g. 500 Mbps DIA Full Duplex Redundant"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Capacity (Mbps) *</Label>
                <Input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Group *</Label>
                <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dedicated Internet (DIA)">Dedicated Internet (DIA)</SelectItem>
                    <SelectItem value="Domestic Peering (BDIX)">Domestic Peering (BDIX)</SelectItem>
                    <SelectItem value="International Internet Bandwidth (IIG)">International IIG</SelectItem>
                    <SelectItem value="Content Cache (Google / FB / CDN)">Content Cache</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Unit Price (BDT) *</Label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="text-xs h-9 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">% VAT</Label>
                <Input
                  type="number"
                  value={newVat}
                  onChange={(e) => setNewVat(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Traffic Type</Label>
              <Select value={newType} onValueChange={(v) => v && setNewType(v as typeof newType)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upstream">Upstream DIA</SelectItem>
                  <SelectItem value="peering">BDIX Peering</SelectItem>
                  <SelectItem value="cache">Content Cache (CDN)</SelectItem>
                  <SelectItem value="transit">L2 VLAN Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Create SKU
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
