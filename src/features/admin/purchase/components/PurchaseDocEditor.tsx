'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FileCheck2, Plus, Receipt, Trash2 } from 'lucide-react';
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
import { idParam } from '@/features/admin/inventory/api';
import { useInventoryItemOptions } from '@/features/admin/inventory/hooks/use-inventory-items';
import { useUnitOptions } from '@/features/admin/inventory/hooks/use-inventory-units';
import { useSupplierOptions } from '@/features/admin/inventory/hooks/use-suppliers';
import { OptionSelect } from '@/features/admin/inventory/shared/OptionSelect';
import { FieldError, fieldError } from '@/features/admin/inventory/shared/form-utils';
import { todayYmd } from '@/features/admin/inventory/shared/table-utils';
import { useTranslations } from '@/i18n/locale-context';
import type { PurchaseDoc, PurchaseDocKind, PurchaseDocPayload } from '../api';
import { usePurchaseDoc, useSavePurchaseDoc } from '../hooks/use-purchase-docs';

interface PurchaseDocEditorProps {
  kind: PurchaseDocKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** requisition_id of the document to edit; null = create. */
  docId: string | null;
}

interface LineState {
  key: string;
  id?: string;
  itemId: string;
  qty: string;
  rate: string;
  unitId: string;
  vendorId: string;
  description: string;
}

let lineSeq = 0;
const newLine = (): LineState => ({
  key: `new-${++lineSeq}`,
  itemId: '',
  qty: '1',
  rate: '',
  unitId: '',
  vendorId: '',
  description: '',
});

type Translate = ReturnType<typeof useTranslations>;

const kindLabel = (t: Translate, kind: PurchaseDocKind) =>
  kind === 'bill' ? t('admin.purchase.editor.kindBill', 'Purchase Bill') : t('admin.purchase.editor.kindRequisition', 'Requisition');

/** Multi-line requisition / purchase-bill editor (create + edit). */
export function PurchaseDocEditor({ kind, open, onOpenChange, docId }: PurchaseDocEditorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {open ? <EditorBody kind={kind} docId={docId} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EditorBody({ kind, docId, onDone }: { kind: PurchaseDocKind; docId: string | null; onDone: () => void }) {
  const t = useTranslations();
  const detail = usePurchaseDoc(kind, docId);
  if (docId && detail.isLoading) {
    return (
      <div className="py-4">
        <TableSkeleton rows={4} />
      </div>
    );
  }
  if (docId && (detail.isError || !detail.data)) {
    return (
      <EmptyState variant="error"
        title={kind === 'bill' ? t('admin.purchase.editor.loadFailedBill', 'Failed to load purchase bill') : t('admin.purchase.editor.loadFailedRequisition', 'Failed to load requisition')}
        description={errorMessage(detail.error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => detail.refetch()}
      />
    );
  }
  return <DocForm key={docId ?? 'new'} kind={kind} doc={docId ? (detail.data ?? null) : null} onDone={onDone} />;
}

function DocForm({ kind, doc, onDone }: { kind: PurchaseDocKind; doc: PurchaseDoc | null; onDone: () => void }) {
  const t = useTranslations();
  const label = kindLabel(t, kind);
  const isEdit = doc !== null;
  const [requisitionDate, setRequisitionDate] = useState(doc?.requisitionDate.slice(0, 10) || todayYmd());
  const [deadline, setDeadline] = useState(doc?.deadline.slice(0, 10) ?? '');
  const [remarks, setRemarks] = useState(doc?.remarks ?? '');
  const [lines, setLines] = useState<LineState[]>(() =>
    doc && doc.lines.length > 0
      ? doc.lines.map((l) => ({
          key: `line-${l.id}`,
          id: l.id,
          itemId: l.itemId,
          qty: String(l.qty),
          rate: String(l.rate),
          unitId: l.unitId ?? '',
          vendorId: l.vendorId ?? '',
          description: l.description,
        }))
      : [newLine()],
  );
  const [localError, setLocalError] = useState<Record<string, string>>({});

  const itemsQuery = useInventoryItemOptions();
  const unitsQuery = useUnitOptions();
  const suppliersQuery = useSupplierOptions();
  const save = useSavePurchaseDoc(kind);
  const err = save.error;
  const errorFor = (key: string) => localError[key] ?? fieldError(err, key);

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);
  const itemOptions = useMemo(
    () => items.map((i) => ({ value: i.id, label: [i.itemName, i.subcategory || i.category].filter(Boolean).join(' · ') })),
    [items],
  );
  const unitOptions = useMemo(() => (unitsQuery.data ?? []).map((u) => ({ value: u.id, label: u.name })), [unitsQuery.data]);
  const vendorOptions = useMemo(
    () => (suppliersQuery.data ?? []).map((v) => ({ value: v.id, label: v.companyName })),
    [suppliersQuery.data],
  );

  const total = lines.reduce((acc, l) => acc + num(l.qty) * num(l.rate), 0);

  const updateLine = (key: string, patch: Partial<LineState>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const selectItem = (key: string, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? { ...l, itemId, rate: l.rate === '' && item && item.unitPrice > 0 ? String(item.unitPrice) : l.rate }
          : l,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    lines.forEach((l, i) => {
      if (!l.itemId) errors[`items.${i}.item_id`] = t('admin.purchase.editor.selectItemError', 'Select an item');
      if (!(num(l.qty) > 0)) errors[`items.${i}.qty`] = t('admin.purchase.editor.qtyError', 'Qty must be > 0');
      if (l.rate === '' || num(l.rate, -1) < 0) errors[`items.${i}.rate`] = t('admin.purchase.editor.rateError', 'Rate must be ≥ 0');
    });
    if (lines.length === 0) errors.items = t('admin.purchase.editor.linesError', 'Add at least one line');
    if (deadline && requisitionDate && deadline < requisitionDate) errors.deadline = t('admin.purchase.editor.deadlineError', 'Deadline is before the date');
    setLocalError(errors);
    if (Object.keys(errors).length > 0) return;

    const body: PurchaseDocPayload = {
      requisition_date: requisitionDate || undefined,
      deadline: deadline || undefined,
      remarks: remarks.trim() || undefined,
      items: lines.map((l) => ({
        id: l.id ? idParam(l.id) : undefined,
        item_id: idParam(l.itemId),
        qty: num(l.qty),
        rate: num(l.rate),
        unit_id: idParam(l.unitId) ?? null,
        vendor_id: idParam(l.vendorId) ?? null,
        description: l.description.trim() || undefined,
      })),
    };
    save.mutate(
      { rid: doc?.requisitionId, body },
      {
        onSuccess: (saved) => {
          const ref = saved.requisitionId || doc?.requisitionId || '';
          toast.success(
            (isEdit
              ? t('admin.purchase.editor.updated', '{label} {ref} updated', { label, ref })
              : t('admin.purchase.editor.created', '{label} {ref} created', { label, ref })
            ).replace(/\s+/g, ' '),
          );
          onDone();
        },
      },
    );
  };

  const Icon = kind === 'bill' ? Receipt : FileCheck2;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {isEdit
            ? t('admin.purchase.editor.editTitle', 'Edit {label} {id}', { label, id: doc.requisitionId })
            : t('admin.purchase.editor.newTitle', 'New {label}', { label })}
        </DialogTitle>
        <DialogDescription>
          {kind === 'bill'
            ? t('admin.purchase.editor.descBill', 'Record an approved purchase from one or more vendors. Payments are recorded separately.')
            : t('admin.purchase.editor.descRequisition', 'Request items for purchase. Approving the requisition moves it to purchase bills.')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="doc-date">{kind === 'bill' ? t('admin.purchase.editor.billDate', 'Bill Date') : t('admin.purchase.editor.requisitionDate', 'Requisition Date')}</Label>
            <Input
              id="doc-date"
              type="date"
              value={requisitionDate}
              onChange={(e) => setRequisitionDate(e.target.value)}
              className="font-mono"
            />
            <FieldError message={errorFor('requisition_date')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-deadline">{t('admin.purchase.editor.deadline', 'Deadline')}</Label>
            <Input
              id="doc-deadline"
              type="date"
              value={deadline}
              min={requisitionDate || undefined}
              onChange={(e) => setDeadline(e.target.value)}
              className="font-mono"
            />
            <FieldError message={errorFor('deadline')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-remarks">{t('admin.purchase.editor.remarks', 'Remarks')}</Label>
            <Input id="doc-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            <FieldError message={errorFor('remarks')} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('admin.purchase.editor.lineItems', 'Line Items *')}</Label>
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setLines((prev) => [...prev, newLine()])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.purchase.editor.addLine', 'Add Line')}
            </Button>
          </div>
          <FieldError message={errorFor('items')} />

          <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
            {lines.map((l, i) => (
              <div key={l.key} className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
                <div className="grid grid-cols-12 items-start gap-2">
                  <div className="col-span-12 space-y-1 sm:col-span-5">
                    <OptionSelect
                      value={l.itemId}
                      onChange={(v) => selectItem(l.key, v)}
                      options={itemOptions}
                      placeholder={itemsQuery.isLoading ? t('admin.purchase.editor.loadingItems', 'Loading items…') : t('admin.purchase.editor.selectItem', 'Select item')}
                      disabled={itemsQuery.isLoading}
                      invalid={Boolean(errorFor(`items.${i}.item_id`))}
                      className="h-9"
                    />
                    <FieldError message={errorFor(`items.${i}.item_id`)} />
                  </div>
                  <div className="col-span-4 space-y-1 sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      aria-label={t('admin.purchase.editor.quantity', 'Quantity')}
                      placeholder={t('admin.purchase.editor.qty', 'Qty')}
                      value={l.qty}
                      onChange={(e) => updateLine(l.key, { qty: e.target.value })}
                      aria-invalid={Boolean(errorFor(`items.${i}.qty`)) || undefined}
                      className="h-9"
                    />
                    <FieldError message={errorFor(`items.${i}.qty`)} />
                  </div>
                  <div className="col-span-4 space-y-1 sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      aria-label={t('admin.purchase.editor.rate', 'Rate')}
                      placeholder={t('admin.purchase.editor.rate', 'Rate')}
                      value={l.rate}
                      onChange={(e) => updateLine(l.key, { rate: e.target.value })}
                      aria-invalid={Boolean(errorFor(`items.${i}.rate`)) || undefined}
                      className="h-9"
                    />
                    <FieldError message={errorFor(`items.${i}.rate`)} />
                  </div>
                  <div className="col-span-3 flex h-9 items-center justify-end text-sm font-semibold tabular-nums text-foreground sm:col-span-2">
                    {formatBdtWithSymbol(num(l.qty) * num(l.rate))}
                  </div>
                  <div className="col-span-1 flex h-9 items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-500"
                      aria-label={t('admin.purchase.editor.removeLine', 'Remove line')}
                      disabled={lines.length === 1}
                      onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6 space-y-1 sm:col-span-3">
                    <OptionSelect
                      value={l.unitId}
                      onChange={(v) => updateLine(l.key, { unitId: v })}
                      options={unitOptions}
                      noneLabel={t('admin.purchase.editor.noUnit', 'No unit')}
                      disabled={unitsQuery.isLoading}
                      className="h-9 text-xs"
                    />
                    <FieldError message={errorFor(`items.${i}.unit_id`)} />
                  </div>
                  <div className="col-span-6 space-y-1 sm:col-span-4">
                    <OptionSelect
                      value={l.vendorId}
                      onChange={(v) => updateLine(l.key, { vendorId: v })}
                      options={vendorOptions}
                      noneLabel={t('admin.purchase.editor.noVendor', 'No vendor')}
                      disabled={suppliersQuery.isLoading}
                      className="h-9 text-xs"
                    />
                    <FieldError message={errorFor(`items.${i}.vendor_id`)} />
                  </div>
                  <div className="col-span-12 space-y-1 sm:col-span-5">
                    <Input
                      aria-label={t('admin.purchase.editor.description', 'Description')}
                      placeholder={t('admin.purchase.editor.descriptionOptional', 'Description (optional)')}
                      value={l.description}
                      onChange={(e) => updateLine(l.key, { description: e.target.value })}
                      className="h-9 text-xs"
                    />
                    <FieldError message={errorFor(`items.${i}.description`)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {lines.length === 1
              ? t('admin.purchase.editor.lineTotalOne', '{n} line · Total', { n: lines.length })
              : t('admin.purchase.editor.lineTotalMany', '{n} lines · Total', { n: lines.length })}
          </span>
          <span className="text-xl font-bold tabular-nums text-foreground">{formatBdtWithSymbol(total)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending
            ? t('admin.purchase.editor.saving', 'Saving…')
            : isEdit
              ? t('admin.purchase.editor.saveChanges', 'Save Changes')
              : kind === 'bill'
                ? t('admin.purchase.editor.recordBill', 'Record Bill')
                : t('admin.purchase.editor.submitRequisition', 'Submit Requisition')}
        </Button>
      </DialogFooter>
    </form>
  );
}
