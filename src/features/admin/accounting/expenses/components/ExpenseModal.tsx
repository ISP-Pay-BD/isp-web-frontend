'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseFormValues } from '../schemas';
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

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ExpenseFormValues) => Promise<void>;
}

export function ExpenseModal({ open, onOpenChange, onSave }: ExpenseModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'Bandwidth purchase',
      amountBdt: 25000,
      vendor: 'Summit Communications',
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      await onSave(values);
      toast.success('Expense recorded successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to record expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Operational Expense</DialogTitle>
          <DialogDescription>
            Record upstream bandwidth costs, equipment purchases, utility bills, or rent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Expense Category *</Label>
            <Select value={selectedCategory} onValueChange={(val) => val && setValue('category', val, { shouldValidate: true })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bandwidth purchase">Bandwidth purchase (Upstream)</SelectItem>
                <SelectItem value="Staff salaries">Staff salaries</SelectItem>
                <SelectItem value="ONU equipment">ONU & Router equipment</SelectItem>
                <SelectItem value="Office rent">Office & NOC Rent</SelectItem>
                <SelectItem value="Electricity / Generator">Electricity & Generator Fuel</SelectItem>
                <SelectItem value="SMS credits">SMS credits & Gateways</SelectItem>
                <SelectItem value="Other misc. expense">Other misc. expense</SelectItem>
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
              <Label htmlFor="date">Expense Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor">Vendor / Payee *</Label>
            <Input id="vendor" placeholder="e.g. Summit Communications / Landlord" {...register('vendor')} />
            {errors.vendor && <p className="text-destructive text-xs">{errors.vendor.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Notes / Bill Reference</Label>
            <Textarea id="note" rows={2} placeholder="e.g. Monthly transmission link bill" {...register('note')} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
