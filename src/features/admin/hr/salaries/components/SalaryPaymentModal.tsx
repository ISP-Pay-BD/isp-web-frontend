'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { salaryPaymentSchema, type SalaryPaymentFormValues } from '../schemas';
import { useRecordSalaryPayment, useSalaryBreakdown } from '../hooks/use-salaries';
import type { HrMeta } from '../../shared/types';
import { applyServerErrors } from '../../shared/form-errors';
import { currentPayPeriod, titleCase } from '../../shared/format';
import { CurrencyDisplay } from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SalaryPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: HrMeta;
}

const SERVER_KEYS: Record<string, string> = { employee: 'employeeId', paid_via: 'paidVia', method_trx: 'methodTrx' };

export function SalaryPaymentModal({ open, onOpenChange, meta }: SalaryPaymentModalProps) {
  const period = currentPayPeriod();
  const record = useRecordSalaryPayment();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<SalaryPaymentFormValues>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      employeeId: '',
      month: period.month,
      year: period.year,
      amount: 0,
      status: 'successful',
      paidVia: '',
      methodTrx: '',
      deductAdvances: true,
    },
  });

  const employeeId = watch('employeeId');
  const month = watch('month');
  const year = watch('year');
  const status = watch('status');
  const paidVia = watch('paidVia');
  const deductAdvances = watch('deductAdvances');
  const breakdown = useSalaryBreakdown(employeeId, month, Number(year));

  // Prefill the amount with what is still payable for that month (until the user edits it).
  useEffect(() => {
    if (breakdown.data && !dirtyFields.amount) {
      setValue('amount', breakdown.data.remaining, { shouldValidate: breakdown.data.remaining > 0 });
    }
  }, [breakdown.data, dirtyFields.amount, setValue]);

  const onSubmit = async (values: SalaryPaymentFormValues) => {
    try {
      await record.mutateAsync(values);
      toast.success('Salary payment recorded successfully');
      reset();
      onOpenChange(false);
    } catch (err) {
      applyServerErrors(err, setError, SERVER_KEYS);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Disburse Employee Salary</DialogTitle>
          <DialogDescription>Record a monthly salary payment. Outstanding advances can be recovered from it.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="employeeId">Select Employee *</Label>
            <Select
              items={Object.fromEntries(meta.employees.map((e) => [e.id, e.name]))}
              value={employeeId || null}
              onValueChange={(v) => v && setValue('employeeId', String(v), { shouldValidate: true })}
            >
              <SelectTrigger id="employeeId" className="w-full">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {meta.employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-destructive text-xs">{errors.employeeId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="month">Salary Month *</Label>
              <Select
                items={Object.fromEntries(meta.months.map((m) => [m, m]))}
                value={month}
                onValueChange={(v) => v && setValue('month', String(v), { shouldValidate: true })}
              >
                <SelectTrigger id="month" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meta.months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && <p className="text-destructive text-xs">{errors.month.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" {...register('year', { valueAsNumber: true })} />
              {errors.year && <p className="text-destructive text-xs">{errors.year.message}</p>}
            </div>
          </div>

          {employeeId ? (
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs sm:grid-cols-4">
              {breakdown.isLoading ? (
                <p className="col-span-full text-muted-foreground">Loading salary breakdown…</p>
              ) : breakdown.isError ? (
                <p className="col-span-full text-destructive">{breakdown.error.message}</p>
              ) : breakdown.data ? (
                (
                  [
                    ['Salary', breakdown.data.salary],
                    ['Advance owed', breakdown.data.advance],
                    ['Paid', breakdown.data.netPaid],
                    ['Remaining', breakdown.data.remaining],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground">{label}</p>
                    <CurrencyDisplay amount={value} className="font-semibold" />
                  </div>
                ))
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Net Payable (৳) *</Label>
              <Input id="amount" type="number" step="any" min={0} {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select
                items={Object.fromEntries(meta.paymentStatuses.map((st) => [st, titleCase(st)]))}
                value={status}
                onValueChange={(v) => v && setValue('status', v as SalaryPaymentFormValues['status'], { shouldValidate: true })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meta.paymentStatuses.map((st) => (
                    <SelectItem key={st} value={st}>
                      {titleCase(st)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="paidVia">Payment Method{status === 'successful' ? ' *' : ''}</Label>
              <Select
                items={Object.fromEntries(meta.paidVia.map((p) => [p, p]))}
                value={paidVia || null}
                onValueChange={(v) => v && setValue('paidVia', String(v), { shouldValidate: true })}
              >
                <SelectTrigger id="paidVia" className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {meta.paidVia.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paidVia && <p className="text-destructive text-xs">{errors.paidVia.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="methodTrx">Transaction Ref</Label>
              <Input id="methodTrx" {...register('methodTrx')} />
              {errors.methodTrx && <p className="text-destructive text-xs">{errors.methodTrx.message}</p>}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={deductAdvances} onCheckedChange={(c) => setValue('deductAdvances', c === true)} />
            Recover outstanding advance from this payment
          </label>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
