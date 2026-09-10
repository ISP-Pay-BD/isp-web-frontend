'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useInventory, type InventoryItem } from '../hooks/use-inventory';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import {
  Plus,
  Download,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Package,
  Layers,
  Edit,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const itemSearchFilter = (
  row: LegacyRow<InventoryItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const item = row.original;
  return (
    item.name.toLowerCase().includes(q) ||
    item.code.toLowerCase().includes(q) ||
    item.categoryName.toLowerCase().includes(q) ||
    item.unitName.toLowerCase().includes(q)
  );
};

export function InventoryItemsPage() {
  const { items: initialItems, isLoading, isError, refetch } = useInventory();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('ONU & CPE');
  const [unitName, setUnitName] = useState('Pcs');
  const [unitPriceBdt, setUnitPriceBdt] = useState('1450');
  const [minStockAlert, setMinStockAlert] = useState('10');
  const [status, setStatus] = useState('active');

  const list = items.length > 0 ? items : initialItems;

  const totalSkus = list.length;
  const activeCount = list.filter((i) => i.status === 'active').length;
  const lowStockCount = list.filter((i) => i.minStockAlert >= 15).length;
  const avgPrice = list.length > 0
    ? Math.round(list.reduce((acc, i) => acc + (i.unitPriceBdt || 0), 0) / list.length)
    : 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Please provide item name and SKU code');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv_sku_${Date.now()}`,
      code: code.toUpperCase(),
      name,
      categoryName,
      unitName,
      unitPriceBdt: Number(unitPriceBdt) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      status,
    };

    setItems((prev) => [newItem, ...(prev.length > 0 ? prev : initialItems)]);
    toast.success(`SKU "${newItem.code} — ${newItem.name}" added to inventory catalog.`);
    setModalOpen(false);

    // Reset Form
    setCode('');
    setName('');
    setUnitPriceBdt('1450');
    setMinStockAlert('10');
  };

  const handleExportCsv = () => {
    const headers = ['SKU Code', 'Item Name', 'Category', 'Unit', 'Unit Price (BDT)', 'Min Stock Alert', 'Status'];
    const rows = list.map((i) => [
      i.code,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.categoryName}"`,
      i.unitName,
      i.unitPriceBdt,
      i.minStockAlert,
      i.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_items_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory SKU catalog exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'SKU Code',
        enableHiding: false,
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {row.original.code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Item Specification',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground text-sm line-clamp-1">{item.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Layers className="h-3 w-3" />
                  {item.categoryName}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background/50 font-normal">
            {row.original.categoryName}
          </Badge>
        ),
      },
      {
        accessorKey: 'unitName',
        header: 'Unit',
        size: 100,
        cell: ({ row }) => (
          <span className="text-sm font-mono text-muted-foreground">{row.original.unitName}</span>
        ),
      },
      {
        accessorKey: 'unitPriceBdt',
        header: 'Unit Price',
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.unitPriceBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'minStockAlert',
        header: 'Min Alert',
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500/80" />
            <span className="tabular-nums font-medium">{row.original.minStockAlert} {row.original.unitName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const active = row.original.status === 'active';
          return (
            <Badge
              variant="outline"
              className={active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
            >
              {active ? 'Active' : 'Inactive'}
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
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>SKU Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Editing ${item.code}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Item Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Stock adjustment for ${item.name}`)}>
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                  Adjust Stock Count
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`SKU ${item.code} deprecated`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Deactivate Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load items" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Items Catalog"
        subtitle="Catalog of network hardware, optical fiber accessories, CPE modems, and power equipment."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Items Catalog' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add New SKU
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total SKUs</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalSkus}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cataloged items</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Deployed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {activeCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready for deployment</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Min Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {lowStockCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">Threshold &gt; 15 units</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg SKU Value</span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(avgPrice)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Per unit catalog baseline</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={itemSearchFilter}
        searchPlaceholder="Search by SKU code, name, category..."
      />

      {/* Add SKU Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddItem}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Add New Inventory SKU
              </DialogTitle>
              <DialogDescription>
                Register a new hardware item, passive fiber accessory, or CPE device into the central catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sku-code">SKU Code *</Label>
                  <Input
                    id="sku-code"
                    placeholder="e.g. ONU-GPON-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sku-cat">Category *</Label>
                  <Select value={categoryName} onValueChange={(val) => { if (val) setCategoryName(val); }}>
                    <SelectTrigger id="sku-cat">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONU & CPE">ONU & CPE</SelectItem>
                      <SelectItem value="Fiber Cable">Fiber Cable</SelectItem>
                      <SelectItem value="Passive Accessories">Passive Accessories</SelectItem>
                      <SelectItem value="Routing & Switching">Routing & Switching</SelectItem>
                      <SelectItem value="Power & Backup">Power & Backup</SelectItem>
                      <SelectItem value="Tools & Splicing">Tools & Splicing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku-name">Item Name / Model Specification *</Label>
                <Input
                  id="sku-name"
                  placeholder="e.g. Huawei HG8546M 1GE+3FE+WiFi GPON ONU"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sku-unit">Unit</Label>
                  <Select value={unitName} onValueChange={(val) => { if (val) setUnitName(val); }}>
                    <SelectTrigger id="sku-unit">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pcs">Pcs</SelectItem>
                      <SelectItem value="Meter">Meter</SelectItem>
                      <SelectItem value="Drum (1000m)">Drum (1000m)</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Roll">Roll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sku-price">Unit Price (BDT)</Label>
                  <Input
                    id="sku-price"
                    type="number"
                    value={unitPriceBdt}
                    onChange={(e) => setUnitPriceBdt(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sku-min">Min Alert Qty</Label>
                  <Input
                    id="sku-min"
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku-status">Initial Status</Label>
                <Select value={status} onValueChange={(val) => { if (val) setStatus(val); }}>
                  <SelectTrigger id="sku-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Deployable)</SelectItem>
                    <SelectItem value="inactive">Inactive / In Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to Catalog</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
