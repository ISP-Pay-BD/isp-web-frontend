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
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { useEmployeeSummary } from '@/features/employee/shared/hooks/use-employee-summary';
import { formatDay } from '@/features/employee/shared/lib/datetime';
import {
  useEmployeeAdvanceRequests,
  useRequestAdvanceSalary,
} from '../hooks/use-employee-advance';
import {
  advanceRequestSchema,
  type AdvanceRequestFormValues,
} from '../schemas/advance-request.schema';
import type { EmployeeAdvanceRequest } from '@/features/employee/shared';

const STATUS_ITEMS = { all: 'All statuses', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', deducted: 'Deducted' };

export function EmployeeAdvanceSalaryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('all');
  const { data, isLoading, isError, error, refetch } = useEmployeeAdvanceRequests(page, pageSize, status);
  const summary = useEmployeeSummary();
  const requestMutation = useRequestAdvanceSalary();
  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;

  const form = useForm<AdvanceRequestFormValues>({
    resolver: zodResolver(advanceRequestSchema),
    defaultValues: { reason: '' },
  });

  const columns = useMemo<LegacyColumnDef<EmployeeAdvanceRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} className="font-semibold" />,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <span className="max-w-xs truncate" title={row.original.reason}>
            {row.original.reason || '—'}
            {row.original.status === 'rejected' && row.original.rejectionReason ? (
              <span className="block text-[11px] text-rose-500">Rejected: {row.original.rejectionReason}</span>
            ) : null}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'requestedAt',
        header: 'Requested',
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.requestedAt) || '—'}</span>,
      },
      {
        id: 'approvedAt',
        header: 'Approved',
        cell: ({ row }) => <span className="tabular-nums">{formatDay(row.original.approvedAt) || '—'}</span>,
      },
      {
        id: 'deductMonth',
        header: 'Deduct In',
        cell: ({ row }) => row.original.deductMonth || '—',
      },
    ],
    [],
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
      <EmployeePageShell title="Advance Salary" subtitle="Loading requests...">
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError) {
    return (
      <EmployeePageShell title="Advance Salary" subtitle="Advance requests and grants">
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  return (
    <EmployeePageShell
      title="Advance Salary"
      subtitle="Request advance salary and track approval status"
      breadcrumbs={[
        { label: 'Employee', href: '/employee/salaries' },
        { label: 'Advance Salary' },
      ]}
      actions={
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Request Advance
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums">{summary.data?.advancePendingCount ?? '—'}</span>{' '}
            <span className="text-muted-foreground">pending</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums">
              {summary.data ? <CurrencyDisplay amount={summary.data.advanceApprovedTotal} /> : '—'}
            </span>{' '}
            <span className="text-muted-foreground">approved, awaiting deduction</span>
          </p>
        </div>

        <FilterBar
          filters={
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4" />
                Your advance requests
              </span>
              <Select
                items={STATUS_ITEMS}
                value={status}
                onValueChange={(v) => {
                  setStatus(v ? String(v) : 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {total === 0 && status === 'all' ? (
          <EmployeeEmptyState
            title="No advance requests"
            description="Submit a request when you need salary advance for emergencies or expenses."
            action={
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Request Advance
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            emptyTitle="No advance requests"
            emptyDescription="No requests with this status."
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
            <DialogTitle>Request Advance Salary</DialogTitle>
            <DialogDescription>
              Submit a request to HR. Approved advances are deducted from your salary.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                step="any"
                {...form.register('amount', { valueAsNumber: true })}
                disabled={requestMutation.isPending}
              />
              {form.formState.errors.amount ? (
                <p className="text-destructive text-xs">{form.formState.errors.amount.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Describe why you need this advance..."
                {...form.register('reason')}
                disabled={requestMutation.isPending}
              />
              {form.formState.errors.reason ? (
                <p className="text-destructive text-xs">{form.formState.errors.reason.message}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </EmployeePageShell>
  );
}
