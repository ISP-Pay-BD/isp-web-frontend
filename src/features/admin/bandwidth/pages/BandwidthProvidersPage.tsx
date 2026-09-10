'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthProviderItem } from '@/data/admin/bandwidth.data';
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
import { Plus, Download, Truck, MapPin, Building2, Phone, Mail, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const providerSearchFilter = (
  row: LegacyRow<BandwidthProviderItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const p = row.original;
  return (
    p.name.toLowerCase().includes(q) ||
    p.contactPerson.toLowerCase().includes(q) ||
    p.phone.includes(q) ||
    p.email.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q)
  );
};

export function BandwidthProvidersPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [providers, setProviders] = useState<BandwidthProviderItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(500);
  const [monthlyBill, setMonthlyBill] = useState(150000);

  const initial = data?.providers ?? [];
  if (providers.length === 0 && initial.length > 0) {
    setProviders(initial);
  }

  const list = providers.length > 0 ? providers : initial;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProv: BandwidthProviderItem = {
      id: `bwp_${Date.now()}`,
      name,
      contactPerson,
      phone,
      email,
      address,
      logoText: name.slice(0, 4).toUpperCase(),
      activeCircuits: 1,
      totalCapacityMbps: capacity,
      monthlyBillBdt: monthlyBill,
      status: 'active',
    };
    setProviders((prev) => [newProv, ...prev]);
    toast.success('Bandwidth provider onboarded successfully.');
    setModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleExportCsv = () => {
    const headers = ['Provider Name', 'Contact Person', 'Phone', 'Email', 'Capacity (Mbps)', 'Monthly Bill (BDT)', 'Status'];
    const rows = list.map((p) => [
      p.name,
      p.contactPerson,
      p.phone,
      p.email,
      p.totalCapacityMbps,
      p.monthlyBillBdt,
      p.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_providers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Carrier provider directory exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthProviderItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Carrier & Upstream Entity',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/20 shrink-0">
              {row.original.logoText}
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                <span className="truncate max-w-[200px]">{row.original.address}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person & Desk',
        size: 180,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-xs text-foreground">{row.original.contactPerson}</div>
            <div className="text-[10px] text-muted-foreground">Carrier Account Manager</div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'NOC Hotline & Mobile',
        size: 160,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-mono text-xs font-semibold text-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.phone}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Mail className="h-3 w-3 text-muted-foreground" /> {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'totalCapacityMbps',
        header: 'Contracted Pipe',
        size: 140,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-primary">
            <Zap className="h-3 w-3 text-amber-500" />
            {row.original.totalCapacityMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'monthlyBillBdt',
        header: 'Monthly Commitment',
        size: 150,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.monthlyBillBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          row.original.status === 'active' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-500/10 text-muted-foreground border-slate-500/20 text-[10px] font-medium gap-1">
              Inactive
            </Badge>
          )
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
                setProviders((prev) => prev.filter((p) => p.id !== row.original.id));
                toast.success('Carrier provider removed.');
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

  if (isLoading && providers.length === 0) return <PageSkeleton variant="table" rows={4} />;
  if (isError && providers.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load providers"
          description="Could not fetch bandwidth providers."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Upstream Providers (IIG / ITC)"
        subtitle="Upstream carrier partners, International Terrestrial Cable (ITC) links, and NTTN transmission circuits"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy', url: '/admin/bandwidth/buy' },
          { label: 'Providers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Directory
            </Button>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Onboard Carrier
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.length}</span>{' '}
          <span className="text-muted-foreground">carrier partners</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.reduce((sum, p) => sum + p.activeCircuits, 0)}</span>{' '}
          <span className="text-muted-foreground">active fiber trunks</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{`${list.reduce((sum, p) => sum + p.totalCapacityMbps, 0)} Mbps`}</span>{' '}
          <span className="text-muted-foreground">aggregated upstream capacity</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(list.reduce((sum, p) => sum + p.monthlyBillBdt, 0))}
          </span>{' '}
          <span className="text-muted-foreground">total monthly commitment</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search carrier by name, contact person, phone, email..."
        searchFilterFn={providerSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Carrier Status' }]}
        emptyTitle="No providers found"
        emptyDescription="Onboard an upstream carrier to get started."
      />

      {/* Onboard Carrier Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Onboard Carrier / Provider
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register an International Internet Gateway (IIG) or ITC carrier trunk.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Provider Company Name *</Label>
              <Input
                placeholder="e.g. Summit Communications Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Contact Person *</Label>
              <Input
                placeholder="e.g. Khandaker Tanvir"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile / NOC Phone *</Label>
                <Input
                  className="font-mono text-xs h-9"
                  placeholder="01713000101"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">NOC Email *</Label>
                <Input
                  type="email"
                  placeholder="noc@summit.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Capacity (Mbps)</Label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Rate (BDT)</Label>
                <Input
                  type="number"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(Number(e.target.value))}
                  className="text-xs h-9 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Office Address</Label>
              <Input
                placeholder="e.g. Kawran Bazar C/A, Dhaka"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Onboard Carrier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
