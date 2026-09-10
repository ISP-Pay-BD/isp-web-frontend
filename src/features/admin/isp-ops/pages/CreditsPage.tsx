'use client';

import { useState, useMemo } from 'react';
import {
  FileBadge,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Download,
  X,
  Eye,
  ShieldAlert,
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
import type { CreditNote } from '@/data/admin/isp-ops.data';

type StatusFilter = 'all' | 'open' | 'applied' | 'void';

export function CreditsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCredit, setSelectedCredit] = useState<CreditNote | null>(null);
  const [isIssueCreditOpen, setIsIssueCreditOpen] = useState(false);

  // New credit form state
  const [newCustomer, setNewCustomer] = useState('');
  const [newAmount, setNewAmount] = useState('500');
  const [newReason, setNewReason] = useState('Outage SLA Goodwill Credit');
  const [newInvoiceNo, setNewInvoiceNo] = useState('INV-2026-0901');

  const rawCredits = useMemo(() => data?.creditNotes ?? [], [data?.creditNotes]);

  // Aggregate Metrics
  const totalCreditBdt = useMemo(
    () => rawCredits.reduce((s, r) => s + r.amountBdt, 0),
    [rawCredits]
  );
  const openCreditBdt = useMemo(
    () => rawCredits.filter((r) => r.status === 'open').reduce((s, r) => s + r.amountBdt, 0),
    [rawCredits]
  );
  const appliedCreditBdt = useMemo(
    () => rawCredits.filter((r) => r.status === 'applied').reduce((s, r) => s + r.amountBdt, 0),
    [rawCredits]
  );
  const openCount = useMemo(
    () => rawCredits.filter((r) => r.status === 'open').length,
    [rawCredits]
  );

  const filteredCredits = useMemo(() => {
    return rawCredits.filter((credit) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          credit.number.toLowerCase().includes(q) ||
          credit.customerName.toLowerCase().includes(q) ||
          (credit.customerPhone && credit.customerPhone.toLowerCase().includes(q)) ||
          (credit.invoiceNo && credit.invoiceNo.toLowerCase().includes(q)) ||
          (credit.area && credit.area.toLowerCase().includes(q)) ||
          credit.reason.toLowerCase().includes(q) ||
          String(credit.amountBdt).includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && credit.status !== statusFilter) return false;
      return true;
    });
  }, [rawCredits, search, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Credit Note #',
      'Date',
      'Subscriber Name',
      'Phone',
      'Area',
      'Amount (BDT)',
      'Invoice Adjusted',
      'Reason',
      'Approved By',
      'Status',
    ];
    const rows = filteredCredits.map((c) => [
      c.number,
      c.at,
      c.customerName,
      c.customerPhone ?? 'N/A',
      c.area ?? 'N/A',
      c.amountBdt,
      c.invoiceNo ?? 'N/A',
      c.reason,
      c.approvedBy ?? 'Admin',
      c.status.toUpperCase(),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `credit_notes_ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Credit notes ledger exported to CSV');
  };

  const handleIssueCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer) {
      toast.error('Please enter subscriber name');
      return;
    }
    toast.success(`Credit Note ৳${newAmount} issued to ${newCustomer}`);
    setIsIssueCreditOpen(false);
    setNewCustomer('');
  };

  if (isLoading) return <PageSkeleton variant="cards" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load credit notes"
        description="Could not connect to accounting adjustment ledger."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Credit Notes & Refund Adjustments"
        subtitle="SLA fiber cut rebates, billing cycle adjustments, and customer goodwill credits"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Collections' },
          { label: 'Credit Notes' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Ledger
            </Button>
            <Button
              size="sm"
              onClick={() => setIsIssueCreditOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Issue Credit Note
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
                Total Credits Issued
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileBadge className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                ৳{totalCreditBdt.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">BDT</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Total goodwill & outage adjustments issued
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Open / Unapplied Credit
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">
                ৳{openCreditBdt.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-medium">({openCount} notes)</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Available to offset future subscriber invoices
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Applied to Invoices
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                ৳{appliedCreditBdt.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-500 font-medium">settled</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Deducted from gross customer receivables
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                SLA Compliance
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-purple-400 font-mono">
                100%
              </span>
              <span className="text-xs text-muted-foreground">reimbursed</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Guaranteed optical uptime credits honored
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by credit note #, customer, invoice or reason..."
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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(
              [
                { key: 'all', label: 'All Notes' },
                { key: 'open', label: `Open (${openCount})` },
                { key: 'applied', label: 'Applied' },
              ] as const
            ).map((pill) => (
              <Button
                key={pill.key}
                type="button"
                size="sm"
                variant={statusFilter === pill.key ? 'default' : 'ghost'}
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  'text-xs h-7 px-2.5 font-medium transition-all',
                  statusFilter === pill.key
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      {filteredCredits.length === 0 ? (
        <EmptyState
          title="No credit notes found"
          description="No credit adjustment records match your criteria."
          actionLabel="Issue Credit Note"
          onAction={() => setIsIssueCreditOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Credit Note # & Date</th>
                  <th className="py-3 px-4">Subscriber & Location</th>
                  <th className="py-3 px-4">Rebate Amount</th>
                  <th className="py-3 px-4">Adjustment Reason</th>
                  <th className="py-3 px-4">Linked Invoice</th>
                  <th className="py-3 px-4">Approval Authority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCredits.map((credit) => {
                  const isOpen = credit.status === 'open';
                  const isApplied = credit.status === 'applied';

                  return (
                    <tr
                      key={credit.id}
                      onClick={() => setSelectedCredit(credit)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors font-mono">
                          {credit.number}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {credit.at}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs">{credit.customerName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className="font-mono">{credit.customerPhone ?? '+880 1700-000000'}</span>
                          {credit.area && <span>· {credit.area}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        -৳{credit.amountBdt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-foreground font-medium truncate max-w-[260px]" title={credit.reason}>
                          {credit.reason}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {credit.invoiceNo ?? 'Unlinked'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {credit.approvedBy ?? 'Admin Desk'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize text-[10px] font-semibold',
                            isOpen && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                            isApplied && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          )}
                        >
                          {credit.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCredit(credit)}
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

      {/* Credit Note Inspector Sheet */}
      <Sheet open={Boolean(selectedCredit)} onOpenChange={(open) => !open && setSelectedCredit(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/80 p-6 space-y-6">
          {selectedCredit && (
            <>
              <SheetHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20"
                  >
                    Credit Note Voucher
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize text-[10px]',
                      selectedCredit.status === 'applied'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}
                  >
                    {selectedCredit.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground font-mono">
                  {selectedCredit.number}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Issued on {selectedCredit.at} · Approved by {selectedCredit.approvedBy ?? 'Accounts Head'}
                </SheetDescription>
              </SheetHeader>

              {/* Amount Tile */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Credit Rebate Value</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    ৳{selectedCredit.amountBdt.toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  BDT ADJUSTMENT
                </Badge>
              </div>

              {/* Justification Details */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Accounting Information
                </h4>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Beneficiary Subscriber</span>
                  <span className="font-semibold text-foreground">{selectedCredit.customerName}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Offset Target Invoice</span>
                  <span className="font-mono text-foreground">{selectedCredit.invoiceNo ?? 'Next Billing Cycle'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/50">
                  <span className="text-muted-foreground">Subscriber Area</span>
                  <span className="text-foreground">{selectedCredit.area ?? 'Dhaka Division'}</span>
                </div>
              </div>

              {/* Reason Note */}
              <div className="p-3 rounded-xl bg-card border border-border/50 space-y-1 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground">Adjustment Reason:</span>
                <p className="text-foreground font-medium leading-relaxed">{selectedCredit.reason}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-border/60">
                {selectedCredit.status === 'open' && (
                  <Button
                    onClick={() => {
                      toast.success(`Credit Note ${selectedCredit.number} applied to pending invoice`);
                      setSelectedCredit(null);
                    }}
                    className="w-full bg-primary text-primary-foreground text-xs font-semibold h-9"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Apply Credit to Current Invoice
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedCredit(null)}
                  className="w-full text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Issue Credit Note Dialog */}
      <Dialog open={isIssueCreditOpen} onOpenChange={setIsIssueCreditOpen}>
        <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus className="h-4 w-4" />
              </div>
              Issue Subscriber Credit Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              Grant goodwill rebate or SLA outage compensation to subscriber account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleIssueCredit} className="space-y-4 pt-2">
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
                <label className="text-xs font-semibold">Rebate Amount (৳ BDT)</label>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Offset Invoice #</label>
                <Input
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Adjustment Reason</label>
              <Select value={newReason} onValueChange={(v) => v && setNewReason(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outage SLA Goodwill Credit">Outage SLA Goodwill Credit</SelectItem>
                  <SelectItem value="Billing Cycle Plan Change Proration">Billing Cycle Plan Change Proration</SelectItem>
                  <SelectItem value="Duplicate Payment Refund Offset">Duplicate Payment Refund Offset</SelectItem>
                  <SelectItem value="Optical Link Degradation Compensation">Optical Link Degradation Compensation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 shadow-xs"
              >
                Authorize & Issue Credit Note
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
