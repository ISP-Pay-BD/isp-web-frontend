'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUpdatePaymentStatus } from '../hooks/use-customer-payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useTranslations } from '@/i18n/locale-context';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'Card'] as const;

export interface SettleTarget {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  billingMonth: string;
  customerName: string;
}

/** Marks a pending invoice as paid (PUT /v1/reseller/customer-payments/{rid}/{id}). */
export function SettlePaymentDialog({ target, onClose }: { target: SettleTarget | null; onClose: () => void }) {
  const t = useTranslations();
  const update = useUpdatePaymentStatus();
  const [method, setMethod] = useState('Cash');
  const [trxId, setTrxId] = useState('');

  const submit = async () => {
    if (!target) return;
    await update.mutateAsync({
      id: target.id,
      amountBdt: target.amountBdt,
      billingMonth: target.billingMonth || new Date().toLocaleString('en', { month: 'long' }),
      status: 'successful',
      method,
      trxId: trxId.trim() || undefined,
    });
    setTrxId('');
    onClose();
  };

  const methodItems: Record<string, string> = {
    Cash: t('admin.customerPayments.method.cash', 'Cash'),
    bKash: 'bKash',
    Nagad: 'Nagad',
    Rocket: 'Rocket',
    Bank: t('admin.customerPayments.method.bank', 'Bank'),
    Card: t('admin.customerPayments.method.cardOnly', 'Card'),
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.customerPayments.settle.title', 'Record payment received')}</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                {t('admin.customerPayments.settle.invoice', 'Invoice')} <span className="font-mono">{target.invoiceNo}</span> — {target.customerName} —{' '}
                <CurrencyDisplay amount={target.amountBdt} className="inline" />
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="receivedVia">{t('admin.customerPayments.settle.receivedVia', 'Received via')}</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v)} items={methodItems}>
              <SelectTrigger id="receivedVia"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{methodItems[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trxId">{t('admin.customerPayments.settle.trxId', 'TrxID / reference')}</Label>
            <Input id="trxId" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder={t('admin.customerPayments.settle.optional', 'Optional')} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t('admin.customerPayments.settle.cancel', 'Cancel')}</Button>
          <Button onClick={() => submit().catch(() => undefined)} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            {t('admin.customerPayments.settle.markPaid', 'Mark as paid')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
