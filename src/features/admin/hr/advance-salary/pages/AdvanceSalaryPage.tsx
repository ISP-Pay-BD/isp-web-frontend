'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useAdvanceMutations, useAdvanceSalary, useAdvanceSummary } from '../hooks/use-advance-salary';
import type { AdvanceSalaryItem } from '../types';
import { useHrMeta } from '../../shared/use-hr-meta';
import { datePart, initials } from '../../shared/format';
import { hrStatusLabel, monthLabel } from '../../shared/labels';
import { useTranslations } from '@/i18n/locale-context';
import { PageSkeleton, EmptyState, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { HandCoins, Plus, Check, X, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

const NO_MONTH = '__none__';

export function AdvanceSalaryPage() {
  const t = useTranslations();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [deductMonth, setDeductMonth] = useState(NO_MONTH);
  const [grantReason, setGrantReason] = useState('');

  const [decision, setDecision] = useState<{ req: AdvanceSalaryItem; mode: 'approve' | 'reject' } | null>(null);
  const [decisionMonth, setDecisionMonth] = useState(NO_MONTH);
  const [rejectReason, setRejectReason] = useState('');

  const list = useAdvanceSalary({ page: table.page, perPage: table.pageSize, search: table.search, status: statusFilter });
  const summary = useAdvanceSummary();
  const meta = useHrMeta();
  const { grant, decide, deduct } = useAdvanceMutations();

  const requests = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const employees = meta.data?.employees ?? [];
  const statuses = meta.data?.advanceStatuses ?? [];
  const months = meta.data?.months ?? [];
  const monthItems = Object.fromEntries([[NO_MONTH, t('admin.hr.advance.notSet', 'Not set')], ...months.map((m) => [m, monthLabel(t, m)])]);
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
    if (!selectedEmpId) { toast.error(t('admin.hr.advance.selectEmployee', 'Please select an employee')); return; }
    if (!Number.isFinite(amount) || amount <= 0) { toast.error(t('admin.hr.advance.invalidAmount', 'Enter a valid amount')); return; }
    grant.mutate(
      { employeeId: selectedEmpId, amount, deductMonth: deductMonth === NO_MONTH ? '' : deductMonth, reason: grantReason },
      {
        onSuccess: () => {
          toast.success(t('admin.hr.advance.granted', 'Advance granted and recorded'));
          setModalOpen(false);
        },
      },
    );
  };

  const openDecision = useCallback((req: AdvanceSalaryItem, mode: 'approve' | 'reject') => {
    setDecision({ req, mode });
    setDecisionMonth(req.deductMonth || NO_MONTH);
    setRejectReason('');
  }, []);

  const handleDecision = () => {
    if (!decision) return;
    if (decision.mode === 'reject' && !rejectReason.trim()) { toast.error(t('admin.hr.advance.rejectReasonRequired', 'Enter a rejection reason')); return; }
    decide.mutate(
      decision.mode === 'approve'
        ? { id: decision.req.id, status: 'approved', deductMonth: decisionMonth === NO_MONTH ? '' : decisionMonth }
        : { id: decision.req.id, status: 'rejected', rejectionReason: rejectReason },
      {
        onSuccess: () => {
          toast.success(decision.mode === 'approve' ? t('admin.hr.advance.approvedToast', 'Advance request approved') : t('admin.hr.advance.rejectedToast', 'Advance request rejected'));
          setDecision(null);
        },
      },
    );
  };

  const { mutate: deductMutate, isPending: deducting } = deduct;

  const columns = useMemo<LegacyColumnDef<AdvanceSalaryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'employeeName',
        header: t('admin.hr.advance.colStaff', 'Staff Member'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-semibold text-xs border border-border/60 bg-muted/50 text-muted-foreground">
                {initials(req.employeeName)}
              </div>
              <span className="font-semibold text-sm">{req.employeeName || `#${req.employeeId}`}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: t('admin.hr.advance.colAmount', 'Amount'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400"><CurrencyDisplay amount={row.original.amount} /></span>
        ),
      },
      {
        accessorKey: 'reason',
        header: t('admin.hr.advance.colReason', 'Reason / Notes'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm">
            {row.original.reason || '—'}
            {row.original.status === 'rejected' && row.original.rejectionReason ? (
              <div className="text-xs text-rose-500">{t('admin.hr.advance.rejectedReason', 'Rejected: {reason}', { reason: row.original.rejectionReason })}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.hr.advance.colRequested', 'Requested Date'),
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs">{datePart(row.original.createdAt) || '—'}</span>,
      },
      {
        accessorKey: 'deductMonth',
        header: t('admin.hr.advance.colDeductMonth', 'Deduct Month'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-xs">{row.original.deductMonth || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} label={hrStatusLabel(t, row.original.status)} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.hr.details.colAction', 'Action')}</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const req = row.original;
          if (req.status === 'pending') {
            return (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10" onClick={() => openDecision(req, 'approve')}>
                  <Check className="h-3.5 w-3.5" /> {t('admin.hr.advance.approve', 'Approve')}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive hover:bg-destructive/10" onClick={() => openDecision(req, 'reject')}>
                  <X className="h-3.5 w-3.5" /> {t('admin.hr.advance.reject', 'Reject')}
                </Button>
              </div>
            );
          }
          if (req.status === 'approved') {
            return (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs hover:bg-primary/10 hover:text-primary"
                  disabled={deducting}
                  onClick={() => deductMutate(req.id, { onSuccess: () => toast.success(t('admin.hr.advance.deductedToast', 'Advance marked as deducted')) })}
                >
                  <MinusCircle className="h-3.5 w-3.5" /> {t('admin.hr.advance.markDeducted', 'Mark Deducted')}
                </Button>
              </div>
            );
          }
          return <div className="text-right"><span className="text-muted-foreground text-xs font-mono">{t('admin.hr.advance.processed', 'Processed')}</span></div>;
        },
      },
    ],
    [openDecision, deductMutate, deducting, t],
  );

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.hr.advance.loadFailed', 'Failed to load advance salary requests')} description={list.error?.message ?? t('admin.hr.advance.loadFailedHint', 'Could not communicate with the employee advance ledger.')} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
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
            {t('admin.hr.advance.title', 'Advance Salary Management')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t('admin.hr.advance.subtitle', 'Review staff advance requests, disburse emergency salary advances, and set deduction schedules.')}
          </p>
        </div>
        <div >
          <Button onClick={openGrant} disabled={!meta.data} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <Plus className="h-4 w-4" /> {t('admin.hr.advance.giveAdvance', 'Give Advance')}
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6">

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">
            {s ? <CurrencyDisplay amount={s.approvedTotal} className="inline font-semibold" /> : '—'}
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.advance.kpiApproved', 'approved advance')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s?.pendingCount ?? '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.advance.kpiPending', 'pending')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{s ? s.approvedCount + s.rejectedCount + s.deductedCount : '—'}</span>{' '}
          <span className="text-muted-foreground">{t('admin.hr.advance.kpiResolved', 'resolved')}</span>
        </p>
      </div>

      <DataTable
        urlState
        columns={columns}
        data={requests}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.hr.advance.searchPlaceholder', 'Search by staff name or reason...')}
        emptyTitle={t('admin.hr.advance.emptyTitle', 'No advance requests found')}
        emptyDescription={
          table.search || statusFilter !== 'all'
            ? t('admin.hr.advance.emptyFiltered', 'No records matching your search or filters.')
            : t('admin.hr.advance.emptyNone', 'Advance requests from staff and advances you grant will appear here.')
        }
        server={table.server(total)}
        toolbarActions={
          <Select
            items={Object.fromEntries([['all', t('admin.hr.advance.allStatus', 'All Status')], ...statuses.map((st) => [st, hrStatusLabel(t, st)])])}
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v ?? 'all');
              table.resetPage();
            }}
          >
            <SelectTrigger className="w-[170px] h-9 text-xs border-border/60" aria-label={t('admin.hr.advance.filterStatus', 'Filter by status')}><SelectValue placeholder={t('admin.hr.advance.allStatus', 'All Status')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.hr.advance.allStatus', 'All Status')}</SelectItem>
              {statuses.map((st) => <SelectItem key={st} value={st}>{hrStatusLabel(t, st)}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      </PageContent>
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('admin.hr.advance.grantTitle', 'Grant Advance Salary')}</DialogTitle>
              <DialogDescription>{t('admin.hr.advance.grantDesc', 'Provide upfront advance funds directly to the employee. This amount will be deducted during monthly payroll.')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="employee">{t('admin.hr.advance.staffLabel', 'Select Staff Member *')}</Label>
                <Select
                  items={Object.fromEntries(employees.map((e) => [e.id, e.name]))}
                  value={selectedEmpId || null}
                  onValueChange={(v) => setSelectedEmpId(v ? String(v) : '')}
                >
                  <SelectTrigger id="employee" className="w-full"><SelectValue placeholder={t('admin.hr.salaryForm.chooseEmployee', 'Choose employee')} /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">{t('admin.hr.advance.amountLabel', 'Advance Amount (৳) *')}</Label>
                  <Input id="amount" type="number" min={1} step="any" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deductMonth">{t('admin.hr.advance.deductIn', 'Deduct In Month')}</Label>
                  <Select items={monthItems} value={deductMonth} onValueChange={(v) => setDeductMonth(v ? String(v) : NO_MONTH)}>
                    <SelectTrigger id="deductMonth" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MONTH}>{t('admin.hr.advance.notSet', 'Not set')}</SelectItem>
                      {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(t, m)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">{t('admin.hr.advance.reasonLabel', 'Reason / Note')}</Label>
                <Textarea id="reason" rows={2} value={grantReason} onChange={(e) => setGrantReason(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={grant.isPending}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleGrantAdvance} className="bg-primary hover:bg-primary/90" disabled={grant.isPending}>{grant.isPending ? t('admin.hr.advance.granting', 'Granting...') : t('admin.hr.advance.grant', 'Grant Advance')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {decision && (
        <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{decision.mode === 'approve' ? t('admin.hr.advance.approveTitle', 'Approve Advance') : t('admin.hr.advance.rejectTitle', 'Reject Advance')}</DialogTitle>
              <DialogDescription>
                {t('admin.hr.advance.requested', '{name} requested', { name: decision.req.employeeName })} <CurrencyDisplay amount={decision.req.amount} className="inline" />
              </DialogDescription>
            </DialogHeader>
            {decision.mode === 'approve' ? (
              <div className="space-y-1.5 py-2">
                <Label htmlFor="decisionMonth">{t('admin.hr.advance.deductIn', 'Deduct In Month')}</Label>
                <Select items={monthItems} value={decisionMonth} onValueChange={(v) => setDecisionMonth(v ? String(v) : NO_MONTH)}>
                  <SelectTrigger id="decisionMonth" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MONTH}>{t('admin.hr.advance.notSet', 'Not set')}</SelectItem>
                    {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(t, m)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5 py-2">
                <Label htmlFor="rejectReason">{t('admin.hr.advance.rejectReasonLabel', 'Rejection Reason *')}</Label>
                <Textarea id="rejectReason" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDecision(null)} disabled={decide.isPending}>{t('common.cancel', 'Cancel')}</Button>
              <Button
                onClick={handleDecision}
                disabled={decide.isPending}
                className={decision.mode === 'approve' ? 'bg-primary hover:bg-primary/90' : 'bg-destructive text-white hover:bg-destructive/90'}
              >
                {decide.isPending ? t('admin.hr.advance.saving', 'Saving...') : decision.mode === 'approve' ? t('admin.hr.advance.approve', 'Approve') : t('admin.hr.advance.reject', 'Reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
