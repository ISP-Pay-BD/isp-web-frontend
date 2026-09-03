'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  HardDrive,
  DollarSign,
  ArrowDownToLine,
  X,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared';
import { useBandwidthData } from '../hooks/useBandwidthData';
import type { DailyBillItem } from '@/data/admin/bandwidth.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { formatBdtWithSymbol } from '@/lib/format';
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Bandwidth Daily Bills & Consumption Log"
          subtitle="Daily gigabyte consumption tracking per POP distribution node"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Bandwidth' },
            { label: 'Daily Bill' },
          ]}
          actions={
            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 font-semibold shadow-sm">
              <Plus className="h-4 w-4" /> Receive Bill
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Data Logged"
          value={`${totalVolumeGb.toLocaleString()} GB`}
          description="Traffic throughput recorded"
          icon={HardDrive}
        />
        <StatCard
          title="Average Cost / GB"
          value="2.50 BDT"
          description="Wholesale transmission tariff"
          icon={DollarSign}
        />
        <StatCard
          title="Total Daily Billings"
          value={formatBdtWithSymbol(totalBillAmount)}
          description="Total payable to upstream"
          icon={Calendar}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-10">
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">#</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">POP Distribution Node</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Carrier / Upstream</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Usage (GB)</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Rate / GB</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Amount (BDT)</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Received By</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((b, idx) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className="group border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3.5 font-mono text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-xs font-bold">{b.date}</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{b.popName}</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-muted-foreground">{b.vendor}</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-xs font-bold text-primary">{b.usageGb} GB</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-xs">{b.ratePerGb} BDT</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-sm font-bold">{formatBdtWithSymbol(b.amountBdt)}</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-muted-foreground">{b.receivedBy}</span>
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      {b.status === 'received' ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Received
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-medium gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ArrowDownToLine className="h-4 w-4" />
              </div>
              Receive Daily Bandwidth Bill
            </DialogTitle>
            <DialogDescription>Record daily consumption data from POP transmission router.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReceiveBill} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">POP Node *</Label>
              <Select value={selectedPop} onValueChange={(v) => v && setSelectedPop(v)}>
                <SelectTrigger className="h-10 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Demo POP Uttara">Demo POP Uttara</SelectItem>
                  <SelectItem value="Demo POP Mirpur">Demo POP Mirpur</SelectItem>
                  <SelectItem value="Demo POP Dhanmondi">Demo POP Dhanmondi</SelectItem>
                  <SelectItem value="Demo POP Chittagong">Demo POP Chittagong</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Daily Usage (GB) *</Label>
                <Input type="number" value={usageGb} onChange={(e) => setUsageGb(Number(e.target.value))} className="h-10 font-mono shadow-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate / GB (BDT) *</Label>
                <Input type="number" step="0.1" value={ratePerGb} onChange={(e) => setRatePerGb(Number(e.target.value))} className="h-10 font-mono shadow-sm" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Received By (Staff / Officer) *</Label>
              <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} className="h-10 shadow-sm" required />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 font-semibold shadow-sm gap-1.5">
                <ArrowDownToLine className="h-4 w-4" /> Record Bill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
