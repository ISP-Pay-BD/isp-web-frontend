'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, Wallet } from 'lucide-react';
import { DataTable } from '@/features/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DateDisplay } from '@/components/shared/DateDisplay';
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
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeEmptyState,
  EmployeeErrorState,
} from '@/features/employee/shared';
import {
  useEmployeeAdvanceRequests,
  useRequestAdvanceSalary,
} from '../hooks/use-employee-advance';
import {
  advanceRequestSchema,
  type AdvanceRequestFormValues,
} from '../schemas/advance-request.schema';
import type { EmployeeAdvanceRequest } from '@/features/employee/shared';

export function EmployeeAdvanceSalaryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useEmployeeAdvanceRequests();
  const requestMutation = useRequestAdvanceSalary();
  const items = data?.items ?? [];

  const form = useForm<AdvanceRequestFormValues>({
    resolver: zodResolver(advanceRequestSchema),
    defaultValues: { amountBdt: 5000, reason: '' },
  });

  const columns = useMemo<LegacyColumnDef<EmployeeAdvanceRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'amountBdt',
        header: 'Amount',
        cell: ({ row }) => <CurrencyDisplay amount={row.original.amountBdt} className="font-semibold" />,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <span className="max-w-xs truncate" title={row.original.reason}>
            {row.original.reason}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'requestedAt',
        header: 'Requested',
        cell: ({ row }) => <DateDisplay value={row.original.requestedAt} />,
      },
      {
        id: 'approvedAt',
        header: 'Approved',
        cell: ({ row }) =>
          row.original.approvedAt ? <DateDisplay value={row.original.approvedAt} /> : '—',
      },
    ],
    [],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await requestMutation.mutateAsync(values);
    form.reset({ amountBdt: 5000, reason: '' });
    setDialogOpen(false);
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
        <EmployeeErrorState onRetry={() => refetch()} />
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
        <FilterBar
          filters={
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4" />
              Your advance requests
            </span>
          }
        />

        {items.length === 0 ? (
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
            searchKey="reason"
            searchPlaceholder="Filter by reason..."
            facetFilters={[{ columnId: 'status', title: 'Status' }]}
            emptyTitle="No advance requests"
            emptyDescription="Submit a request when you need salary advance."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Advance Salary</DialogTitle>
            <DialogDescription>
              Submit a request to HR. Approved advances are deducted from your next salary.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountBdt">Amount (৳)</Label>
              <Input
                id="amountBdt"
                type="number"
                step="100"
                {...form.register('amountBdt', { valueAsNumber: true })}
                disabled={requestMutation.isPending}
              />
              {form.formState.errors.amountBdt ? (
                <p className="text-destructive text-xs">{form.formState.errors.amountBdt.message}</p>
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
