'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthCategoryItem } from '@/data/admin/bandwidth.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthCategoriesPage() {
  const { data, isLoading } = useBandwidthData();
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

  if (isLoading && categories.length === 0) return <PageSkeleton rows={4} />;

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

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Service Area</TableHead>
              <TableHead>Base Rate / Mbps</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((cat, idx) => (
              <TableRow key={cat.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-semibold text-foreground flex items-center gap-2">
                  <Tags className="h-4 w-4 text-primary" />
                  {cat.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{cat.area}</TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  {formatBdtWithSymbol(cat.priceBdt)} / Mbps
                </TableCell>
                <TableCell className="text-xs font-mono">{cat.itemsCount} catalog products</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                      toast.success('Category removed.');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
