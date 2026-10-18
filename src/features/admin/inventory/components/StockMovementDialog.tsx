'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightLeft, PackageMinus, PackagePlus, SlidersHorizontal } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { num } from '@/lib/api/case';
import { useTranslations } from '@/i18n/locale-context';
import { idParam, type StockMovementType, type StockTransactionPayload } from '../api';
import { useInventoryItemOptions } from '../hooks/use-inventory-items';
import { useStoreLocationOptions } from '../hooks/use-store-locations';
import { useRecordStockTransaction, useStockLevel } from '../hooks/use-stock';
import { OptionSelect } from '../shared/OptionSelect';
import { FieldError, fieldError } from '../shared/form-utils';

export interface StockMovementPrefill {
  itemId?: string;
  locationId?: string;
}

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: StockMovementType;
  /** Hide the type switcher (e.g. the transfers screen only records transfers). */
  lockType?: boolean;
  prefill?: StockMovementPrefill;
}

type Translate = ReturnType<typeof useTranslations>;

function typeMeta(t: Translate): Record<StockMovementType, { label: string; title: string; description: string; submit: string }> {
  return {
    in: {
      label: t('admin.inventory.movement.in.label', 'Stock in'),
      title: t('admin.inventory.movement.in.title', 'Stock In'),
      description: t('admin.inventory.movement.in.desc', 'Receive units into a store location.'),
      submit: t('admin.inventory.movement.in.submit', 'Record stock in'),
    },
    out: {
      label: t('admin.inventory.movement.out.label', 'Stock out'),
      title: t('admin.inventory.movement.out.title', 'Stock Out'),
      description: t('admin.inventory.movement.out.desc', 'Remove units from a store location (consumption, damage, write-off).'),
      submit: t('admin.inventory.movement.out.submit', 'Record stock out'),
    },
    adjust: {
      label: t('admin.inventory.movement.adjust.label', 'Adjust / audit'),
      title: t('admin.inventory.movement.adjust.title', 'Adjust / Audit Count'),
      description: t(
        'admin.inventory.movement.adjust.desc',
        'Enter the physically counted on-hand quantity; the difference is posted as an adjustment.',
      ),
      submit: t('admin.inventory.movement.adjust.submit', 'Save count'),
    },
    transfer: {
      label: t('admin.inventory.movement.transfer.label', 'Transfer'),
      title: t('admin.inventory.movement.transfer.title', 'Transfer Stock'),
      description: t(
        'admin.inventory.movement.transfer.desc',
        'Move units from one store location to another. Transfers take effect immediately.',
      ),
      submit: t('admin.inventory.movement.transfer.submit', 'Transfer stock'),
    },
  };
}

const TYPE_ICON: Record<StockMovementType, typeof PackagePlus> = {
  in: PackagePlus,
  out: PackageMinus,
  adjust: SlidersHorizontal,
  transfer: ArrowRightLeft,
};

/** Stock in / out / adjust / transfer — all via POST /v1/inventory/transactions. */
export function StockMovementDialog({ open, onOpenChange, type, lockType, prefill }: StockMovementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <MovementForm initialType={type} lockType={lockType} prefill={prefill} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MovementForm({
  initialType,
  lockType,
  prefill,
  onDone,
}: {
  initialType: StockMovementType;
  lockType?: boolean;
  prefill?: StockMovementPrefill;
  onDone: () => void;
}) {
  const t = useTranslations();
  const metaByType = useMemo(() => typeMeta(t), [t]);
  const [type, setType] = useState<StockMovementType>(initialType);
  const [itemId, setItemId] = useState(prefill?.itemId ?? '');
  const [locationId, setLocationId] = useState(prefill?.locationId ?? '');
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<Record<string, string>>({});

  const itemsQuery = useInventoryItemOptions();
  const locationsQuery = useStoreLocationOptions();
  const mutation = useRecordStockTransaction();

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);
  const selectedItem = items.find((i) => i.id === itemId);
  const itemOptions = useMemo(
    () =>
      items.map((i) => ({
        value: i.id,
        label: [i.itemName, i.subcategory || i.category].filter(Boolean).join(' · '),
      })),
    [items],
  );
  const locationOptions = useMemo(
    () => (locationsQuery.data ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    [locationsQuery.data],
  );
  const toLocationOptions = useMemo(
    () => locationOptions.filter((o) => o.value !== locationId),
    [locationOptions, locationId],
  );

  const level = useStockLevel(itemId, locationId);
  const meta = metaByType[type];
  const Icon = TYPE_ICON[type];
  const err = mutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const qty = num(quantity, NaN);
    if (!itemId) errors.item_id = t('admin.inventory.movement.errItem', 'Select an item');
    if (!locationId) errors.location_id = t('admin.inventory.movement.errLocation', 'Select a store location');
    if (type === 'transfer') {
      if (!toLocationId) errors.to_location_id = t('admin.inventory.movement.errDest', 'Select the destination location');
      else if (toLocationId === locationId) errors.to_location_id = t('admin.inventory.movement.errSame', 'Destination must differ from the source');
    }
    if (!Number.isFinite(qty) || (type === 'adjust' ? qty < 0 : qty <= 0)) {
      errors.quantity =
        type === 'adjust'
          ? t('admin.inventory.movement.errCounted', 'Enter the counted quantity (0 or more)')
          : t('admin.inventory.movement.errQty', 'Quantity must be greater than 0');
    }
    setLocalError(errors);
    if (Object.keys(errors).length > 0) return;

    const body: StockTransactionPayload = {
      type,
      item_id: idParam(itemId),
      location_id: idParam(locationId),
      to_location_id: type === 'transfer' ? idParam(toLocationId) : undefined,
      quantity: qty,
      unit_cost: type === 'in' && unitCost !== '' ? num(unitCost) : undefined,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
    };
    mutation.mutate(body, {
      onSuccess: () => {
        const name = selectedItem?.itemName ?? t('admin.inventory.movement.itemFallback', 'item');
        toast.success(
          type === 'adjust'
            ? t('admin.inventory.movement.toastAdjust', 'Stock count for "{name}" set to {qty}.', { name, qty })
            : type === 'transfer'
              ? t('admin.inventory.movement.toastTransfer', '{qty} × "{name}" transferred.', { name, qty })
              : t('admin.inventory.movement.toastRecorded', '{label} of {qty} × "{name}" recorded.', { label: meta.label, name, qty }),
        );
        onDone();
      },
    });
  };

  const errorFor = (key: string) => localError[key] ?? fieldError(err, key);

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {meta.title}
        </DialogTitle>
        <DialogDescription>{meta.description}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {!lockType ? (
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/70 bg-muted/40 p-0.5 sm:grid-cols-4">
            {(Object.keys(metaByType) as StockMovementType[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setType(kind);
                  setLocalError({});
                }}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
                  kind === type ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {metaByType[kind].label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="mv-item">{t('admin.inventory.movement.item', 'Item')} *</Label>
          <OptionSelect
            id="mv-item"
            value={itemId}
            onChange={setItemId}
            options={itemOptions}
            placeholder={itemsQuery.isLoading ? t('admin.inventory.movement.loadingItems', 'Loading items…') : t('admin.inventory.movement.selectItem', 'Select item')}
            disabled={itemsQuery.isLoading}
            invalid={Boolean(errorFor('item_id'))}
          />
          <FieldError message={errorFor('item_id') ?? (itemsQuery.isError ? t('admin.inventory.movement.itemsFailed', 'Could not load items') : undefined)} />
        </div>

        <div className={cn('grid gap-3', type === 'transfer' && 'grid-cols-2')}>
          <div className="space-y-1.5">
            <Label htmlFor="mv-loc">{type === 'transfer' ? t('admin.inventory.movement.fromLocation', 'From location *') : t('admin.inventory.movement.storeLocation', 'Store location *')}</Label>
            <OptionSelect
              id="mv-loc"
              value={locationId}
              onChange={setLocationId}
              options={locationOptions}
              placeholder={locationsQuery.isLoading ? t('admin.inventory.items.loading', 'Loading…') : t('admin.inventory.movement.selectLocation', 'Select location')}
              disabled={locationsQuery.isLoading}
              invalid={Boolean(errorFor('location_id'))}
            />
            <FieldError message={errorFor('location_id')} />
          </div>
          {type === 'transfer' ? (
            <div className="space-y-1.5">
              <Label htmlFor="mv-to">{t('admin.inventory.movement.toLocation', 'To location *')}</Label>
              <OptionSelect
                id="mv-to"
                value={toLocationId}
                onChange={setToLocationId}
                options={toLocationOptions}
                placeholder={t('admin.inventory.movement.destination', 'Destination')}
                disabled={locationsQuery.isLoading}
                invalid={Boolean(errorFor('to_location_id'))}
              />
              <FieldError message={errorFor('to_location_id')} />
            </div>
          ) : null}
        </div>

        {itemId && locationId ? (
          <p className="text-xs text-muted-foreground">
            {t('admin.inventory.movement.onHand', 'Current on hand at this location:')}{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {level.isLoading ? '…' : level.isError ? t('admin.inventory.movement.unavailable', 'unavailable') : (level.data ?? 0)}
            </span>
          </p>
        ) : null}

        <div className={cn('grid gap-3', type === 'in' && 'grid-cols-2')}>
          <div className="space-y-1.5">
            <Label htmlFor="mv-qty">{type === 'adjust' ? t('admin.inventory.movement.countedQty', 'Counted on-hand quantity *') : t('admin.inventory.movement.qty', 'Quantity *')}</Label>
            <Input
              id="mv-qty"
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              aria-invalid={Boolean(errorFor('quantity')) || undefined}
              required
            />
            <FieldError message={errorFor('quantity')} />
          </div>
          {type === 'in' ? (
            <div className="space-y-1.5">
              <Label htmlFor="mv-cost">{t('admin.inventory.movement.unitCost', 'Unit cost (BDT)')}</Label>
              <Input
                id="mv-cost"
                type="number"
                min={0}
                step="any"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder={selectedItem ? String(selectedItem.unitPrice) : undefined}
              />
              <FieldError message={fieldError(err, 'unit_cost')} />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mv-ref">{t('admin.inventory.movement.reference', 'Reference')}</Label>
            <Input id="mv-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={t('admin.inventory.movement.refPlaceholder', 'Chalan / bill no.')} />
            <FieldError message={fieldError(err, 'reference')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mv-note">{t('admin.inventory.movement.note', 'Note')}</Label>
            <Input id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} />
            <FieldError message={fieldError(err, 'note')} />
          </div>
        </div>
        <FieldError message={fieldError(err, 'type')} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t('admin.inventory.common.saving', 'Saving…') : meta.submit}
        </Button>
      </DialogFooter>
    </form>
  );
}
