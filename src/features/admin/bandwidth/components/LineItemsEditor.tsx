'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBdtWithSymbol } from '@/lib/format';
import type { BandwidthCatalogItem } from '../types';
import { FieldError, OptionSelect } from './OptionSelect';

/** One editable document line (purchase bill or sell invoice). */
export interface LineDraft {
  key: string;
  /** Existing sell-invoice line id (kept on update). */
  id?: number;
  itemId: string;
  /** Stored item name — the backend resolves legacy lines without an item id by name. */
  itemName?: string;
  description: string;
  unit: string;
  qty: string;
  rate: string;
  vat: string;
  fromDate: string;
  toDate: string;
}

let seq = 0;
export function newLine(partial: Partial<LineDraft> = {}): LineDraft {
  seq += 1;
  return { key: `line-${seq}`, itemId: '', description: '', unit: '', qty: '1', rate: '', vat: '', fromDate: '', toDate: '', ...partial };
}

/** qty × rate (+ VAT %) — same formula as the backend. */
export function lineTotal(l: LineDraft, withVat: boolean): number {
  const sub = (Number(l.qty) || 0) * (Number(l.rate) || 0);
  return withVat ? sub + sub * ((Number(l.vat) || 0) / 100) : sub;
}

interface LineItemsEditorProps {
  lines: LineDraft[];
  onChange: (lines: LineDraft[]) => void;
  catalog: BandwidthCatalogItem[];
  catalogLoading?: boolean;
  /** Purchase bills carry per-line VAT % and a unit label. */
  withVat?: boolean;
  /** Field errors from the API, keyed `items.{index}.{field}`. */
  errors: Record<string, string>;
}

export function LineItemsEditor({ lines, onChange, catalog, catalogLoading, withVat = false, errors }: LineItemsEditorProps) {
  const options = catalog.map((i) => ({
    value: i.id,
    label: [i.itemName, i.subcategory ? `${i.category} › ${i.subcategory}` : i.category].filter(Boolean).join(' — '),
  }));

  const update = (key: string, patch: Partial<LineDraft>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const pickItem = (key: string, itemId: string) => {
    const item = catalog.find((i) => i.id === itemId);
    const line = lines.find((l) => l.key === key);
    update(key, {
      itemId,
      // Prefill price/VAT from the catalogue only when the user has not typed one.
      rate: line?.rate ? line.rate : item ? String(item.unitPrice) : '',
      vat: withVat && !line?.vat && item ? String(item.vat) : line?.vat ?? '',
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Line items *</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onChange([...lines, newLine()])}>
          <Plus className="h-3.5 w-3.5" /> Add line
        </Button>
      </div>
      <FieldError message={errors.items} />
      {catalog.length === 0 && !catalogLoading ? (
        <p className="text-[11px] text-muted-foreground">No catalogue items yet — add items under Bandwidth Buy → Items first.</p>
      ) : null}

      {lines.map((l, i) => {
        const err = (f: string) => errors[`items.${i}.${f}`];
        return (
          <div key={l.key} className="rounded-xl border border-border/60 bg-muted/15 p-3 space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Item</Label>
                <OptionSelect
                  value={l.itemId}
                  onChange={(v) => pickItem(l.key, v)}
                  options={options}
                  placeholder={catalogLoading ? 'Loading items…' : 'Select item'}
                  invalid={Boolean(err('item_id'))}
                />
                {!l.itemId && l.itemName ? <p className="text-[10px] text-muted-foreground">Saved as “{l.itemName}”</p> : null}
                <FieldError message={err('item_id')} />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Qty</Label>
                <Input type="number" min="0" step="any" value={l.qty} onChange={(e) => update(l.key, { qty: e.target.value })} className="h-9 text-xs font-mono" aria-invalid={Boolean(err('qty')) || undefined} />
                <FieldError message={err('qty')} />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Rate (৳)</Label>
                <Input type="number" min="0" step="any" value={l.rate} onChange={(e) => update(l.key, { rate: e.target.value })} className="h-9 text-xs font-mono" aria-invalid={Boolean(err('rate')) || undefined} />
                <FieldError message={err('rate')} />
              </div>
              {withVat ? (
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">VAT %</Label>
                  <Input type="number" min="0" max="100" step="any" value={l.vat} onChange={(e) => update(l.key, { vat: e.target.value })} className="h-9 text-xs font-mono" aria-invalid={Boolean(err('vat')) || undefined} />
                  <FieldError message={err('vat')} />
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">From</Label>
                <Input type="date" value={l.fromDate} onChange={(e) => update(l.key, { fromDate: e.target.value })} className="h-9 text-xs" aria-invalid={Boolean(err('from_date')) || undefined} />
                <FieldError message={err('from_date')} />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">To</Label>
                <Input type="date" value={l.toDate} onChange={(e) => update(l.key, { toDate: e.target.value })} className="h-9 text-xs" aria-invalid={Boolean(err('to_date')) || undefined} />
                <FieldError message={err('to_date')} />
              </div>
              {withVat ? (
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Unit</Label>
                  <Input value={l.unit} onChange={(e) => update(l.key, { unit: e.target.value })} placeholder="Mbps" className="h-9 text-xs" />
                </div>
              ) : null}
              <div className={withVat ? 'col-span-8 sm:col-span-4 space-y-1' : 'col-span-12 sm:col-span-6 space-y-1'}>
                <Label className="text-[11px] text-muted-foreground">Description</Label>
                <Input value={l.description} onChange={(e) => update(l.key, { description: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="text-[11px] text-muted-foreground">
                Line total <span className="font-mono font-semibold text-foreground">{formatBdtWithSymbol(lineTotal(l, withVat))}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onChange(lines.filter((x) => x.key !== l.key))}
                disabled={lines.length === 1}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
