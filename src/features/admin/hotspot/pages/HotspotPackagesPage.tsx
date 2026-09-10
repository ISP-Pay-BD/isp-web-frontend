'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotProfileItem } from '@/data/admin/network-ops.data';
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
  Package,
  CheckCircle2,
  Gauge,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Clock,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';

const profileSearchFilter = (
  row: LegacyRow<HotspotProfileItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return p.name.toLowerCase().includes(q) || p.rateLimit.includes(q);
};

export function HotspotPackagesPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();
  const [profiles, setProfiles] = useState<HotspotProfileItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState('10M/10M');
  const [validityHours, setValidityHours] = useState('24');
  const [priceBdt, setPriceBdt] = useState('50');
  const [sellingPriceBdt, setSellingPriceBdt] = useState('60');
  const [addressPool, setAddressPool] = useState('hs-pool-1');

  const initial = data?.profiles ?? [];
  const list = profiles.length > 0 ? profiles : initial;

  const totalProfiles = list.length;
  const activeCount = list.filter((p) => p.status === 'active').length;
  const totalActiveUsers = list.reduce((s, p) => s + (p.activeUsers || 0), 0);
  const avgPrice = totalProfiles > 0 ? Math.round(list.reduce((s, p) => s + (p.sellingPriceBdt || 0), 0) / totalProfiles) : 0;

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter package name');
      return;
    }

    const newProf: HotspotProfileItem = {
      id: `hp_${Date.now()}`,
      name,
      speedMbps: Number(validityHours) || 10,
      rateLimit,
      validityHours: Number(validityHours) || 24,
      validityFormatted: `${validityHours} Hours`,
      priceBdt: Number(priceBdt) || 0,
      sellingPriceBdt: Number(sellingPriceBdt) || 0,
      addressPool,
      sharedUsers: 1,
      parentQueue: 'default',
      expiredMode: 'remove',
      lockUser: false,
      activeUsers: 0,
      status: 'active',
    };

    setProfiles((prev) => [newProf, ...(prev.length > 0 ? prev : initial)]);
    toast.success(`Hotspot profile "${newProf.name}" created.`);
    setModalOpen(false);
    setName('');
    setRateLimit('10M/10M');
    setValidityHours('24');
    setPriceBdt('50');
    setSellingPriceBdt('60');
  };

  const handleExportCsv = () => {
    const headers = ['Profile Name', 'Rate Limit', 'Validity', 'Base Price (BDT)', 'Selling Price (BDT)', 'Address Pool', 'Active Users', 'Status'];
    const rows = list.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.rateLimit,
      p.validityFormatted,
      p.priceBdt,
      p.sellingPriceBdt,
      p.addressPool,
      p.activeUsers,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotspot_packages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Hotspot packages exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<HotspotProfileItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Package Profile',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Wifi className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-sm line-clamp-1">{p.name}</span>
                <span className="text-xs text-muted-foreground block font-mono">Pool: {p.addressPool}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rateLimit',
        header: 'Bandwidth Speed',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 bg-background text-primary border-primary/30">
            <Gauge className="mr-1 h-3 w-3" />
            {row.original.rateLimit}
          </Badge>
        ),
      },
      {
        accessorKey: 'validityFormatted',
        header: 'Validity Duration',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{row.original.validityFormatted}</span>
          </div>
        ),
      },
      {
        id: 'pricing',
        accessorFn: (row) => row.sellingPriceBdt,
        header: 'Cost / Retail Sell',
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="text-muted-foreground">{formatBdtWithSymbol(row.original.priceBdt)}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-bold text-foreground tabular-nums text-sm">{formatBdtWithSymbol(row.original.sellingPriceBdt)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'activeUsers',
        header: 'Active Sessions',
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-background font-mono tabular-nums">
            {row.original.activeUsers} clients
          </Badge>
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
              {active ? 'Active' : 'Disabled'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Profile Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(`Editing ${p.name}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Package
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Duplicated ${p.name}`)}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicate Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Package ${p.name} deactivated`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Deactivate Plan
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
    return <EmptyState title="Failed to load hotspot packages" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Packages & Bandwidth Profiles"
        subtitle="Manage speed tiers, validity duration, burst limits, and retail prices for voucher cards."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Packages' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Create Package Profile
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Profiles</span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalProfiles}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Configured tiers</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tiers</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {activeCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Available for voucher generation</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Retail Price</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(avgPrice)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Per voucher package</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
            <Wifi className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalActiveUsers}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Clients on these profiles</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={list}
        searchKey="name"
        searchFilterFn={profileSearchFilter}
        searchPlaceholder="Search by package name or rate limit..."
      />

      {/* Create Package Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateProfile}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Create Hotspot Package Profile
              </DialogTitle>
              <DialogDescription>
                Define MikroTik bandwidth limits, validity periods, and retail voucher pricing.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-name">Profile Name *</Label>
                <Input
                  id="pkg-name"
                  placeholder="e.g. 24 Hours Unlimited - 10 Mbps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-rate">Rate Limit (Rx/Tx) *</Label>
                  <Select value={rateLimit} onValueChange={(val) => { if (val) setRateLimit(val); }}>
                    <SelectTrigger id="pkg-rate">
                      <SelectValue placeholder="Select Speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2M/2M">2 Mbps (2M/2M)</SelectItem>
                      <SelectItem value="5M/5M">5 Mbps (5M/5M)</SelectItem>
                      <SelectItem value="10M/10M">10 Mbps (10M/10M)</SelectItem>
                      <SelectItem value="15M/15M">15 Mbps (15M/15M)</SelectItem>
                      <SelectItem value="20M/20M">20 Mbps (20M/20M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-validity">Validity (Hours) *</Label>
                  <Input
                    id="pkg-validity"
                    type="number"
                    placeholder="e.g. 24"
                    value={validityHours}
                    onChange={(e) => setValidityHours(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-base">Base Cost (BDT)</Label>
                  <Input
                    id="pkg-base"
                    type="number"
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-sell">Retail Sell Price (BDT) *</Label>
                  <Input
                    id="pkg-sell"
                    type="number"
                    value={sellingPriceBdt}
                    onChange={(e) => setSellingPriceBdt(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-pool">MikroTik Address Pool</Label>
                <Select value={addressPool} onValueChange={(val) => { if (val) setAddressPool(val); }}>
                  <SelectTrigger id="pkg-pool">
                    <SelectValue placeholder="Select IP Pool" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hs-pool-1">hs-pool-1 (10.5.50.0/24)</SelectItem>
                    <SelectItem value="hs-pool-vip">hs-pool-vip (10.5.60.0/24)</SelectItem>
                    <SelectItem value="dhcp_pool_hotspot">dhcp_pool_hotspot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Profile</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
