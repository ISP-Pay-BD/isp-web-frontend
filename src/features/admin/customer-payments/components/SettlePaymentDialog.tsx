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

const METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'Card'];

export interface SettleTarget {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  billingMonth: string;
  customerName: string;
}

/** Marks a pending invoice as paid (PUT /v1/reseller/customer-payments/{rid}/{id}). */
export function SettlePaymentDialog({ target, onClose }: { target: SettleTarget | null; onClose: () => void }) {
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

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment received</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Invoice <span className="font-mono">{target.invoiceNo}</span> — {target.customerName} —{' '}
                <CurrencyDisplay amount={target.amountBdt} className="inline" />
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Received via</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>TrxID / reference</Label>
            <Input value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => submit().catch(() => undefined)} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Mark as paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
