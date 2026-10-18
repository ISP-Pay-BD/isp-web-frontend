'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, Wallet } from 'lucide-react';
import { DataTable } from '@/features/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useUrlParam } from '@/hooks/use-url-state';
import { useLocale } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { formatDay, formatMonthName } from '@/features/employee/shared/lib/datetime';
import { statusLabel } from '@/features/employee/shared/lib/labels';
import {
  useEmployeeAdvanceRequests,
  useRequestAdvanceSalary,
} from '../hooks/use-employee-advance';
import {
  advanceRequestSchema,
  type AdvanceRequestFormValues,
} from '../schemas/advance-request.schema';
import type { EmployeeAdvanceRequest } from '@/features/employee/shared';

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'deducted'] as const;
type StatusFilter = (typeof STATUSES)[number];

export function EmployeeAdvanceSalaryPage() {
  const { t, te } = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [statusParam, setStatusParam] = useUrlParam('status');
  const status: StatusFilter = (STATUSES as readonly string[]).includes(statusParam) ? (statusParam as StatusFilter) : 'all';
  const { data, isLoading, isError, error, refetch } = useEmployeeAdvanceRequests(page, pageSize, status);
  const summary = useEmployeeSummary();
  const requestMutation = useRequestAdvanceSalary();
  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;

  const statusItems: Record<StatusFilter, string> = {
    all: t('employee.advanceSalary.filterAll', 'All statuses'),
    pending: statusLabel(t, 'pending'),
    approved: statusLabel(t, 'approved'),
    rejected: statusLabel(t, 'rejected'),
    deducted: statusLabel(t, 'deducted'),
  };

  const form = useForm<AdvanceRequestFormValues>({
    resolver: zodResolver(advanceRequestSchema),
    defaultValues: { reason: '' },
  });

  const columns = useMemo<LegacyColumnDef<EmployeeAdvanceRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'amount',
        header: t('employee.advanceSalary.colAmount', 'Amount'),
        meta: { mobile: 'title' },
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} className="font-semibold" />,
      },
      {
        accessorKey: 'reason',
        header: t('employee.advanceSalary.colReason', 'Reason'),
        cell: ({ row }) => (
          <div className="max-w-xs min-w-0">
            <p className="line-clamp-2 break-words" title={row.original.reason}>
              {row.original.reason || '—'}
            </p>
            {row.original.status === 'rejected' && row.original.rejectionReason ? (
              <p className="text-destructive text-xs break-words">
                {t('employee.advanceSalary.rejectedReason', 'Rejected: {reason}', { reason: row.original.rejectionReason })}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('employee.common.colStatus', 'Status'),
        meta: { mobile: 'status' },
        cell: ({ row }) => <StatusBadge status={row.original.status} label={statusLabel(t, row.original.status)} />,
      },
      {
        id: 'requestedAt',
        header: t('employee.advanceSalary.colRequested', 'Requested'),
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.requestedAt) || '—'}</span>,
      },
      {
        id: 'approvedAt',
        header: t('employee.advanceSalary.colApproved', 'Approved'),
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.approvedAt) || '—'}</span>,
      },
      {
        id: 'deductMonth',
        header: t('employee.advanceSalary.colDeductIn', 'Deduct In'),
        cell: ({ row }) => formatMonthName(row.original.deductMonth) || '—',
      },
    ],
    [t],
  );

  const onSubmit = form.handleSubmit((values) => {
    requestMutation.mutate(values, {
      onSuccess: () => {
        form.reset({ reason: '' });
        setDialogOpen(false);
      },
    });
  });

  if (isLoading) {
    return (
      <EmployeePageShell
        title={t('employee.advanceSalary.title', 'Advance Salary')}
        subtitle={t('employee.advanceSalary.loadingSubtitle', 'Loading requests...')}
      >
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError) {
    return (
      <EmployeePageShell
        title={t('employee.advanceSalary.title', 'Advance Salary')}
        subtitle={t('employee.advanceSalary.errorSubtitle', 'Advance requests and grants')}
      >
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  return (
    <EmployeePageShell
      title={t('employee.advanceSalary.title', 'Advance Salary')}
      subtitle={t('employee.advanceSalary.subtitle', 'Request advance salary and track approval status')}
      breadcrumbs={[
        { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/salaries' },
        { label: t('employee.advanceSalary.breadcrumb', 'Advance Salary') },
      ]}
      actions={
        <Button onClick={() => setDialogOpen(true)} className="h-11 w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden />
          {t('employee.advanceSalary.request', 'Request Advance')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{summary.data?.advancePendingCount ?? '—'}</span>{' '}
            <span className="text-muted-foreground">{t('employee.advanceSalary.pending', 'pending')}</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.advanceApprovedTotal} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">
              {t('employee.advanceSalary.approvedAwaiting', 'approved, awaiting deduction')}
            </span>
          </p>
        </div>

        <FilterBar
          filters={
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4" aria-hidden />
                {t('employee.advanceSalary.yourRequests', 'Your advance requests')}
              </span>
              <Select
                items={statusItems}
                value={status}
                onValueChange={(v) => {
                  setStatusParam(v && v !== 'all' ? String(v) : '');
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full text-sm data-[size=default]:h-11 sm:w-[170px]"
                  aria-label={t('employee.advanceSalary.filterLabel', 'Filter by status')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value} className="min-h-11">
                      {statusItems[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {total === 0 && status === 'all' ? (
          <EmployeeEmptyState
            title={t('employee.advanceSalary.empty', 'No advance requests')}
            description={t('employee.advanceSalary.emptyHint', 'Submit a request when you need salary advance for emergencies or expenses.')}
            action={
              <Button onClick={() => setDialogOpen(true)} className="h-11 gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                {t('employee.advanceSalary.request', 'Request Advance')}
              </Button>
            }
          />
        ) : (
          <DataTable
            urlState
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            emptyTitle={t('employee.advanceSalary.empty', 'No advance requests')}
            emptyDescription={t('employee.advanceSalary.emptyFiltered', 'No requests with this status.')}
            server={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employee.advanceSalary.dialogTitle', 'Request Advance Salary')}</DialogTitle>
            <DialogDescription>
              {t('employee.advanceSalary.dialogDescription', 'Submit a request to HR. Approved advances are deducted from your salary.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('employee.advanceSalary.amountLabel', 'Amount (৳)')}</Label>
              <Input
                id="amount"
                className="h-11"
                type="number"
                min={1}
                step="any"
                {...form.register('amount', { valueAsNumber: true })}
                disabled={requestMutation.isPending}
              />
              {form.formState.errors.amount ? (
                <p className="text-destructive text-xs">{te(form.formState.errors.amount.message ?? '')}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">{t('employee.advanceSalary.reasonLabel', 'Reason')}</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder={t('employee.advanceSalary.reasonPlaceholder', 'Describe why you need this advance...')}
                {...form.register('reason')}
                disabled={requestMutation.isPending}
              />
              {form.formState.errors.reason ? (
                <p className="text-destructive text-xs">{te(form.formState.errors.reason.message ?? '')}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="h-11 sm:h-8" onClick={() => setDialogOpen(false)}>
                {t('employee.common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" className="h-11 sm:h-8" disabled={requestMutation.isPending}>
                {requestMutation.isPending
                  ? t('employee.advanceSalary.submitting', 'Submitting...')
                  : t('employee.advanceSalary.submit', 'Submit Request')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </EmployeePageShell>
  );
}
