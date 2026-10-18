'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { usePayBandwidthInvoice, type PaymentInput } from '../hooks/useBandwidthSell';
import { SELL_PAYMENT_METHODS, type PayableInvoice } from '../types';
import { fieldErrorsOf, isoDay, paymentMethodLabel } from '../utils';
import { FieldError, OptionSelect } from './OptionSelect';

interface PaymentDialogProps {
  invoice: PayableInvoice | null;
  onOpenChange: (open: boolean) => void;
}

function initial(inv: PayableInvoice): PaymentInput {
  return {
    receivedAmount: inv.receivedAmount ? String(inv.receivedAmount) : '',
    discount: inv.discount ? String(inv.discount) : '',
    vatAmount: '',
    paymentDate: isoDay(),
    paymentMethod: SELL_PAYMENT_METHODS.some((m) => m.value === inv.paymentMethod) ? inv.paymentMethod : '',
    paidBy: inv.paidBy,
    receivedBy: inv.receivedBy,
    description: inv.remarks,
  };
}

/** Records the collection state of a sell invoice (POST …/invoices/{rid}/payments). */
export function PaymentDialog({ invoice, onOpenChange }: PaymentDialogProps) {
  return (
    <Dialog open={Boolean(invoice)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
        {invoice ? <PaymentForm key={invoice.requisitionId} invoice={invoice} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({ invoice, onDone }: { invoice: PayableInvoice; onDone: () => void }) {
  const t = useTranslations();
  const pay = usePayBandwidthInvoice();
  const [form, setForm] = useState<PaymentInput>(() => initial(invoice));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<PaymentInput>) => setForm((f) => ({ ...f, ...patch }));

  const due = invoice.total - (Number(form.receivedAmount) || 0) + (Number(form.vatAmount) || 0) - (Number(form.discount) || 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    pay.mutate(
      { rid: invoice.requisitionId, ...form },
      {
        onSuccess: () => {
          toast.success(t('admin.bandwidth.payment.updated', 'Payment updated'));
          onDone();
        },
        onError: (err) => setErrors(fieldErrorsOf(err)),
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> {t('admin.bandwidth.payment.title', 'Receive payment')}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {t('admin.bandwidth.payment.desc', 'Invoice {no}{client}. Enter the total amount received so far.', {
            no: invoice.requisitionId,
            client: invoice.clientName ? ` · ${invoice.clientName}` : '',
          })}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-3 pt-1">
        <div className="p-3 rounded-xl bg-muted/20 border border-border/50 text-xs flex justify-between">
          <span className="text-muted-foreground">{t('admin.bandwidth.invoiceForm.invoiceTotal', 'Invoice total')}</span>
          <span className="font-mono font-bold text-foreground">{formatBdtWithSymbol(invoice.total)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pay-received" className="text-xs font-semibold">{t('admin.bandwidth.payment.receivedAmount', 'Received amount *')}</Label>
            <Input id="pay-received" type="number" min="0" step="any" required value={form.receivedAmount} onChange={(e) => set({ receivedAmount: e.target.value })} className="h-9 text-xs font-mono" aria-invalid={Boolean(errors.received_amount) || undefined} />
            <FieldError message={errors.received_amount} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-date" className="text-xs font-semibold">{t('admin.bandwidth.payment.paymentDate', 'Payment date')}</Label>
            <Input id="pay-date" type="date" value={form.paymentDate} onChange={(e) => set({ paymentDate: e.target.value })} className="h-9 text-xs" />
            <FieldError message={errors.payment_date} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-discount" className="text-xs font-semibold">{t('admin.bandwidth.shared.discount', 'Discount')}</Label>
            <Input id="pay-discount" type="number" min="0" step="any" value={form.discount} onChange={(e) => set({ discount: e.target.value })} className="h-9 text-xs font-mono" />
            <FieldError message={errors.discount} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-vat" className="text-xs font-semibold">{t('admin.bandwidth.payment.vatAmount', 'VAT amount')}</Label>
            <Input id="pay-vat" type="number" min="0" step="any" value={form.vatAmount} onChange={(e) => set({ vatAmount: e.target.value })} className="h-9 text-xs font-mono" />
            <FieldError message={errors.vat_amount} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('admin.bandwidth.payment.method', 'Method')}</Label>
            <OptionSelect value={form.paymentMethod} onChange={(v) => set({ paymentMethod: v })} options={SELL_PAYMENT_METHODS.map((m) => ({ value: m.value, label: paymentMethodLabel(t, m.value, m.label) }))} placeholder={t('admin.bandwidth.payment.selectMethod', 'Select method')} />
            <FieldError message={errors.payment_method} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-by" className="text-xs font-semibold">{t('admin.bandwidth.shared.paidBy', 'Paid by')}</Label>
            <Input id="pay-by" value={form.paidBy} onChange={(e) => set({ paidBy: e.target.value })} className="h-9 text-xs" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="pay-recv-by" className="text-xs font-semibold">{t('admin.bandwidth.shared.receivedBy', 'Received by')}</Label>
            <Input id="pay-recv-by" value={form.receivedBy} onChange={(e) => set({ receivedBy: e.target.value })} className="h-9 text-xs" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="pay-note" className="text-xs font-semibold">{t('admin.bandwidth.payment.note', 'Note')}</Label>
            <Textarea id="pay-note" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} className="text-xs" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/50 text-xs flex justify-between">
          <span className="text-muted-foreground">{t('admin.bandwidth.payment.balanceAfter', 'Balance due after this')}</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(Math.max(0, due))}</span>
        </div>

        <DialogFooter className="pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">{t('common.cancel', 'Cancel')}</Button>
          <Button type="submit" size="sm" disabled={pay.isPending} className="text-xs font-semibold">
            {pay.isPending ? t('admin.bandwidth.shared.saving', 'Saving…') : t('admin.bandwidth.payment.save', 'Save payment')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
