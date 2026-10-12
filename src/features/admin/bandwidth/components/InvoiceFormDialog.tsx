'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormPageSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatBdtWithSymbol } from '@/lib/format';
import { useBandwidthItems } from '../hooks/useBandwidthCatalog';
import {
  useBandwidthClientOptions,
  useBandwidthInvoice,
  useCreateBandwidthInvoice,
  useUpdateBandwidthInvoice,
  type InvoiceInput,
} from '../hooks/useBandwidthSell';
import type { BandwidthInvoice } from '../types';
import { fieldErrorsOf, isoDay } from '../utils';
import { LineItemsEditor, lineTotal, newLine, type LineDraft } from './LineItemsEditor';
import { FieldError, OptionSelect } from './OptionSelect';

interface InvoiceFormDialogProps {
  open: boolean;
  /** requisition_id of the invoice to edit; null = create */
  rid: string | null;
  onOpenChange: (open: boolean) => void;
}

/** Create / edit a bandwidth sales invoice (POST / PUT /v1/bandwidth/invoices). */
export function InvoiceFormDialog({ open, rid, onOpenChange }: InvoiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-border/80 shadow-[var(--shadow-md)]">
        {open ? rid ? <EditInvoice rid={rid} onDone={() => onOpenChange(false)} /> : <InvoiceForm invoice={null} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EditInvoice({ rid, onDone }: { rid: string; onDone: () => void }) {
  const { data, isLoading, isError, refetch } = useBandwidthInvoice(rid);
  if (isLoading) return <FormPageSkeleton />;
  if (isError || !data) {
    return <EmptyState title="Could not load the invoice" actionLabel="Retry" onAction={() => refetch()} />;
  }
  return <InvoiceForm key={rid} invoice={data} onDone={onDone} />;
}

type HeaderState = Omit<InvoiceInput, 'lines'>;

function InvoiceForm({ invoice, onDone }: { invoice: BandwidthInvoice | null; onDone: () => void }) {
  const clients = useBandwidthClientOptions();
  const catalog = useBandwidthItems();
  const create = useCreateBandwidthInvoice();
  const update = useUpdateBandwidthInvoice();
  const [header, setHeader] = useState<HeaderState>({
    clientId: invoice?.clientId ? String(invoice.clientId) : '',
    requisitionDate: invoice?.requisitionDate || isoDay(),
    deadline: invoice?.deadline ?? '',
    remarks: invoice?.remarks ?? '',
  });
  const [lines, setLines] = useState<LineDraft[]>(() =>
    invoice?.lines.length
      ? invoice.lines.map((l) =>
          newLine({
            id: l.id,
            itemId: l.itemId,
            itemName: l.itemName,
            description: l.description,
            qty: String(l.qty),
            rate: String(l.rate),
            fromDate: l.fromDate,
            toDate: l.toDate,
          }),
        )
      : [newLine()],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<HeaderState>) => setHeader((h) => ({ ...h, ...patch }));
  const pending = create.isPending || update.isPending;
  const total = lines.reduce((s, l) => s + lineTotal(l, false), 0);

  const clientOptions = (clients.data ?? []).map((c) => ({ value: String(c.id), label: c.customerName }));
  if (invoice?.clientId && !clientOptions.some((o) => o.value === String(invoice.clientId))) {
    clientOptions.unshift({ value: String(invoice.clientId), label: invoice.clientName || `#${invoice.clientId}` });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.clientId) {
      setErrors({ client_id: 'Select a customer' });
      return;
    }
    setErrors({});
    const input: InvoiceInput = { ...header, lines };
    const callbacks = {
      onSuccess: () => {
        toast.success(invoice ? 'Invoice updated' : 'Invoice saved');
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (invoice) update.mutate({ ...input, rid: invoice.requisitionId }, callbacks);
    else create.mutate(input, callbacks);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> {invoice ? `Edit invoice ${invoice.requisitionId}` : 'New sales invoice'}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {invoice ? 'Recorded payments are kept; the due amount is recomputed from the new total.' : 'Invoice total = Σ qty × rate of the lines.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold">Client *</Label>
            <OptionSelect
              value={header.clientId}
              onChange={(v) => set({ clientId: v })}
              options={clientOptions}
              placeholder={clients.isLoading ? 'Loading clients…' : 'Select client'}
              invalid={Boolean(errors.client_id)}
            />
            <FieldError message={errors.client_id} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-date" className="text-xs font-semibold">Invoice date</Label>
            <Input id="inv-date" type="date" value={header.requisitionDate} onChange={(e) => set({ requisitionDate: e.target.value })} className="text-xs h-9" />
            <FieldError message={errors.requisition_date} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-deadline" className="text-xs font-semibold">Due date</Label>
            <Input id="inv-deadline" type="date" value={header.deadline} onChange={(e) => set({ deadline: e.target.value })} className="text-xs h-9" />
            <FieldError message={errors.deadline} />
          </div>
        </div>

        <LineItemsEditor lines={lines} onChange={setLines} catalog={catalog.data ?? []} catalogLoading={catalog.isLoading} errors={errors} />

        <div className="space-y-1.5">
          <Label htmlFor="inv-remarks" className="text-xs font-semibold">Remarks</Label>
          <Textarea id="inv-remarks" rows={2} value={header.remarks} onChange={(e) => set({ remarks: e.target.value })} className="text-xs" maxLength={1000} />
          <FieldError message={errors.remarks} />
        </div>

        <div className="flex justify-end p-3 rounded-xl bg-muted/20 border border-border/50 text-xs">
          <span className="text-muted-foreground">
            Invoice total <span className="font-mono font-bold text-foreground">{formatBdtWithSymbol(total)}</span>
          </span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">Cancel</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? 'Saving…' : invoice ? 'Save invoice' : 'Create invoice'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
