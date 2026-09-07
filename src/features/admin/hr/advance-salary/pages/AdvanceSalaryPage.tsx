'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo } from 'react';
import { useAdvanceSalary } from '../hooks/use-advance-salary';
import { PageSkeleton, EmptyState, CurrencyDisplay } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HandCoins, Plus, Check, X, Search, XIcon } from 'lucide-react';
import { toast } from 'sonner';

const statusStyles: Record<string, { badge: string; dot: string }> = {
  approved: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  pending: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  rejected: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
};

export function AdvanceSalaryPage() {
  const { requests, employees, isLoading, isError, refetch, grantAdvance, updateStatus } = useAdvanceSalary();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [grantAmount, setGrantAmount] = useState(5000);
  const [deductMonth, setDeductMonth] = useState('2026-09');
  const [grantReason, setGrantReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalAdvanceApproved = useMemo(() => requests.filter((r) => r.status === 'approved').reduce((sum, r) => sum + (r.amountBdt || 0), 0), [requests]);
  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);
  const resolvedCount = useMemo(() => requests.filter((r) => r.status === 'approved' || r.status === 'rejected').length, [requests]);

  const handleGrantAdvance = async () => {
    if (!selectedEmpId) { toast.error('Please select an employee'); return; }
    if (grantAmount <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      setIsSubmitting(true);
      const emp = employees.find((e) => e.id === selectedEmpId);
      await grantAdvance({ employeeId: selectedEmpId, employeeName: emp?.name ?? 'Staff Member', amountBdt: grantAmount, deductMonth, reason: grantReason || 'Staff emergency request' });
      toast.success('Advance granted and recorded');
      setModalOpen(false);
      setSelectedEmpId('');
      setGrantReason('');
    } catch { toast.error('Failed to grant advance'); } finally { setIsSubmitting(false); }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try { await updateStatus({ id, status }); toast.success(`Advance request ${status}`); }
    catch { toast.error('Failed to update request'); }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load advance salary requests" description="Could not communicate with the employee advance ledger." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <HandCoins className="h-6 w-6" />
            </div>
            Advance Salary Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Review staff advance requests, disburse emergency salary advances, and set deduction schedules.
          </p>
        </div>
        <div >
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <Plus className="h-4 w-4" /> Give Advance
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            <CurrencyDisplay amount={totalAdvanceApproved} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">approved advance</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{pendingCount}</span>{' '}
          <span className="text-muted-foreground">pending</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{resolvedCount}</span>{' '}
          <span className="text-muted-foreground">resolved</span>
        </p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by staff name or reason..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[150px] h-9 text-xs border-border/60"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<HandCoins className="h-10 w-10" />} title="No advance requests found" description="No records matching your search or filters." actionLabel="Give Advance" onAction={() => setModalOpen(true)} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Staff Member</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Reason / Notes</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Requested Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req, idx) => {
                    const stCfg = statusStyles[req.status] || statusStyles.pending;
                    return (
                      <tr key={req.id} className="group border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-[10px] border border-border/60 bg-muted/50 text-muted-foreground">
                              {req.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{req.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400"><CurrencyDisplay amount={req.amountBdt} /></span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{req.reason}</TableCell>
                        <TableCell className="font-mono text-xs">{req.requestedAt}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium gap-1 ${stCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${stCfg.dot}`} />
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <div >
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10" onClick={() => handleUpdateStatus(req.id, 'approved')}>
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </Button>
                              </div>
                              <div >
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                  <X className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono">Processed</span>
                          )}
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      </PageContent>
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grant Advance Salary</DialogTitle>
              <DialogDescription>Provide upfront advance funds directly to the employee. This amount will be deducted during monthly payroll.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="employee">Select Staff Member *</Label>
                <Select value={selectedEmpId} onValueChange={(v) => setSelectedEmpId(v ?? '')}>
                  <SelectTrigger id="employee"><SelectValue placeholder="Choose employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Advance Amount (৳) *</Label>
                  <Input id="amount" type="number" step="500" value={grantAmount} onChange={(e) => setGrantAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deductMonth">Deduct In Month</Label>
                  <Input id="deductMonth" placeholder="YYYY-MM" value={deductMonth} onChange={(e) => setDeductMonth(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason / Emergency Note</Label>
                <Textarea id="reason" rows={2} placeholder="e.g. Medical bill, Family emergency" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleGrantAdvance} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>{isSubmitting ? 'Granting...' : 'Grant Advance'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
