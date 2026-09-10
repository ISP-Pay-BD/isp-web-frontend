'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Eye,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import { useJournalEntries, type JournalEntryItem } from '../hooks/use-journal-entries';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'posted' | 'draft';

export function JournalEntriesPage() {
  const { entries, isLoading, isError, refetch } = useJournalEntries();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Journal Entry Form State
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('50000');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<'posted' | 'draft'>('posted');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entry.description.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q) ||
        entry.debitBdt.toString().includes(q);

      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, search, statusFilter]);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const posted = entries.filter((e) => e.status === 'posted').length;
    const draft = totalEntries - posted;
    const totalDebit = entries.reduce((s, e) => s + e.debitBdt, 0);
    const totalCredit = entries.reduce((s, e) => s + e.creditBdt, 0);

    return { totalEntries, posted, draft, totalDebit, totalCredit };
  }, [entries]);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      toast.error('Description is required');
      return;
    }
    toast.success(`Double-entry journal voucher recorded (${newStatus === 'posted' ? 'Posted' : 'Draft'})!`);
    setIsNewModalOpen(false);
    setNewDesc('');
    setNewAmount('50000');
  };

  const handleExportCSV = () => {
    toast.success(`Exporting ${filteredEntries.length} journal entry vouchers to CSV...`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load journal entries"
        description="Could not load accounting vouchers."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="General Journal & Double-Entry Vouchers"
        subtitle="Audited debit-credit journal vouchers for collections, IIG transit settlement, salary disbursement, and stock adjustments."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Accounting' }, { label: 'Journal Entries' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export Journal
            </Button>
            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Journal Voucher
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Vouchers</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.totalEntries}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">General ledger journals</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posted to GL</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.posted}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Finalized financial entries</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Debit / Credit</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">৳{stats.totalDebit.toLocaleString()}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Balanced journal turnover</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Drafts</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-amber-400">{stats.draft}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Awaiting audit approval</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by voucher ID, description, debit amount..."
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

        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px] h-9 text-xs bg-background/80">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="posted">Posted to GL</SelectItem>
            <SelectItem value="draft">Draft Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Table */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No journal entries found"
          description="Create a double-entry voucher to record transactions."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <TableHead className="text-xs font-semibold">Entry ID</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Voucher Description</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Debit (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Credit (BDT)</TableHead>
                  <TableHead className="text-right text-xs font-semibold">GL Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                        {entry.id}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {entry.date}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {entry.description}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono font-bold text-xs text-emerald-400">
                      ৳{entry.debitBdt.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono font-bold text-xs text-blue-400">
                      ৳{entry.creditBdt.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {entry.status === 'posted' ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Posted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-medium gap-1">
                          <Clock className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="bg-card border-border text-foreground w-full sm:max-w-md overflow-y-auto">
          {selectedEntry && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    {selectedEntry.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      selectedEntry.status === 'posted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}
                  >
                    {selectedEntry.status.toUpperCase()}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">{selectedEntry.description}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Double-entry balanced voucher recorded on {selectedEntry.date}.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <Card className="border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Debit Amount</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      ৳{selectedEntry.debitBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Credit Amount</span>
                    <span className="font-mono font-bold text-blue-400 text-base">
                      ৳{selectedEntry.creditBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Journal Date</span>
                    <span className="font-mono text-foreground">{selectedEntry.date}</span>
                  </div>
                </Card>

                <div className="pt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    onClick={() => {
                      toast.success(`Printing certified journal voucher #${selectedEntry.id}`);
                      setSelectedEntry(null);
                    }}
                  >
                    Print Voucher PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-xs"
                    onClick={() => setSelectedEntry(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Voucher Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="border border-border bg-card text-foreground w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Record Journal Voucher</h3>
                    <p className="text-xs text-muted-foreground">Create balanced double-entry accounting transaction.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Voucher Description *</label>
                  <Input
                    placeholder="e.g. NTTN Transmission fee settlement Sept"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Balanced Amount (BDT) *</label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="h-9 text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Posting Status *</label>
                  <Select value={newStatus} onValueChange={(v) => v && setNewStatus(v as any)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="posted">Post Immediately to General Ledger</SelectItem>
                      <SelectItem value="draft">Save as Pending Draft for Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewModalOpen(false)}
                    className="border-border hover:bg-accent text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                    Post Journal Voucher
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
