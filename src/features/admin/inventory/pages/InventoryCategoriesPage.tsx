'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useInventory, type InventoryCategory } from '../hooks/use-inventory';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Download,
  Layers,
  FolderTree,
  Boxes,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const categorySearchFilter = (
  row: LegacyRow<InventoryCategory>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const cat = row.original;
  return (
    cat.name.toLowerCase().includes(q) ||
    cat.code.toLowerCase().includes(q)
  );
};

export function InventoryCategoriesPage() {
  const { categories: initialCats, isLoading, isError, refetch } = useInventory();
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const list = categories.length > 0 ? categories : initialCats;

  const totalCategories = list.length;
  const totalItemsMapped = list.reduce((acc, c) => acc + (c.itemCount || 0), 0);
  const avgItemsPerCategory = totalCategories > 0 ? Math.round(totalItemsMapped / totalCategories) : 0;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Please provide category name and code');
      return;
    }

    const newCat: InventoryCategory = {
      id: `cat_${Date.now()}`,
      name,
      code: code.toUpperCase(),
      itemCount: 0,
    };

    setCategories((prev) => [newCat, ...(prev.length > 0 ? prev : initialCats)]);
    toast.success(`Category "${newCat.name}" created successfully.`);
    setModalOpen(false);
    setName('');
    setCode('');
  };

  const handleExportCsv = () => {
    const headers = ['Category Name', 'Category Code', 'Mapped SKU Count'];
    const rows = list.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.code,
      c.itemCount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_categories_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory categories exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<InventoryCategory, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category Group',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <FolderTree className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground block font-mono">Code: {cat.code}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'code',
        header: 'Code Identifier',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground border border-border/80">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'itemCount',
        header: 'Mapped SKU Items',
        size: 180,
        cell: ({ row }) => {
          const count = row.original.itemCount;
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background font-mono tabular-nums font-semibold">
                {count} SKUs
              </Badge>
              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, (count / 25) * 100)}%` }}
                />
              </div>
            </div>
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Category Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Viewing items in ${cat.name}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View Mapped SKUs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Editing ${cat.name}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Category ${cat.name} removed`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return <EmptyState title="Failed to load categories" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        subtitle="Classification taxonomy for optical network terminals, cables, splitters, and switches."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Categories' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Groups</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalCategories}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Category groups defined</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Mapped SKUs</span>
            <Boxes className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalItemsMapped}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Items assigned across groups</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Items / Group</span>
            <Tag className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {avgItemsPerCategory}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">SKUs distribution density</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={categorySearchFilter}
        searchPlaceholder="Search category name or code..."
      />

      {/* Create Category Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddCategory}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                Create Inventory Category
              </DialogTitle>
              <DialogDescription>
                Add a new classification group to organize catalog hardware and passive items.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-code">Category Code *</Label>
                <Input
                  id="cat-code"
                  placeholder="e.g. CAT-FIBER or CAT-SFP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Group Name *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Optical Transceivers & SFP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
