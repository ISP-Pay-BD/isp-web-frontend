'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect, useState } from 'react';
import { useAdvanceMutations, useAdvanceSalary, useAdvanceSummary } from '../hooks/use-advance-salary';
import type { AdvanceSalaryItem } from '../types';
import { useHrMeta } from '../../shared/use-hr-meta';
import { useDebouncedValue } from '../../shared/use-debounced-value';
import { datePart, initials, titleCase } from '../../shared/format';
import { PageSkeleton, EmptyState, CurrencyDisplay, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
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
import { HandCoins, Plus, Check, X, Search, XIcon, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

const statusStyles: Record<string, { badge: string; dot: string }> = {
  approved: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  pending: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  rejected: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  deducted: { badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500' },
};

const NO_MONTH = '__none__';

export function AdvanceSalaryPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [deductMonth, setDeductMonth] = useState(NO_MONTH);
  const [grantReason, setGrantReason] = useState('');

  const [decision, setDecision] = useState<{ req: AdvanceSalaryItem; mode: 'approve' | 'reject' } | null>(null);
  const [decisionMonth, setDecisionMonth] = useState(NO_MONTH);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const list = useAdvanceSalary({ page, perPage: pageSize, search: debouncedSearch, status: statusFilter });
  const summary = useAdvanceSummary();
  const meta = useHrMeta();
  const { grant, decide, deduct } = useAdvanceMutations();

  const requests = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const employees = meta.data?.employees ?? [];
  const statuses = meta.data?.advanceStatuses ?? [];
  const months = meta.data?.months ?? [];
  const monthItems = Object.fromEntries([[NO_MONTH, 'Not set'], ...months.map((m) => [m, m])]);
  const s = summary.data;

  const openGrant = () => {
    setSelectedEmpId('');
    setGrantAmount('');
    setDeductMonth(NO_MONTH);
    setGrantReason('');
    setModalOpen(true);
  };

  const handleGrantAdvance = () => {
    const amount = Number(grantAmount);
    if (!selectedEmpId) { toast.error('Please select an employee'); return; }
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Enter a valid amount'); return; }
    grant.mutate(
      { employeeId: selectedEmpId, amount, deductMonth: deductMonth === NO_MONTH ? '' : deductMonth, reason: grantReason },
      {
        onSuccess: () => {
          toast.success('Advance granted and recorded');
          setModalOpen(false);
        },
      },
    );
  };

  const openDecision = (req: AdvanceSalaryItem, mode: 'approve' | 'reject') => {
    setDecision({ req, mode });
    setDecisionMonth(req.deductMonth || NO_MONTH);
    setRejectReason('');
  };

  const handleDecision = () => {
    if (!decision) return;
    if (decision.mode === 'reject' && !rejectReason.trim()) { toast.error('Enter a rejection reason'); return; }
    decide.mutate(
      decision.mode === 'approve'
        ? { id: decision.req.id, status: 'approved', deductMonth: decisionMonth === NO_MONTH ? '' : decisionMonth }
        : { id: decision.req.id, status: 'rejected', rejectionReason: rejectReason },
      {
        onSuccess: () => {
          toast.success(`Advance request ${decision.mode === 'approve' ? 'approved' : 'rejected'}`);
          setDecision(null);
        },
      },
    );
  };

  const handleDeduct = (req: AdvanceSalaryItem) => {
    deduct.mutate(req.id, { onSuccess: () => toast.success('Advance marked as deducted') });
  };

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load advance salary requests" description={list.error?.message ?? 'Could not communicate with the employee advance ledger.'} actionLabel="Retry" onAction={() => list.refetch()} />
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
          <Button onClick={openGrant} disabled={!meta.data} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <Plus className="h-4 w-4" /> Give Advance
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.approvedTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">approved advance</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s?.pendingCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">pending</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s ? s.approvedCount + s.rejectedCount + s.deductedCount : '—'}</span>{' '}
          <span className="text-muted-foreground">resolved</span>
        </p>
      </div>

      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
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
                <Select
                  items={Object.fromEntries([['all', 'All Status'], ...statuses.map((st) => [st, titleCase(st)])])}
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v ?? 'all')}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs border-border/60"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((st) => <SelectItem key={st} value={st}>{titleCase(st)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">{total} result{total !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={<HandCoins className="h-10 w-10" />} title="No advance requests found" description={debouncedSearch || statusFilter !== 'all' ? 'No records matching your search or filters.' : 'Advance requests from staff and advances you grant will appear here.'} actionLabel={meta.data ? 'Give Advance' : undefined} onAction={meta.data ? openGrant : undefined} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Staff Member</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Reason / Notes</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Requested Date</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Deduct Month</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req, idx) => {
                    const stCfg = statusStyles[req.status] || statusStyles.pending;
                    return (
                      <tr key={req.id} className="group border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-mono text-xs">{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-[10px] border border-border/60 bg-muted/50 text-muted-foreground">
                              {initials(req.employeeName)}
                            </div>
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{req.employeeName || `#${req.employeeId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400"><CurrencyDisplay amount={req.amount} /></span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {req.reason || '—'}
                          {req.status === 'rejected' && req.rejectionReason ? (
                            <div className="text-[11px] text-rose-500">Rejected: {req.rejectionReason}</div>
                          ) : null}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{datePart(req.createdAt) || '—'}</TableCell>
                        <TableCell className="text-xs">{req.deductMonth || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium gap-1 ${stCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${stCfg.dot}`} />
                            {titleCase(req.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10" onClick={() => openDecision(req, 'approve')}>
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10" onClick={() => openDecision(req, 'reject')}>
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          ) : req.status === 'approved' ? (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary" disabled={deduct.isPending} onClick={() => handleDeduct(req)}>
                              <MinusCircle className="h-3.5 w-3.5" /> Mark Deducted
                            </Button>
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
          <TablePagination
            currentPage={list.data?.meta.page ?? page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
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
                <Select
                  items={Object.fromEntries(employees.map((e) => [e.id, e.name]))}
                  value={selectedEmpId || null}
                  onValueChange={(v) => setSelectedEmpId(v ? String(v) : '')}
                >
                  <SelectTrigger id="employee" className="w-full"><SelectValue placeholder="Choose employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Advance Amount (৳) *</Label>
                  <Input id="amount" type="number" min={1} step="any" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deductMonth">Deduct In Month</Label>
                  <Select items={monthItems} value={deductMonth} onValueChange={(v) => setDeductMonth(v ? String(v) : NO_MONTH)}>
                    <SelectTrigger id="deductMonth" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MONTH}>Not set</SelectItem>
                      {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason / Note</Label>
                <Textarea id="reason" rows={2} value={grantReason} onChange={(e) => setGrantReason(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={grant.isPending}>Cancel</Button>
              <Button onClick={handleGrantAdvance} className="bg-primary hover:bg-primary/90" disabled={grant.isPending}>{grant.isPending ? 'Granting...' : 'Grant Advance'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {decision && (
        <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{decision.mode === 'approve' ? 'Approve Advance' : 'Reject Advance'}</DialogTitle>
              <DialogDescription>
                {decision.req.employeeName} requested <CurrencyDisplay amount={decision.req.amount} className="inline" />.
              </DialogDescription>
            </DialogHeader>
            {decision.mode === 'approve' ? (
              <div className="space-y-1.5 py-2">
                <Label htmlFor="decisionMonth">Deduct In Month</Label>
                <Select items={monthItems} value={decisionMonth} onValueChange={(v) => setDecisionMonth(v ? String(v) : NO_MONTH)}>
                  <SelectTrigger id="decisionMonth" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MONTH}>Not set</SelectItem>
                    {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5 py-2">
                <Label htmlFor="rejectReason">Rejection Reason *</Label>
                <Textarea id="rejectReason" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDecision(null)} disabled={decide.isPending}>Cancel</Button>
              <Button
                onClick={handleDecision}
                disabled={decide.isPending}
                className={decision.mode === 'approve' ? 'bg-primary hover:bg-primary/90' : 'bg-destructive text-white hover:bg-destructive/90'}
              >
                {decide.isPending ? 'Saving...' : decision.mode === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
