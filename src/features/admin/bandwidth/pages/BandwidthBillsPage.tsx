'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { BandwidthPurchaseBillItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Receipt, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthBillsPage() {
  const { data, isLoading } = useBandwidthData();
  const [bills, setBills] = useState<BandwidthPurchaseBillItem[]>([]);
  const [providerFilter, setProviderFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [billNo, setBillNo] = useState('');
  const [provider, setProvider] = useState('Summit Communications Ltd.');
  const [amount, setAmount] = useState(250000);
  const [capacity, setCapacity] = useState(1000);

  const initial = data?.purchaseBills ?? [];
  if (bills.length === 0 && initial.length > 0) {
    setBills(initial);
  }

  const list = bills.length > 0 ? bills : initial;
  const filtered = list.filter((b) =>
    providerFilter === 'all' || b.providerName.toLowerCase().includes(providerFilter.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: BandwidthPurchaseBillItem = {
      id: `bpb_${Date.now()}`,
      billNumber: billNo || `BILL-${Date.now()}`,
      providerId: 'bwp_1',
      providerName: provider,
      month: 'September 2026',
      billingDate: '2026-09-02',
      dueDate: '2026-09-20',
      capacityMbps: capacity,
      amountBdt: amount,
      vatBdt: Math.round(amount * 0.05),
      totalBdt: Math.round(amount * 1.05),
      status: 'pending',
    };
    setBills((prev) => [newBill, ...prev]);
    toast.success('Purchase bill entered into accounts.');
    setModalOpen(false);
  };

  if (isLoading && bills.length === 0) return <PageSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Purchase Bills"
        subtitle="Upstream invoices, transmission bills, and payment reconciliation"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth Buy' },
          { label: 'Purchase Bills' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Bill
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-64">
          <Select value={providerFilter} onValueChange={(v) => v && setProviderFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="summit">Summit Communications</SelectItem>
              <SelectItem value="fiber">Fiber@Home</SelectItem>
              <SelectItem value="link3">Link3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {filtered.length} bills
        </span>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Bill Number</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Billing Month</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Amount (BDT)</TableHead>
              <TableHead>Total + VAT</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b, idx) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-mono font-medium text-xs text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  {b.billNumber}
                </TableCell>
                <TableCell className="font-semibold text-xs">{b.providerName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.month}</TableCell>
                <TableCell className="font-mono text-xs">{b.capacityMbps} Mbps</TableCell>
                <TableCell className="font-mono text-sm">{formatBdtWithSymbol(b.amountBdt)}</TableCell>
                <TableCell className="font-mono text-sm font-bold text-foreground">
                  {formatBdtWithSymbol(b.totalBdt)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{b.dueDate}</TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Carrier Purchase Bill</DialogTitle>
            <DialogDescription>Record a new billing statement received from upstream provider.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="bNo">Bill Reference # *</Label>
              <Input id="bNo" placeholder="e.g. BILL-SCL-2026-09" value={billNo} onChange={(e) => setBillNo(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bProv">Provider *</Label>
              <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
                <SelectTrigger id="bProv">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Summit Communications Ltd.">Summit Communications Ltd.</SelectItem>
                  <SelectItem value="Fiber@Home Limited">Fiber@Home Limited</SelectItem>
                  <SelectItem value="Link3 Technologies Ltd.">Link3 Technologies Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bCap">Capacity (Mbps)</Label>
                <Input id="bCap" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bAmt">Amount (BDT) *</Label>
                <Input id="bAmt" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
