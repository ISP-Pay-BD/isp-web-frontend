'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthSellClientItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Users, ArrowUpFromLine, Mail, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthSellClientsPage() {
  const { data, isLoading } = useBandwidthData();
  const [clients, setClients] = useState<BandwidthSellClientItem[]>([]);
  const [search, setSearch] = useState('');
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
  const filtered = list.filter((c) =>
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

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

  if (isLoading && clients.length === 0) return <PageSkeleton rows={4} />;

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

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Customer / Enterprise</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Mobile Phone</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Monthly Rate</TableHead>
              <TableHead>Balance Due</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, idx) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-semibold text-xs text-foreground">{c.clientName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.contactPerson}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{c.email}</TableCell>
                <TableCell className="font-mono text-xs font-medium text-foreground">{c.mobile}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">{c.allocatedMbps} Mbps</TableCell>
                <TableCell className="font-mono text-sm font-semibold">{formatBdtWithSymbol(c.monthlyRateBdt)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {c.balanceDueBdt > 0 ? (
                    <span className="text-red-500 font-bold">{formatBdtWithSymbol(c.balanceDueBdt)}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">৳0 (Clear)</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setClients((prev) => prev.filter((item) => item.id !== c.id));
                      toast.success('Client removed.');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
