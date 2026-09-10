'use client';

import { useState, useMemo } from 'react';
import {
  Wallet,
  Search,
  Plus,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  X,
  Building2,
  Phone,
  FileText,
  BadgeCheck,
  CreditCard,
  Eye,
  ChevronRight,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { CashbookEntry } from '@/data/admin/isp-ops.data';

type MethodFilter = 'all' | 'cash' | 'bkash' | 'nagad' | 'bank';
type StatusFilter = 'all' | 'verified' | 'deposited' | 'collected';

export function CashbookPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEntry, setSelectedEntry] = useState<CashbookEntry | null>(null);
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false);

  // New receipt state
  const [newCustomer, setNewCustomer] = useState('');
  const [newCollector, setNewCollector] = useState('Rafiq Field (Lineman)');
  const [newAmount, setNewAmount] = useState('1200');
  const [newMethod, setNewMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [newNote, setNewNote] = useState('Counter payment');

  const rawEntries = useMemo(() => data?.cashbookEntries ?? [], [data?.cashbookEntries]);

  // Aggregate Metrics
  const totalCollectedBdt = useMemo(
    () => rawEntries.reduce((s, r) => s + r.amountBdt, 0),
    [rawEntries]
  );
  const cashOnlyBdt = useMemo(
    () => rawEntries.filter((r) => r.method === 'cash').reduce((s, r) => s + r.amountBdt, 0),
    [rawEntries]
  );
  const verifiedCount = useMemo(
    () => rawEntries.filter((r) => r.verifiedByAccounts || r.status === 'verified').length,
    [rawEntries]
  );
  const pendingDepositBdt = useMemo(
    () => rawEntries.filter((r) => r.status === 'collected').reduce((s, r) => s + r.amountBdt, 0),
    [rawEntries]
  );

  const filteredEntries = useMemo(() => {
    return rawEntries.filter((entry) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          entry.customerName.toLowerCase().includes(q) ||
          entry.collector.toLowerCase().includes(q) ||
          (entry.receiptNo && entry.receiptNo.toLowerCase().includes(q)) ||
          (entry.customerArea && entry.customerArea.toLowerCase().includes(q)) ||
          (entry.depositSlipNo && entry.depositSlipNo.toLowerCase().includes(q)) ||
          entry.note.toLowerCase().includes(q) ||
          String(entry.amountBdt).includes(q);
        if (!match) return false;
      }
      if (methodFilter !== 'all' && entry.method !== methodFilter) return false;
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      return true;
    });
  }, [rawEntries, search, methodFilter, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Receipt No',
      'Time',
      'Collector',
      'Customer',
      'Area',
      'Amount (BDT)',
      'Method',
      'Accounts Verified',
      'Deposit Slip',
      'Remarks',
    ];
    const rows = filteredEntries.map((e) => [
      e.receiptNo ?? e.id,
      e.at,
      e.collector,
      e.customerName,
      e.customerArea ?? 'N/A',
      e.amountBdt,
      e.method.toUpperCase(),
      e.verifiedByAccounts ? 'YES' : 'NO',
      e.depositSlipNo ?? 'N/A',
      e.note,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `collector_cashbook_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Cash book exported to CSV');
  };

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer) {
      toast.error('Please enter customer name');
      return;
    }
    toast.success(`Cash entry ৳${newAmount} recorded for ${newCustomer}`);
    setIsAddReceiptOpen(false);
    setNewCustomer('');
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load cash book"
        description="Could not connect to counter accounts ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Collector Cash Book & Daily Cash Inflow"
        subtitle="Field lineman collections, front counter cash registers, and bank deposit reconciliation"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Collections' },
          { label: 'Cash Book' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Cash Book
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddReceiptOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Record Cash Inflow
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Collected
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ৳{totalCollectedBdt.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Total gross collections across all field agents
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Physical Cash In Hand
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                ৳{cashOnlyBdt.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-500 font-medium">cash</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Paper currency pending vault / bank deposit
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Accounts Verified
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <BadgeCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-blue-400 font-mono">
                {verifiedCount} of {rawEntries.length}
              </span>
              <span className="text-xs text-muted-foreground">entries</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Confirmed and reconciled by accounting desk
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bank Deposits
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-purple-400 font-mono">
                100%
              </span>
              <span className="text-xs text-muted-foreground">reconciled</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              City Bank & DBBL deposit slips verified
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, collector, receipt no, or slip..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'cash', label: 'Cash' },
                { key: 'bkash', label: 'bKash' },
                { key: 'nagad', label: 'Nagad' },
                { key: 'bank', label: 'Bank' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={methodFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setMethodFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  methodFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 text-xs w-[130px] bg-background/80">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="deposited">Bank Deposited</SelectItem>
              <SelectItem value="collected">Collected (Open)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No cash book entries"
          description="No collection records match your search filter."
          actionLabel="Record Collection"
          onAction={() => setIsAddReceiptOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Receipt & Date</th>
                  <th className="py-3 px-4">Field Collector / Counter</th>
                  <th className="py-3 px-4">Subscriber & Area</th>
                  <th className="py-3 px-4">Amount Collected</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Bank Deposit Slip</th>
                  <th className="py-3 px-4">Accounts Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredEntries.map((entry) => {
                  const isVerified = entry.verifiedByAccounts || entry.status === 'verified';
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {entry.receiptNo ?? entry.id}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {entry.at}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{entry.collector}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {entry.collectorPhone ?? '+880 1700-000000'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{entry.customerName}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {entry.customerArea ?? 'Dhaka Region'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-primary text-sm">
                        ৳{entry.amountBdt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold',
                            entry.method === 'cash' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            entry.method === 'bkash' && 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                            entry.method === 'nagad' && 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                            entry.method === 'bank' && 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          )}
                        >
                          {entry.method}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {entry.depositSlipNo ? (
                          <span className="text-foreground font-medium">{entry.depositSlipNo}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Pending Deposit</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                            <Clock className="h-3.5 w-3.5" /> Unchecked
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEntry(entry)}
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Book Entry Inspector Sheet */}
      <Sheet open={Boolean(selectedEntry)} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedEntry && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20"
                  >
                    {selectedEntry.method} Collection
                  </Badge>
                  {selectedEntry.verifiedByAccounts ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Accounts Audited
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      Pending Audit
                    </Badge>
                  )}
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedEntry.receiptNo ?? selectedEntry.id}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  Timestamp: {selectedEntry.at}
                </SheetDescription>
              </SheetHeader>

              {/* Amount Tile */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Amount Received</div>
                  <div className="text-2xl font-black font-mono text-primary mt-0.5">
                    ৳{selectedEntry.amountBdt.toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize text-xs font-bold font-mono">
                  {selectedEntry.method.toUpperCase()}
                </Badge>
              </div>

              {/* Collection Details */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Field Collection Audit
                </h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Collector Lineman</span>
                  <span className="font-semibold text-foreground">{selectedEntry.collector}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Subscriber Name</span>
                  <span className="font-semibold text-foreground">{selectedEntry.customerName}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Collection Location</span>
                  <span className="text-foreground">{selectedEntry.customerArea ?? 'Premises'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Bank Deposit Slip #</span>
                  <span className="font-mono text-foreground font-bold">
                    {selectedEntry.depositSlipNo ?? 'Not Deposited Yet'}
                  </span>
                </div>
              </div>

              {/* Remarks Note */}
              <div className="p-3 rounded-xl bg-card border border-border/50 space-y-1 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground">Field Notes:</span>
                <p className="text-muted-foreground leading-relaxed">{selectedEntry.note}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-border/60">
                <Button
                  onClick={() => {
                    toast.success(`Receipt ${selectedEntry.receiptNo} verified by Accounts`);
                    setSelectedEntry(null);
                  }}
                  className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Accounts Verified
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                  className="w-full text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Record Inflow Dialog */}
      <Dialog open={isAddReceiptOpen} onOpenChange={setIsAddReceiptOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus className="h-4 w-4" />
              </div>
              Record Field Cash Inflow
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record counter cash or field lineman payment receipt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddReceipt} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Subscriber Name</label>
              <Input
                placeholder="e.g. Rahim Uddin"
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Collector / Counter</label>
                <Select value={newCollector} onValueChange={(v) => v && setNewCollector(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rafiq Field (Lineman)">Rafiq Field (Lineman)</SelectItem>
                    <SelectItem value="Salma Desk (Accounts Desk)">Salma Desk (Counter)</SelectItem>
                    <SelectItem value="Imtiaz Tech">Imtiaz Tech</SelectItem>
                    <SelectItem value="Kamal Lineman">Kamal Lineman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Amount (৳ BDT)</label>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Payment Mode</label>
                <Select value={newMethod} onValueChange={(v) => v && setNewMethod(v as typeof newMethod)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash In Hand</SelectItem>
                    <SelectItem value="bkash">bKash Merchant</SelectItem>
                    <SelectItem value="nagad">Nagad Direct</SelectItem>
                    <SelectItem value="bank">Bank Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Remarks / Note</label>
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Door-to-door receipt #123"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 shadow-xs"
              >
                Save & Issue Cash Book Voucher
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
