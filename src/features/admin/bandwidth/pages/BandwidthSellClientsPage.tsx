'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthSellClientItem } from '@/data/admin/bandwidth.data';
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
import { Plus, Download, Users, ArrowUpFromLine, Trash2, MapPin, Phone, Mail, Zap, Building2 } from 'lucide-react';
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
    c.mobile.includes(q) ||
    c.popZone.toLowerCase().includes(q)
  );
};

export function BandwidthSellClientsPage() {
  const { data, isLoading, isError, refetch } = useBandwidthData();
  const [clients, setClients] = useState<BandwidthSellClientItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [mbps, setMbps] = useState(100);
  const [rate, setRate] = useState(40000);
  const [popZone, setPopZone] = useState('Uttara NOC');

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
      address: address || 'Dhaka, Bangladesh',
      allocatedMbps: mbps,
      monthlyRateBdt: rate,
      balanceDueBdt: 0,
      status: 'active',
      popZone,
    };
    setClients((prev) => [newClient, ...prev]);
    toast.success('Wholesale corporate client registered successfully.');
    setModalOpen(false);
    setName('');
    setContact('');
    setEmail('');
    setMobile('');
  };

  const handleExportCsv = () => {
    const headers = ['Client Enterprise', 'Contact Person', 'Email', 'Mobile', 'Allocated Mbps', 'Monthly Rate (BDT)', 'Due Amount (BDT)', 'Zone', 'Status'];
    const rows = list.map((c) => [
      c.clientName,
      c.contactPerson,
      c.email,
      c.mobile,
      c.allocatedMbps,
      c.monthlyRateBdt,
      c.balanceDueBdt,
      c.popZone,
      c.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bandwidth_sell_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Wholesale clients directory exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<BandwidthSellClientItem, unknown>[]>(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Customer / Enterprise',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 font-bold text-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.clientName}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                <span>{row.original.popZone}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person & Mobile',
        size: 190,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-semibold text-xs text-foreground">{row.original.contactPerson}</div>
            <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobile}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Billing Email',
        size: 180,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'allocatedMbps',
        header: 'Allocated Pipe',
        size: 130,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-primary">
            <Zap className="h-3 w-3 text-amber-500" />
            {row.original.allocatedMbps} Mbps
          </span>
        ),
      },
      {
        accessorKey: 'monthlyRateBdt',
        header: 'Monthly Tariff',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-bold text-foreground">
            {formatBdtWithSymbol(row.original.monthlyRateBdt)}
          </span>
        ),
      },
      {
        accessorKey: 'balanceDueBdt',
        header: 'Outstanding Due',
        size: 140,
        cell: ({ row }) =>
          row.original.balanceDueBdt > 0 ? (
            <span className="font-mono text-sm text-red-500 font-bold">
              {formatBdtWithSymbol(row.original.balanceDueBdt)}
            </span>
          ) : (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-medium">
              ৳0 Cleared
            </Badge>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          row.original.status === 'active' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-medium gap-1">
              Suspended
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
                setClients((prev) => prev.filter((item) => item.id !== row.original.id));
                toast.success('Client entity removed.');
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

  if (isLoading && clients.length === 0) return <PageSkeleton variant="table" rows={6} />;
  if (isError && clients.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load sell clients"
          description="Could not fetch wholesale clients."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Bandwidth Sell Clients (Wholesale & Corporate)"
        subtitle="Corporate DIA accounts, reseller sub-ISPs, and wholesale bandwidth distribution ledger"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Bandwidth Sell', url: '/admin/bandwidth/sell' },
          { label: 'Clients' },
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
              <Plus className="h-3.5 w-3.5" /> Register Client
            </Button>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{list.length}</span>{' '}
          <span className="text-muted-foreground">corporate clients</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{`${list.reduce((sum, c) => sum + c.allocatedMbps, 0)} Mbps`}</span>{' '}
          <span className="text-muted-foreground">total sold bandwidth</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatBdtWithSymbol(list.reduce((sum, c) => sum + c.monthlyRateBdt, 0))}
          </span>{' '}
          <span className="text-muted-foreground">monthly recurring sell</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {formatBdtWithSymbol(list.reduce((sum, c) => sum + c.balanceDueBdt, 0))}
          </span>{' '}
          <span className="text-muted-foreground">outstanding client receivables</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={list}
        getRowId={(row) => row.id}
        searchKey="clientName"
        searchPlaceholder="Search client by enterprise name, contact person, mobile..."
        searchFilterFn={clientSearchFilter}
        facetFilters={[{ columnId: 'status', title: 'Account Status' }]}
        emptyTitle="No sell clients found"
        emptyDescription="Register a wholesale or corporate client to get started."
      />

      {/* Register Client Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Register Wholesale Corporate Client
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a sub-ISP, hotel, or enterprise client for dedicated bandwidth delivery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Company / Enterprise Name *</Label>
              <Input
                placeholder="e.g. Grameen IT Solutions Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Contact Person *</Label>
              <Input
                placeholder="e.g. Mr. Shamsul Huda (CTO)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input
                  className="font-mono text-xs h-9"
                  placeholder="01819234567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Billing Email *</Label>
                <Input
                  type="email"
                  placeholder="billing@client.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bandwidth (Mbps) *</Label>
                <Input
                  type="number"
                  value={mbps}
                  onChange={(e) => setMbps(Number(e.target.value))}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Tariff (BDT) *</Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="text-xs h-9 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">POP / Distribution Node</Label>
              <Input
                placeholder="e.g. Gulshan NOC Trunk"
                value={popZone}
                onChange={(e) => setPopZone(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Register Client
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
