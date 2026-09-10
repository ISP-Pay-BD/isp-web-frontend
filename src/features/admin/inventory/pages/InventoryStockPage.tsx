'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useInventory, type InventoryStock } from '../hooks/use-inventory';
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
  Warehouse,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  Boxes,
  MapPin,
  MoreHorizontal,
  ArrowRightLeft,
  SlidersHorizontal,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const stockSearchFilter = (
  row: LegacyRow<InventoryStock>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const s = row.original;
  return (
    s.itemName.toLowerCase().includes(q) ||
    s.itemCode.toLowerCase().includes(q) ||
    s.locationName.toLowerCase().includes(q) ||
    s.categoryName.toLowerCase().includes(q)
  );
};

export function InventoryStockPage() {
  const { stock: initialStock, isLoading, isError, refetch } = useInventory();
  const [stockList, setStockList] = useState<InventoryStock[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState('Huawei GPON ONU HG8546M');
  const [locationName, setLocationName] = useState('Central NOC Warehouse (Dhaka)');
  const [quantity, setQuantity] = useState('25');
  const [unitPrice, setUnitPrice] = useState('1450');

  const list = stockList.length > 0 ? stockList : initialStock;

  const totalValuation = list.reduce((acc, s) => acc + (s.totalValueBdt || 0), 0);
  const totalPhysicalUnits = list.reduce((acc, s) => acc + (s.quantity || 0), 0);
  const inStockCount = list.filter((s) => s.status === 'in_stock').length;
  const lowStockCount = list.filter((s) => s.status === 'low_stock' || s.status === 'out_of_stock').length;

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity) || 0;
    const priceNum = Number(unitPrice) || 1000;

    const newStockRow: InventoryStock = {
      id: `stock_${Date.now()}`,
      itemName: selectedItemName,
      itemCode: selectedItemName.includes('Huawei') ? 'ONU-HW-01' : 'SKU-NEW-01',
      categoryName: 'Hardware & Devices',
      locationName,
      quantity: qtyNum,
      unitName: 'Pcs',
      totalValueBdt: qtyNum * priceNum,
      status: qtyNum > 10 ? 'in_stock' : qtyNum > 0 ? 'low_stock' : 'out_of_stock',
    };

    setStockList((prev) => [newStockRow, ...(prev.length > 0 ? prev : initialStock)]);
    toast.success(`Stock of ${qtyNum} units logged for "${selectedItemName}" at ${locationName}.`);
    setModalOpen(false);
    setQuantity('25');
  };

  const handleExportCsv = () => {
    const headers = ['Item SKU', 'Item Name', 'Warehouse Location', 'Quantity', 'Unit', 'Total Valuation (BDT)', 'Health Status'];
    const rows = list.map((s) => [
      s.itemCode,
      `"${s.itemName.replace(/"/g, '""')}"`,
      `"${s.locationName}"`,
      s.quantity,
      s.unitName,
      s.totalValueBdt,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_stock_valuation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Stock valuation & on-hand inventory exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<InventoryStock, unknown>[]>(
    () => [
      {
        accessorKey: 'itemName',
        header: 'Stock Item & SKU',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card/80 border border-border/60 text-primary shadow-xs">
                <Boxes className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{s.itemName}</span>
                <span className="font-mono text-xs text-primary font-medium">{s.itemCode}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'locationName',
        header: 'Store Location',
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{row.original.locationName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'On-Hand Qty',
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base tabular-nums text-foreground">
              {row.original.quantity}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.unitName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'totalValueBdt',
        header: 'Total Valuation',
        size: 150,
        cell: ({ row }) => (
          <span className="font-semibold text-sm tabular-nums text-foreground">
            {formatBdtWithSymbol(row.original.totalValueBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Stock Health',
        size: 130,
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === 'in_stock') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                In Stock
              </Badge>
            );
          }
          if (st === 'low_stock') {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                Low Stock
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">
              Out of Stock
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Stock Operations</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Transfer initiated for ${s.itemName}`)}>
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                  Transfer to POP Store
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Stock adjustment opened for ${s.itemName}`)}>
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                  Adjust Quantity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.success(`Audit reconciliation logged for ${s.itemCode}`)}>
                  <FileCheck className="h-3.5 w-3.5 mr-2" />
                  Record Stock Audit
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
    return <EmptyState title="Failed to load stock" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels & Warehouse Valuation"
        subtitle="Live physical on-hand inventory counts, location distribution, and reserve thresholds."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Stock Levels' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Stock CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Stock Inflow / Inward
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Valuation</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalValuation)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Physical warehouse assets</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Physical Units</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalPhysicalUnits}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Items across all locations</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">In Stock Lines</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {inStockCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Optimal stock level</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Low / Out of Stock</span>
            <AlertOctagon className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {lowStockCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">Requires re-order</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="itemName"
        searchFilterFn={stockSearchFilter}
        searchPlaceholder="Search by item name, SKU, or location..."
      />

      {/* Stock Inflow Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAdjustStock}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-primary" />
                Record Stock Inflow / Adjustment
              </DialogTitle>
              <DialogDescription>
                Receive new purchase batch or adjust inventory levels at a specific warehouse location.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="stock-item">Item Specification *</Label>
                <Select value={selectedItemName} onValueChange={(val) => { if (val) setSelectedItemName(val); }}>
                  <SelectTrigger id="stock-item">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Huawei GPON ONU HG8546M">Huawei GPON ONU HG8546M</SelectItem>
                    <SelectItem value="ZTE F660 V8.0 GPON Terminal">ZTE F660 V8.0 GPON Terminal</SelectItem>
                    <SelectItem value="2-Core FTTH Drop Cable Drum">2-Core FTTH Drop Cable Drum</SelectItem>
                    <SelectItem value="SC/APC Fast Optical Connector">SC/APC Fast Optical Connector</SelectItem>
                    <SelectItem value="1x8 PLC Optical Fiber Splitter">1x8 PLC Optical Fiber Splitter</SelectItem>
                    <SelectItem value="Mikrotik CCR2004-16G-2S+ Core Router">Mikrotik CCR2004-16G-2S+ Core Router</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock-loc">Target Warehouse / Store *</Label>
                <Select value={locationName} onValueChange={(val) => { if (val) setLocationName(val); }}>
                  <SelectTrigger id="stock-loc">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central NOC Warehouse (Dhaka)">Central NOC Warehouse (Dhaka)</SelectItem>
                    <SelectItem value="Mirpur POP Store">Mirpur POP Store</SelectItem>
                    <SelectItem value="Dhanmondi Sub-store">Dhanmondi Sub-store</SelectItem>
                    <SelectItem value="Uttara Sector 7 Depot">Uttara Sector 7 Depot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stock-qty">Quantity to Inward *</Label>
                  <Input
                    id="stock-qty"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock-price">Cost per Unit (BDT)</Label>
                  <Input
                    id="stock-price"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Stock Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
