'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState, TableSkeleton } from '@/components/shared';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { num } from '@/lib/api/case';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { OptionSelect } from '@/features/admin/inventory/shared/OptionSelect';
import { FieldError, fieldError } from '@/features/admin/inventory/shared/form-utils';
import { todayYmd } from '@/features/admin/inventory/shared/table-utils';
import type { BillPayments } from '../api';
import { useBillPayments, useRecordBillPayment } from '../hooks/use-purchase-bills';

interface RecordPaymentDialogProps {
  /** requisition_id of the purchase bill; null = closed. */
  rid: string | null;
  onOpenChange: (open: boolean) => void;
}

/** POST /v1/purchase-bills/{rid}/payments (amount ≤ due, method from the bill's `payment_methods`). */
export function RecordPaymentDialog({ rid, onOpenChange }: RecordPaymentDialogProps) {
  return (
    <Dialog open={rid !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {rid ? <PaymentBody rid={rid} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PaymentBody({ rid, onDone }: { rid: string; onDone: () => void }) {
  const payments = useBillPayments(rid);
  if (payments.isLoading) {
    return (
      <div className="py-4">
        <TableSkeleton rows={3} />
      </div>
    );
  }
  if (payments.isError || !payments.data) {
    return (
      <EmptyState
        title="Failed to load bill payments"
        description={errorMessage(payments.error)}
        actionLabel="Retry"
        onAction={() => payments.refetch()}
      />
    );
  }
  return <PaymentForm rid={rid} info={payments.data} onDone={onDone} />;
}

function PaymentForm({ rid, info, onDone }: { rid: string; info: BillPayments; onDone: () => void }) {
  const [amount, setAmount] = useState(info.dueAmount > 0 ? String(info.dueAmount) : '');
  const [paymentDate, setPaymentDate] = useState(todayYmd());
  const [method, setMethod] = useState(info.paymentMethods[0] ?? '');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<Record<string, string>>({});
  const record = useRecordBillPayment();
  const err = record.error;
  const errorFor = (key: string) => localError[key] ?? fieldError(err, key);
  const methodOptions = info.paymentMethods.map((m) => ({ value: m, label: m }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = num(amount, NaN);
    const errors: Record<string, string> = {};
    if (!Number.isFinite(value) || value <= 0) errors.amount = 'Amount must be greater than 0';
    else if (value > info.dueAmount + 0.009) errors.amount = `Amount cannot exceed the due ${formatBdtWithSymbol(info.dueAmount)}`;
    if (!method) errors.payment_method = 'Select a payment method';
    setLocalError(errors);
    if (Object.keys(errors).length > 0) return;

    record.mutate(
      {
        rid,
        body: {
          amount: value,
          payment_date: paymentDate || undefined,
          payment_method: method,
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Payment of ${formatBdtWithSymbol(value)} recorded for ${rid}`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Record Payment · {rid}
        </DialogTitle>
        <DialogDescription>
          Bill total {formatBdtWithSymbol(info.total)} · paid {formatBdtWithSymbol(info.paidAmount)} · due{' '}
          <span className="font-semibold text-foreground">{formatBdtWithSymbol(info.dueAmount)}</span>
        </DialogDescription>
      </DialogHeader>

      {info.dueAmount <= 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">This bill is fully paid.</p>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">Amount (BDT) *</Label>
              <Input
                id="pay-amount"
                type="number"
                min={0}
                max={info.dueAmount}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={Boolean(errorFor('amount')) || undefined}
                required
              />
              <FieldError message={errorFor('amount')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Payment Date</Label>
              <Input id="pay-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="font-mono" />
              <FieldError message={errorFor('payment_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Payment Method *</Label>
            <OptionSelect
              id="pay-method"
              value={method}
              onChange={setMethod}
              options={methodOptions}
              placeholder={methodOptions.length === 0 ? 'No payment methods configured' : 'Select method'}
              disabled={methodOptions.length === 0}
              invalid={Boolean(errorFor('payment_method'))}
            />
            <FieldError message={errorFor('payment_method')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-ref">Reference</Label>
              <Input id="pay-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
              <FieldError message={errorFor('reference')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note">Note</Label>
              <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
              <FieldError message={errorFor('note')} />
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        {info.dueAmount > 0 ? (
          <Button type="submit" disabled={record.isPending}>
            {record.isPending ? 'Saving…' : 'Record Payment'}
          </Button>
        ) : null}
      </DialogFooter>
    </form>
  );
}
