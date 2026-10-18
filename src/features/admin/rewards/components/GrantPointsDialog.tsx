'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerPicker } from '@/features/admin/customer-payments/components/CustomerPicker';
import type { CustomerOption } from '@/features/admin/customer-payments/types';
import { ApiError } from '@/lib/api/client';
import { useTranslations } from '@/i18n/locale-context';
import { useGrantRewardPoints } from '../hooks/use-rewards';

/** Grant (positive) or deduct (negative) reward points for one customer, with a reason. */
export function GrantPointsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const grant = useGrantRewardPoints();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // One id per opened form: a double click or retry can't post twice.
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  const reset = () => {
    setCustomer(null);
    setPoints('');
    setNote('');
    setErrors({});
    setRequestId(crypto.randomUUID());
  };

  const submit = () => {
    const value = Number(points);
    const next: Record<string, string> = {};
    if (!customer) next.customer_id = t('admin.rewards.grant.errCustomer', 'Choose a customer');
    if (!Number.isInteger(value) || value === 0) next.points = t('admin.rewards.grant.errPoints', 'Enter a whole, non-zero number (negative to deduct)');
    if (note.trim().length < 3) next.note = t('admin.rewards.grant.errNote', 'Give a short reason');
    setErrors(next);
    if (Object.keys(next).length || !customer) return;

    grant.mutate(
      { customerId: customer.id, points: value, note: note.trim(), requestId },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.details) {
            setErrors(
              Object.fromEntries(
                Object.entries(err.details).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
              ),
            );
          }
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.rewards.grant.title', 'Grant or adjust points')}</DialogTitle>
          <DialogDescription>
            {t('admin.rewards.grant.desc', "Posted to the customer's reward ledger as a manual adjustment and recorded in the audit log.")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>{t('admin.rewards.grant.customer', 'Customer')}</Label>
            <CustomerPicker value={customer} onChange={setCustomer} invalid={!!errors.customer_id} />
            {errors.customer_id ? <p className="text-destructive text-xs">{errors.customer_id}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-points">{t('admin.rewards.grant.points', 'Points')}</Label>
            <Input
              id="grant-points"
              inputMode="numeric"
              placeholder={t('admin.rewards.grant.pointsPlaceholder', 'e.g. 50, or -20 to deduct')}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            {errors.points ? <p className="text-destructive text-xs">{errors.points}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-note">{t('admin.rewards.grant.reason', 'Reason')}</Label>
            <Textarea id="grant-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            {errors.note ? <p className="text-destructive text-xs">{errors.note}</p> : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={submit} disabled={grant.isPending}>
            {grant.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
