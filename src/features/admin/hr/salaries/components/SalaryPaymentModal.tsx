'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salaryPaymentSchema, type SalaryPaymentFormValues } from '../schemas';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SalaryPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: { id: string; name: string; salaryBdt?: number }[];
  onSave: (values: SalaryPaymentFormValues, employeeName: string) => Promise<void>;
}

export function SalaryPaymentModal({ open, onOpenChange, employees, onSave }: SalaryPaymentModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SalaryPaymentFormValues>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      employeeId: '',
      month: '2026-09',
      amountBdt: 20000,
      paidVia: 'Bank Transfer (City Bank)',
      notes: '',
    },
  });

  const selectedEmployeeId = watch('employeeId');
  const selectedPaidVia = watch('paidVia');

  const handleSelectEmployee = (empId: string | null) => {
    if (!empId) return;
    setValue('employeeId', empId, { shouldValidate: true });
    const emp = employees.find((e) => e.id === empId);
    if (emp?.salaryBdt) {
      setValue('amountBdt', emp.salaryBdt);
    }
  };

  const onSubmit = async (values: SalaryPaymentFormValues) => {
    try {
      const emp = employees.find((e) => e.id === values.employeeId);
      await onSave(values, emp?.name ?? 'Staff Member');
      toast.success('Salary payment recorded successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to record salary payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Disburse Employee Salary</DialogTitle>
          <DialogDescription>
            Record monthly salary disbursement with payment method and deduction reference.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="employeeId">Select Employee *</Label>
            <Select value={selectedEmployeeId} onValueChange={handleSelectEmployee}>
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} {emp.salaryBdt ? `(৳${emp.salaryBdt})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-destructive text-xs">{errors.employeeId.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="month">Salary Month *</Label>
              <Input id="month" placeholder="YYYY-MM (e.g. 2026-09)" {...register('month')} />
              {errors.month && <p className="text-destructive text-xs">{errors.month.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amountBdt">Net Payable Amount (৳) *</Label>
              <Input id="amountBdt" type="number" step="100" {...register('amountBdt')} />
              {errors.amountBdt && <p className="text-destructive text-xs">{errors.amountBdt.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paidVia">Payment Method / Source *</Label>
            <Select value={selectedPaidVia} onValueChange={(val) => val && setValue('paidVia', val, { shouldValidate: true })}>
              <SelectTrigger id="paidVia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer (City Bank)">City Bank Corp Account</SelectItem>
                <SelectItem value="Bank Transfer (BRAC Bank)">BRAC Bank Operations</SelectItem>
                <SelectItem value="bKash Merchant">bKash Merchant Wallet</SelectItem>
                <SelectItem value="Nagad Business">Nagad Business</SelectItem>
                <SelectItem value="Cash (Petty Cash)">Petty Cash Counter</SelectItem>
              </SelectContent>
            </Select>
            {errors.paidVia && <p className="text-destructive text-xs">{errors.paidVia.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Remarks / Voucher Ref</Label>
            <Textarea id="notes" placeholder="Optional notes or cheque number" rows={2} {...register('notes')} />
          </div>

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
