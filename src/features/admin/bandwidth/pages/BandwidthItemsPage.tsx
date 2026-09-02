'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthCatalogItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, ArrowDownToLine, Zap, Layers, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthItemsPage() {
  const { data, isLoading } = useBandwidthData();
  const [items, setItems] = useState<BandwidthCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newCapacity, setNewCapacity] = useState(100);
  const [newPrice, setNewPrice] = useState(30000);
  const [newVat, setNewVat] = useState(5);
  const [newType, setNewType] = useState<'upstream' | 'peering' | 'cache' | 'transit'>('upstream');
  const [newCategory, setNewCategory] = useState('Dedicated Internet (DIA)');

  const initialItems = data?.catalogItems ?? [];
  if (items.length === 0 && initialItems.length > 0) {
    setItems(initialItems);
  }

  const list = items.length > 0 ? items : initialItems;
  const filtered = list.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    it.categoryName.toLowerCase().includes(search.toLowerCase())
  );

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
    toast.success('Bandwidth catalog item created.');
    setModalOpen(false);
    setNewItemName('');
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Catalog item deleted.');
  };

  if (isLoading && items.length === 0) return <PageSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Catalog Items"
        subtitle="Upstream IP transit, BDIX peering, and CDN caching products for procurement"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
          { label: 'Items' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Item
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Catalog Items" value={list.length} icon={Layers} />
        <StatCard
          title="Total Purchased Capacity"
          value={`${data?.summary?.totalPurchasedMbps ?? 2500} Mbps`}
          description="Across all upstream carriers"
          icon={ArrowDownToLine}
        />
        <StatCard
          title="Network Utilization"
          value={`${data?.summary?.utilizationPercent ?? 82}%`}
          description="Peak traffic load"
          icon={Zap}
        />
        <StatCard
          title="Monthly Upstream Cost"
          value={formatBdtWithSymbol(data?.summary?.monthlyCostBdt ?? 605000)}
          description="Bandwidth buy expense"
          icon={Layers}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Input
            placeholder="Search items by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <span className="text-xs text-muted-foreground">Showing {filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No catalog items"
            description="Add upstream bandwidth packages to start recording purchase bills."
            actionLabel="Add Item"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item Name & Spec</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Unit Price (BDT)</TableHead>
                  <TableHead>% VAT</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{item.name}</div>
                      {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium">{item.categoryName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] font-mono">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {item.capacityMbps} Mbps
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold">
                      {formatBdtWithSymbol(item.unitPriceBdt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.vatPercent}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bandwidth Catalog Item</DialogTitle>
            <DialogDescription>Define an upstream transit, peering, or cache product.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItem} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="e.g. 500 Mbps DIA Full Duplex"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Capacity (Mbps) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dedicated Internet (DIA)">Dedicated Internet (DIA)</SelectItem>
                    <SelectItem value="Domestic Peering (BDIX)">Domestic Peering (BDIX)</SelectItem>
                    <SelectItem value="Content Cache (Google / FB / CDN)">Content Cache</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="price">Unit Price (BDT) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vat">% VAT</Label>
                <Input
                  id="vat"
                  type="number"
                  value={newVat}
                  onChange={(e) => setNewVat(Number(e.target.value))}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
