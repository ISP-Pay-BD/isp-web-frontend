'use client';

import { useState } from 'react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { DailyBillItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Calendar, HardDrive, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function BandwidthDailyBillPage() {
  const { data, isLoading } = useBandwidthData();
  const [bills, setBills] = useState<DailyBillItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPop, setSelectedPop] = useState('Demo POP Uttara');
  const [usageGb, setUsageGb] = useState(1500);
  const [ratePerGb, setRatePerGb] = useState(2.5);
  const [receivedBy, setReceivedBy] = useState('Sabbir Hossain');

  const initial = data?.dailyBills ?? [];
  if (bills.length === 0 && initial.length > 0) {
    setBills(initial);
  }

  const list = bills.length > 0 ? bills : initial;
  const totalVolumeGb = list.reduce((sum, b) => sum + b.usageGb, 0);
  const totalBillAmount = list.reduce((sum, b) => sum + b.amountBdt, 0);

  const handleReceiveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: DailyBillItem = {
      id: `db_${Date.now()}`,
      date: new Date().toISOString().split('T')[0]!,
      popName: selectedPop,
      usageGb,
      ratePerGb,
      amountBdt: Math.round(usageGb * ratePerGb),
      receivedBy,
      createdBy: 'Admin NOC',
      vendor: 'Summit Communications Ltd.',
      status: 'received',
    };
    setBills((prev) => [newBill, ...prev]);
    toast.success('Daily bill logged and received.');
    setModalOpen(false);
  };

  if (isLoading && bills.length === 0) return <PageSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandwidth Daily Bills & Consumption Log"
        subtitle="Daily gigabyte consumption tracking per POP distribution node"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Bandwidth' },
          { label: 'Daily Bill' },
        ]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Receive Bill
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Data Logged"
          value={`${totalVolumeGb.toLocaleString()} GB`}
          description="Traffic throughput recorded"
          icon={HardDrive}
        />
        <StatCard
          title="Average Cost / GB"
          value="৳2.50"
          description="Wholesale transmission tariff"
          icon={DollarSign}
        />
        <StatCard
          title="Total Daily Billings"
          value={formatBdtWithSymbol(totalBillAmount)}
          description="Total payable to upstream"
          icon={Calendar}
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>POP Distribution Node</TableHead>
              <TableHead>Carrier / Upstream</TableHead>
              <TableHead>Usage (GB)</TableHead>
              <TableHead>Rate / GB</TableHead>
              <TableHead>Amount (BDT)</TableHead>
              <TableHead>Received By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((b, idx) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-mono text-xs font-semibold text-foreground">{b.date}</TableCell>
                <TableCell className="text-xs font-medium">{b.popName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.vendor}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">{b.usageGb} GB</TableCell>
                <TableCell className="font-mono text-xs">৳{b.ratePerGb}</TableCell>
                <TableCell className="font-mono text-sm font-semibold">{formatBdtWithSymbol(b.amountBdt)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.receivedBy}</TableCell>
                <TableCell>
                  <StatusBadge status={b.status === 'received' ? 'paid' : 'pending'} label={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Daily Bandwidth Bill</DialogTitle>
            <DialogDescription>Record daily consumption data from POP transmission router.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReceiveBill} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="popSelect">POP Node *</Label>
              <Select value={selectedPop} onValueChange={(v) => v && setSelectedPop(v)}>
                <SelectTrigger id="popSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Demo POP Uttara">Demo POP Uttara</SelectItem>
                  <SelectItem value="Demo POP Mirpur">Demo POP Mirpur</SelectItem>
                  <SelectItem value="Demo POP Dhanmondi">Demo POP Dhanmondi</SelectItem>
                  <SelectItem value="Demo POP Chittagong">Demo POP Chittagong</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="uGb">Daily Usage (GB) *</Label>
                <Input id="uGb" type="number" value={usageGb} onChange={(e) => setUsageGb(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rGb">Rate / GB (BDT) *</Label>
                <Input id="rGb" type="number" step="0.1" value={ratePerGb} onChange={(e) => setRatePerGb(Number(e.target.value))} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recBy">Received By (Staff / Officer) *</Label>
              <Input id="recBy" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Record Bill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
