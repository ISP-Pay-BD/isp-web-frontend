'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthProviderItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Handshake, MapPin, Building2, Trash2 } from 'lucide-react';
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
  const { data, isLoading } = useBandwidthData();
  const [providers, setProviders] = useState<BandwidthProviderItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

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
      totalCapacityMbps: 500,
      monthlyBillBdt: 120000,
      status: 'active',
    };
    setProviders((prev) => [newProv, ...prev]);
    toast.success('Bandwidth provider onboarded.');
    setModalOpen(false);
    setName('');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthProviderItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Provider & Brand',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
              {row.original.logoText}
            </div>
            <div>
              <div className="font-semibold text-foreground">{row.original.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {row.original.address}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person',
        cell: ({ row }) => (
          <span className="text-xs font-medium">{row.original.contactPerson}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone / Mobile',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'totalCapacityMbps',
        header: 'Capacity',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.totalCapacityMbps} Mbps
          </Badge>
        ),
      },
      {
        accessorKey: 'monthlyBillBdt',
        header: 'Monthly Rate',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {formatBdtWithSymbol(row.original.monthlyBillBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setProviders((prev) => prev.filter((p) => p.id !== row.original.id));
                toast.success('Provider removed.');
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading && providers.length === 0) return <PageSkeleton variant="table" rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Upstream Providers (IIG / ITC)"
        subtitle="Upstream carrier partners, NTTN transmission circuits, and contact directory"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
          { label: 'Providers' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Provider
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Carriers" value={list.length} icon={Building2} />
        <StatCard title="Total Upstream Trunks" value={list.reduce((sum, p) => sum + p.activeCircuits, 0)} icon={Handshake} />
        <StatCard
          title="Total Aggregated Pipe"
          value={`${list.reduce((sum, p) => sum + p.totalCapacityMbps, 0)} Mbps`}
          icon={Building2}
        />
        <StatCard
          title="Total Carrier Billing"
          value={formatBdtWithSymbol(list.reduce((sum, p) => sum + p.monthlyBillBdt, 0))}
          icon={Building2}
        />
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search providers by name, contact, phone..."
        searchFilterFn={providerSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No providers"
        emptyDescription="Onboard an upstream carrier to get started."
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Onboard Carrier / Provider</DialogTitle>
            <DialogDescription>Register an International Internet Gateway (IIG) or ITC carrier.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pName">Provider Company Name *</Label>
              <Input id="pName" placeholder="e.g. Summit Communications Ltd." value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pContact">Contact Person *</Label>
              <Input id="pContact" placeholder="e.g. Khandaker Tanvir" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pPhone">Mobile / NOC Hotline *</Label>
                <Input id="pPhone" className="font-mono" placeholder="01713000101" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pEmail">Email *</Label>
                <Input id="pEmail" type="email" placeholder="noc@summit.net" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pAddr">Office Address</Label>
              <Input id="pAddr" placeholder="e.g. Kawran Bazar C/A, Dhaka" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Onboard Provider</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
