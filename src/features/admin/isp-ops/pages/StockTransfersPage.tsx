'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
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
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import {
  Plus,
  Download,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Boxes,
  Truck,
  MoreHorizontal,
  FileText,
  Check,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type Row = IspOpsData['stockTransfers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.item).toLowerCase().includes(q) ||
    String(r.fromLocation).toLowerCase().includes(q) ||
    String(r.toLocation).toLowerCase().includes(q) ||
    String(r.qty).toLowerCase().includes(q)
  );
};

export function StockTransfersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [transfers, setTransfers] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [item, setItem] = useState('Huawei GPON ONU HG8546M');
  const [fromLocation, setFromLocation] = useState('Central NOC Warehouse (Dhaka)');
  const [toLocation, setToLocation] = useState('Mirpur POP Store');
  const [qty, setQty] = useState('20');
  const [notes, setNotes] = useState('');

  const initialRows = data?.stockTransfers ?? [];
  const rows = transfers.length > 0 ? transfers : initialRows;

  const totalTransfers = rows.length;
  const receivedCount = rows.filter((r) => r.status === 'received').length;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;
  const totalQtyMoved = rows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation === toLocation) {
      toast.error('Source and destination warehouse cannot be identical');
      return;
    }

    const newTransfer: Row = {
      id: `tr_${Date.now()}`,
      item,
      fromLocation,
      toLocation,
      qty: Number(qty) || 1,
      at: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setTransfers((prev) => [newTransfer, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`Transfer dispatch logged: ${qty} units of "${item}" to ${toLocation}.`);
    setModalOpen(false);
    setQty('20');
    setNotes('');
  };

  const handleExportCsv = () => {
    const headers = ['Item Specification', 'Source Location', 'Destination Location', 'Quantity', 'Dispatch Date', 'Status'];
    const csvRows = rows.map((r) => [
      `"${r.item}"`,
      `"${r.fromLocation}"`,
      `"${r.toLocation}"`,
      r.qty,
      r.at,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_transfers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Stock transfer manifest exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'item',
        header: 'Stock Item Specification',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground text-sm line-clamp-1">{String(row.original.item)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'fromLocation',
        header: 'Transfer Route (Origin → Destination)',
        size: 320,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground px-2 py-1 rounded bg-muted/80 border border-border/60">
                {String(r.fromLocation)}
              </span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                {String(r.toLocation)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'qty',
        header: 'Quantity',
        size: 110,
        cell: ({ row }) => (
          <span className="font-bold text-sm font-mono tabular-nums text-foreground">
            {String(row.original.qty)} units
          </span>
        ),
      },
      {
        accessorKey: 'at',
        header: 'Transfer Date',
        size: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.original.at)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const st = String(row.original.status);
          if (st === 'received') {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Received
              </Badge>
            );
          }
          if (st === 'pending') {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                In Transit / Pending
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {st}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Transfer Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Transfer ${r.id} marked as received`)}>
                  <Check className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Acknowledge Receipt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Printing chalan for ${r.item}`)}>
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Print Transfer Chalan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Transfer for ${r.item} cancelled`)}
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Cancel Transfer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load transfers" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Transfers & Movement"
        subtitle="Manage inter-warehouse dispatches, POP replenishment, and inventory transit manifests."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Inventory', href: '/admin/inventory/items' },
          { label: 'Stock Transfers' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Manifest
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Transfer Request
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Dispatches</span>
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalTransfers}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Movements logged</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Received</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {receivedCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Delivered & verified</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">In Transit / Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {pendingCount}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">Awaiting receipt confirmation</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Units Moved</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalQtyMoved}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Units transferred</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="item"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by item, source, or target location..."
      />

      {/* New Transfer Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateTransfer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Dispatch Stock Transfer
              </DialogTitle>
              <DialogDescription>
                Transfer inventory units between central depot and regional POP sub-stores.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="tr-item">Item Specification *</Label>
                <Select value={item} onValueChange={(val) => { if (val) setItem(val); }}>
                  <SelectTrigger id="tr-item">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Huawei GPON ONU HG8546M">Huawei GPON ONU HG8546M</SelectItem>
                    <SelectItem value="ZTE F660 V8.0 GPON Terminal">ZTE F660 V8.0 GPON Terminal</SelectItem>
                    <SelectItem value="2-Core FTTH Drop Cable Drum">2-Core FTTH Drop Cable Drum</SelectItem>
                    <SelectItem value="SC/APC Fast Optical Connector (Pack 100)">SC/APC Fast Optical Connector (Pack 100)</SelectItem>
                    <SelectItem value="Mikrotik RB3011UiAS-RM Router">Mikrotik RB3011UiAS-RM Router</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tr-from">Source Warehouse *</Label>
                  <Select value={fromLocation} onValueChange={(val) => { if (val) setFromLocation(val); }}>
                    <SelectTrigger id="tr-from">
                      <SelectValue placeholder="Origin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central NOC Warehouse (Dhaka)">Central NOC Warehouse</SelectItem>
                      <SelectItem value="Mirpur POP Store">Mirpur POP Store</SelectItem>
                      <SelectItem value="Dhanmondi Sub-store">Dhanmondi Sub-store</SelectItem>
                      <SelectItem value="Uttara Sector 7 Depot">Uttara Sector 7 Depot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tr-to">Destination Store *</Label>
                  <Select value={toLocation} onValueChange={(val) => { if (val) setToLocation(val); }}>
                    <SelectTrigger id="tr-to">
                      <SelectValue placeholder="Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mirpur POP Store">Mirpur POP Store</SelectItem>
                      <SelectItem value="Dhanmondi Sub-store">Dhanmondi Sub-store</SelectItem>
                      <SelectItem value="Uttara Sector 7 Depot">Uttara Sector 7 Depot</SelectItem>
                      <SelectItem value="Central NOC Warehouse (Dhaka)">Central NOC Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-qty">Transfer Quantity (Units) *</Label>
                <Input
                  id="tr-qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-notes">Courier / Vehicle / Chalan Notes</Label>
                <Input
                  id="tr-notes"
                  placeholder="e.g. Dispatched via NOC delivery van #5, driver Rafiq"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Dispatch Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
