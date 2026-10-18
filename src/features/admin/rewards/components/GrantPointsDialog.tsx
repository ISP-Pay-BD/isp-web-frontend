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
import { useGrantRewardPoints } from '../hooks/use-rewards';

/** Grant (positive) or deduct (negative) reward points for one customer, with a reason. */
export function GrantPointsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
    if (!customer) next.customer_id = 'Choose a customer';
    if (!Number.isInteger(value) || value === 0) next.points = 'Enter a whole, non-zero number (negative to deduct)';
    if (note.trim().length < 3) next.note = 'Give a short reason';
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
          <DialogTitle>Grant or adjust points</DialogTitle>
          <DialogDescription>
            Posted to the customer&apos;s reward ledger as a manual adjustment and recorded in the audit log.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <CustomerPicker value={customer} onChange={setCustomer} invalid={!!errors.customer_id} />
            {errors.customer_id ? <p className="text-destructive text-xs">{errors.customer_id}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-points">Points</Label>
            <Input
              id="grant-points"
              inputMode="numeric"
              placeholder="e.g. 50, or -20 to deduct"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            {errors.points ? <p className="text-destructive text-xs">{errors.points}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-note">Reason</Label>
            <Textarea id="grant-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            {errors.note ? <p className="text-destructive text-xs">{errors.note}</p> : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={grant.isPending}>
            {grant.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
