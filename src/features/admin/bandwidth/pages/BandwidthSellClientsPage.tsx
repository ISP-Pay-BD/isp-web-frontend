'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthSellClientItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Users, ArrowUpFromLine, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const clientSearchFilter = (
  row: LegacyRow<BandwidthSellClientItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const c = row.original;
  return (
    c.clientName.toLowerCase().includes(q) ||
    c.contactPerson.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.mobile.includes(q)
  );
};

export function BandwidthSellClientsPage() {
  const { data, isLoading } = useBandwidthData();
  const [clients, setClients] = useState<BandwidthSellClientItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [mbps, setMbps] = useState(100);
  const [rate, setRate] = useState(35000);

  const initial = data?.sellClients ?? [];
  if (clients.length === 0 && initial.length > 0) {
    setClients(initial);
  }

  const list = clients.length > 0 ? clients : initial;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newClient: BandwidthSellClientItem = {
      id: `bwc_client_${Date.now()}`,
      clientName: name,
      contactPerson: contact,
      email,
      mobile,
      address: 'Dhaka, Bangladesh',
      allocatedMbps: mbps,
      monthlyRateBdt: rate,
      balanceDueBdt: 0,
      status: 'active',
      popZone: 'Main Distribution',
    };
    setClients((prev) => [newClient, ...prev]);
    toast.success('Bandwidth sell client registered.');
    setModalOpen(false);
    setName('');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthSellClientItem, unknown>[]>(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Customer / Enterprise',
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-foreground">{row.original.clientName}</span>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.contactPerson}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile Phone',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">{row.original.mobile}</span>
        ),
      },
      {
        accessorKey: 'allocatedMbps',
        header: 'Allocated',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.allocatedMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'monthlyRateBdt',
        header: 'Monthly Rate',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {formatBdtWithSymbol(row.original.monthlyRateBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'balanceDueBdt',
        header: 'Balance Due',
        cell: ({ row }) =>
          row.original.balanceDueBdt > 0 ? (
            <span className="font-mono text-sm text-red-500 font-bold">
              {formatBdtWithSymbol(row.original.balanceDueBdt)}
            </span>
          ) : (
            <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              ৳0 (Clear)
            </span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className="text-xs capitalize">{row.original.status}</span>
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
                setClients((prev) => prev.filter((item) => item.id !== row.original.id));
                toast.success('Client removed.');
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

  if (isLoading && clients.length === 0) return <PageSkeleton variant="table" rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Sell Clients (Wholesale & Corporate)"
        subtitle="Corporate DIA accounts, reseller sub-ISPs, and wholesale bandwidth distribution"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Sell' },
          { label: 'Clients' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Client
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Wholesale Clients" value={list.length} icon={Users} />
        <StatCard
          title="Total Sold Bandwidth"
          value={`${list.reduce((sum, c) => sum + c.allocatedMbps, 0)} Mbps`}
          icon={ArrowUpFromLine}
        />
        <StatCard
          title="Monthly Recurring Sell"
          value={formatBdtWithSymbol(list.reduce((sum, c) => sum + c.monthlyRateBdt, 0))}
          icon={Users}
        />
        <StatCard
          title="Total Outstanding Due"
          value={formatBdtWithSymbol(list.reduce((sum, c) => sum + c.balanceDueBdt, 0))}
          icon={Users}
        />
      </div>

      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="clientName"
        searchPlaceholder="Search client, contact, or email..."
        searchFilterFn={clientSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Status' }]}
        emptyTitle="No sell clients"
        emptyDescription="Register a wholesale or corporate client to get started."
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Wholesale Client</DialogTitle>
            <DialogDescription>Add a sub-ISP or corporate DIA client for bandwidth selling.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cName">Company / Enterprise Name *</Label>
              <Input id="cName" placeholder="e.g. Grameen IT Solution" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cPerson">Contact Person *</Label>
              <Input id="cPerson" placeholder="e.g. Mr. Shamsul Huda" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cMobile">Mobile Number *</Label>
                <Input id="cMobile" className="font-mono" placeholder="01819234567" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cMail">Email *</Label>
                <Input id="cMail" type="email" placeholder="billing@client.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cMbps">Bandwidth (Mbps) *</Label>
                <Input id="cMbps" type="number" value={mbps} onChange={(e) => setMbps(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cRate">Monthly Rate (BDT) *</Label>
                <Input id="cRate" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} required />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Register Client</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
