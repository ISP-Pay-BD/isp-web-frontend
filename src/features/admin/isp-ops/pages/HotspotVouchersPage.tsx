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
  Ticket,
  CheckCircle2,
  Clock,
  Layers,
  Printer,
  MoreHorizontal,
  XCircle,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

type Row = IspOpsData['hotspotVouchers'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.code).toLowerCase().includes(q) ||
    String(r.profile).toLowerCase().includes(q) ||
    String(r.validityHours).toLowerCase().includes(q) ||
    String(r.batch).toLowerCase().includes(q)
  );
};

export function HotspotVouchersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [vouchers, setVouchers] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [profile, setProfile] = useState('24 Hours Unlimited (10 Mbps)');
  const [batchName, setBatchName] = useState('BATCH-2026-AUTUMN');
  const [count, setCount] = useState('20');
  const [validityHours, setValidityHours] = useState('24');

  const initialRows = data?.hotspotVouchers ?? [];
  const rows = vouchers.length > 0 ? vouchers : initialRows;

  const totalVouchers = rows.length;
  const unusedCount = rows.filter((r) => !r.used).length;
  const usedCount = totalVouchers - unusedCount;
  const batchCount = new Set(rows.map((r) => r.batch)).size;

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const genCount = Number(count) || 10;
    const newItems: Row[] = [];

    for (let i = 0; i < genCount; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      newItems.push({
        id: `v_${Date.now()}_${i}`,
        code,
        profile,
        validityHours: Number(validityHours) || 24,
        batch: batchName.trim() || 'BATCH-CUSTOM',
        used: false,
      });
    }

    setVouchers((prev) => [...newItems, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`Generated ${genCount} voucher PINs for ${batchName}.`);
    setModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Voucher PIN Code', 'Profile', 'Validity (Hours)', 'Batch ID', 'Used Status'];
    const csvRows = rows.map((r) => [
      r.code,
      `"${r.profile}"`,
      r.validityHours,
      r.batch,
      r.used ? 'Used' : 'Available',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotspot_vouchers_batch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Hotspot voucher batch exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Voucher PIN Code',
        enableHiding: false,
        size: 190,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Key className="h-4 w-4" />
            </div>
            <span className="font-mono text-sm font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {String(row.original.code)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'profile',
        header: 'Bandwidth Profile',
        size: 240,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background text-sm font-normal">
            {String(row.original.profile)}
          </Badge>
        ),
      },
      {
        accessorKey: 'validityHours',
        header: 'Validity Period',
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{String(row.original.validityHours)} Hours</span>
          </div>
        ),
      },
      {
        accessorKey: 'batch',
        header: 'Batch Identifier',
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(row.original.batch)}</span>
        ),
      },
      {
        accessorKey: 'used',
        header: 'Redemption Status',
        size: 130,
        cell: ({ row }) => {
          const used = !!row.original.used;
          return (
            <Badge
              variant="outline"
              className={
                used
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold'
              }
            >
              {used ? 'Redeemed' : 'Available'}
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
                <DropdownMenuLabel>Voucher Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Printing voucher card PIN ${r.code}`)}>
                  <Printer className="h-3.5 w-3.5 mr-2" />
                  Print Voucher Card
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Voucher PIN ${r.code} voided`)}
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Invalidate PIN
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
    return <EmptyState title="Failed to load vouchers" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Prepaid Vouchers"
        subtitle="Generate, export, batch-print, and manage guest WiFi voucher PIN cards."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Vouchers' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Batch CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Generate Batch
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Vouchers</span>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalVouchers}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Generated PIN codes</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Available / Unused</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {unusedCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready for sale & login</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Redeemed</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {usedCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Used by guests</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Batches</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {batchCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Batch production groups</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="code"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search by PIN code, profile, or batch name..."
      />

      {/* Generate Batch Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleGenerateBatch}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Generate Voucher Batch
              </DialogTitle>
              <DialogDescription>
                Create a batch of random multi-digit PIN codes tied to a specific bandwidth profile.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="vch-profile">Bandwidth Profile *</Label>
                <Select value={profile} onValueChange={(val) => { if (val) setProfile(val); }}>
                  <SelectTrigger id="vch-profile">
                    <SelectValue placeholder="Select Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24 Hours Unlimited (10 Mbps)">24 Hours Unlimited (10 Mbps)</SelectItem>
                    <SelectItem value="2 Hours (5 Mbps)">2 Hours (5 Mbps)</SelectItem>
                    <SelectItem value="7 Days Unlimited (15 Mbps)">7 Days Unlimited (15 Mbps)</SelectItem>
                    <SelectItem value="1 Month VIP Access (20 Mbps)">1 Month VIP Access (20 Mbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vch-batch">Batch Name / Event *</Label>
                  <Input
                    id="vch-batch"
                    placeholder="e.g. BATCH-LOBBY-01"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vch-qty">Quantity of PINs *</Label>
                  <Input
                    id="vch-qty"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vch-hours">Session Validity (Hours)</Label>
                <Input
                  id="vch-hours"
                  type="number"
                  value={validityHours}
                  onChange={(e) => setValidityHours(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Generate Vouchers</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
