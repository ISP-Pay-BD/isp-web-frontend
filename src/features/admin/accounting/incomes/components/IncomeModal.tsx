'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSchema, type IncomeFormValues } from '../schemas';
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

interface IncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: IncomeFormValues) => Promise<void>;
}

export function IncomeModal({ open, onOpenChange, onSave }: IncomeModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      category: 'Customer collections',
      amountBdt: 10000,
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      bankAccount: 'Main Cash Drawer',
      note: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedMethod = watch('method');

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      await onSave(values);
      toast.success('Income recorded successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to record income');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Revenue & Incomes</DialogTitle>
          <DialogDescription>
            Enter daily cash receipts, subscriber collections, installation fees, or POP funding.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Income Category *</Label>
            <Select value={selectedCategory} onValueChange={(val) => val && setValue('category', val, { shouldValidate: true })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer collections">Customer collections</SelectItem>
                <SelectItem value="Installation charges">Installation charges</SelectItem>
                <SelectItem value="POP funding">POP funding</SelectItem>
                <SelectItem value="Router / Equipment sales">Router / Equipment sales</SelectItem>
                <SelectItem value="Other misc. revenue">Other misc. revenue</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amountBdt">Amount (৳) *</Label>
              <Input id="amountBdt" type="number" step="10" {...register('amountBdt')} />
              {errors.amountBdt && <p className="text-destructive text-xs">{errors.amountBdt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Receipt Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={selectedMethod} onValueChange={(val) => val && setValue('method', val, { shouldValidate: true })}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash in hand</SelectItem>
                <SelectItem value="bkash">bKash Merchant</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="bank">Bank Deposit</SelectItem>
                <SelectItem value="mixed">Mixed / Aggregated</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-destructive text-xs">{errors.method.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Notes / Reference (Optional)</Label>
            <Textarea id="note" rows={2} placeholder="e.g. 5 new fiber installations in Sector 7" {...register('note')} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
