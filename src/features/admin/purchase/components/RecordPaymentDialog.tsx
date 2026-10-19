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
import { useTranslations } from '@/i18n/locale-context';
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
  const t = useTranslations();
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
      <EmptyState variant="error"
        title={t('admin.purchase.payment.loadFailed', 'Failed to load bill payments')}
        description={errorMessage(payments.error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => payments.refetch()}
      />
    );
  }
  return <PaymentForm rid={rid} info={payments.data} onDone={onDone} />;
}

function PaymentForm({ rid, info, onDone }: { rid: string; info: BillPayments; onDone: () => void }) {
  const t = useTranslations();
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
    if (!Number.isFinite(value) || value <= 0) errors.amount = t('admin.purchase.payment.amountPositive', 'Amount must be greater than 0');
    else if (value > info.dueAmount + 0.009) errors.amount = t('admin.purchase.payment.amountExceeds', 'Amount cannot exceed the due {due}', { due: formatBdtWithSymbol(info.dueAmount) });
    if (!method) errors.payment_method = t('admin.purchase.payment.methodRequired', 'Select a payment method');
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
          toast.success(t('admin.purchase.payment.recorded', 'Payment of {amount} recorded for {rid}', { amount: formatBdtWithSymbol(value), rid }));
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
          {t('admin.purchase.payment.title', 'Record Payment · {rid}', { rid })}
        </DialogTitle>
        <DialogDescription>
          {t('admin.purchase.payment.billTotal', 'Bill total')} {formatBdtWithSymbol(info.total)} · {t('admin.purchase.payment.paid', 'paid')} {formatBdtWithSymbol(info.paidAmount)} · {t('admin.purchase.payment.due', 'due')}{' '}
          <span className="font-semibold text-foreground">{formatBdtWithSymbol(info.dueAmount)}</span>
        </DialogDescription>
      </DialogHeader>

      {info.dueAmount <= 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t('admin.purchase.payment.fullyPaid', 'This bill is fully paid.')}</p>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">{t('admin.purchase.payment.amount', 'Amount (BDT) *')}</Label>
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
              <Label htmlFor="pay-date">{t('admin.purchase.payment.date', 'Payment Date')}</Label>
              <Input id="pay-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="font-mono" />
              <FieldError message={errorFor('payment_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-method">{t('admin.purchase.payment.method', 'Payment Method *')}</Label>
            <OptionSelect
              id="pay-method"
              value={method}
              onChange={setMethod}
              options={methodOptions}
              placeholder={methodOptions.length === 0 ? t('admin.purchase.payment.noMethods', 'No payment methods configured') : t('admin.purchase.payment.selectMethod', 'Select method')}
              disabled={methodOptions.length === 0}
              invalid={Boolean(errorFor('payment_method'))}
            />
            <FieldError message={errorFor('payment_method')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-ref">{t('admin.purchase.payment.reference', 'Reference')}</Label>
              <Input id="pay-ref" value={reference} onChange={(e) => setReference(e.target.value)} />
              <FieldError message={errorFor('reference')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note">{t('admin.purchase.payment.note', 'Note')}</Label>
              <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
              <FieldError message={errorFor('note')} />
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        {info.dueAmount > 0 ? (
          <Button type="submit" disabled={record.isPending}>
            {record.isPending ? t('admin.purchase.payment.saving', 'Saving…') : t('admin.purchase.payment.submit', 'Record Payment')}
          </Button>
        ) : null}
      </DialogFooter>
    </form>
  );
}
