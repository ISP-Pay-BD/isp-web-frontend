'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatBdtWithSymbol } from '@/lib/format';
import { useBandwidthItems, useBandwidthProviderOptions } from '../hooks/useBandwidthCatalog';
import { useCreateBandwidthBill, useUpdateBandwidthBill, type BillInput } from '../hooks/useBandwidthBills';
import { PURCHASE_PAYMENT_METHODS, type BandwidthPurchaseBill } from '../types';
import { fieldErrorsOf, isoDay } from '../utils';
import { LineItemsEditor, lineTotal, newLine, type LineDraft } from './LineItemsEditor';
import { FieldError, OptionSelect } from './OptionSelect';

interface BillFormDialogProps {
  open: boolean;
  /** null = create */
  bill: BandwidthPurchaseBill | null;
  onOpenChange: (open: boolean) => void;
}

/** Create / edit a provider purchase bill (POST / PUT /v1/bandwidth/purchase-bills). */
export function BillFormDialog({ open, bill, onOpenChange }: BillFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-border/80 shadow-[var(--shadow-md)]">
        {open ? <BillForm key={bill?.id ?? 'new'} bill={bill} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type HeaderState = Omit<BillInput, 'lines'>;

function BillForm({ bill, onDone }: { bill: BandwidthPurchaseBill | null; onDone: () => void }) {
  const providers = useBandwidthProviderOptions();
  const catalog = useBandwidthItems();
  const create = useCreateBandwidthBill();
  const update = useUpdateBandwidthBill();
  const [header, setHeader] = useState<HeaderState>({
    providerId: bill ? String(bill.providerId) : '',
    invoiceNumber: bill?.invoiceNumber ?? '',
    billingDate: bill?.billingDate.slice(0, 10) || isoDay(),
    paymentStatus: bill?.paymentStatus ?? 'Due',
    discount: bill?.discount ? String(bill.discount) : '',
    paidNumber: bill?.paid ? String(bill.paid) : '',
    paymentMethod: bill?.paymentMethod ?? '',
    paidBy: bill?.paidBy ?? '',
    receivedBy: bill?.receivedBy ?? '',
    remarks: bill?.remarks ?? '',
  });
  const [lines, setLines] = useState<LineDraft[]>(() =>
    bill?.items.length
      ? bill.items.map((l) =>
          newLine({
            itemId: l.itemId,
            itemName: l.item,
            description: l.description,
            unit: l.unit,
            qty: String(l.qty),
            rate: String(l.rate),
            vat: String(l.vat),
            fromDate: l.fromDate,
            toDate: l.toDate,
          }),
        )
      : [newLine()],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<HeaderState>) => setHeader((h) => ({ ...h, ...patch }));
  const pending = create.isPending || update.isPending;

  const grand = lines.reduce((s, l) => s + lineTotal(l, true), 0);
  const due = Math.max(0, grand - (Number(header.paidNumber) || 0) - (Number(header.discount) || 0));

  const providerOptions = (providers.data ?? []).map((p) => ({ value: String(p.id), label: p.companyName }));
  // Keep the bill's provider selectable even if it is beyond the first options page.
  if (bill && bill.providerId && !providerOptions.some((o) => o.value === String(bill.providerId))) {
    providerOptions.unshift({ value: String(bill.providerId), label: bill.providerName || `#${bill.providerId}` });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.providerId) {
      setErrors({ provider_id: 'Select a provider' });
      return;
    }
    setErrors({});
    const input: BillInput = { ...header, lines };
    const callbacks = {
      onSuccess: () => {
        toast.success(bill ? 'Bill updated' : 'Bill saved');
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (bill) update.mutate({ ...input, id: bill.id }, callbacks);
    else create.mutate(input, callbacks);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> {bill ? `Edit bill ${bill.invoiceNumber}` : 'Record purchase bill'}
        </DialogTitle>
        <DialogDescription className="text-xs">
          Bill total = Σ qty × rate + line VAT. Leave the invoice number blank to auto-generate it.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">Provider *</Label>
            <OptionSelect
              value={header.providerId}
              onChange={(v) => set({ providerId: v })}
              options={providerOptions}
              placeholder={providers.isLoading ? 'Loading providers…' : 'Select provider'}
              invalid={Boolean(errors.provider_id)}
            />
            <FieldError message={errors.provider_id} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bill-no" className="text-xs font-semibold">Invoice #</Label>
            <Input id="bill-no" value={header.invoiceNumber} onChange={(e) => set({ invoiceNumber: e.target.value })} className="text-xs h-9 font-mono" placeholder="Auto" />
            <FieldError message={errors.invoice_number} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bill-date" className="text-xs font-semibold">Billing date</Label>
            <Input id="bill-date" type="date" value={header.billingDate} onChange={(e) => set({ billingDate: e.target.value })} className="text-xs h-9" />
            <FieldError message={errors.billing_date} />
          </div>
        </div>

        <LineItemsEditor lines={lines} onChange={setLines} catalog={catalog.data ?? []} catalogLoading={catalog.isLoading} withVat errors={errors} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment status *</Label>
            <OptionSelect
              value={header.paymentStatus}
              onChange={(v) => set({ paymentStatus: v === 'Paid' ? 'Paid' : 'Due' })}
              options={[
                { value: 'Due', label: 'Due' },
                { value: 'Paid', label: 'Paid' },
              ]}
            />
            <FieldError message={errors.payment_status} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bill-paid" className="text-xs font-semibold">Paid amount</Label>
            <Input id="bill-paid" type="number" min="0" step="any" value={header.paidNumber} onChange={(e) => set({ paidNumber: e.target.value })} className="text-xs h-9 font-mono" />
            <FieldError message={errors.paid_number} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bill-discount" className="text-xs font-semibold">Discount</Label>
            <Input id="bill-discount" type="number" min="0" step="any" value={header.discount} onChange={(e) => set({ discount: e.target.value })} className="text-xs h-9 font-mono" />
            <FieldError message={errors.discount} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment method</Label>
            <OptionSelect
              value={header.paymentMethod}
              onChange={(v) => set({ paymentMethod: v })}
              emptyLabel="—"
              options={PURCHASE_PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
            <FieldError message={errors.payment_method} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="bill-paid-by" className="text-xs font-semibold">Paid by</Label>
            <Input id="bill-paid-by" value={header.paidBy} onChange={(e) => set({ paidBy: e.target.value })} className="text-xs h-9" />
            <FieldError message={errors.paid_by} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="bill-recv-by" className="text-xs font-semibold">Received by</Label>
            <Input id="bill-recv-by" value={header.receivedBy} onChange={(e) => set({ receivedBy: e.target.value })} className="text-xs h-9" />
          </div>
          <div className="col-span-2 sm:col-span-4 space-y-1.5">
            <Label htmlFor="bill-remarks" className="text-xs font-semibold">Remarks</Label>
            <Textarea id="bill-remarks" rows={2} value={header.remarks} onChange={(e) => set({ remarks: e.target.value })} className="text-xs" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 p-3 rounded-xl bg-muted/20 border border-border/50 text-xs">
          <span className="text-muted-foreground">
            Bill total <span className="font-mono font-bold text-foreground">{formatBdtWithSymbol(grand)}</span>
          </span>
          <span className="text-muted-foreground">
            Due <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatBdtWithSymbol(due)}</span>
          </span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">Cancel</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? 'Saving…' : bill ? 'Save bill' : 'Submit bill'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
