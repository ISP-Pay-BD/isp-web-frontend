'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { todayYmd } from '../table-utils';
import { ledgerEntrySchema, type LedgerEntryFormValues } from './schema';
import { ManageCategoriesDialog } from './ManageCategoriesDialog';
import {
  LEDGER_CONFIG,
  useEntryOptions,
  useLedgerCategories,
  useSaveLedgerEntry,
  type LedgerEntry,
  type LedgerKind,
} from './api';

interface LedgerEntryModalProps {
  kind: LedgerKind;
  noun: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create */
  entry: LedgerEntry | null;
}

/** Adds `current` to `list` when an existing entry references a value no longer offered. */
function withCurrent(list: string[], current?: string): string[] {
  return current && !list.includes(current) ? [current, ...list] : list;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-destructive text-xs">{message}</p> : null;
}

export function LedgerEntryModal({ kind, noun, open, onOpenChange, entry }: LedgerEntryModalProps) {
  const [manageOpen, setManageOpen] = useState(false);
  const categories = useLedgerCategories(kind);
  const options = useEntryOptions(open);

  const form = useForm<LedgerEntryFormValues>({
    resolver: zodResolver(ledgerEntrySchema),
    defaultValues: entry
      ? {
          name: entry.name,
          category: entry.category,
          employee: entry.employeeId,
          date: entry.date,
          amount: entry.amount,
          bank_account: entry.bankAccount,
          invoice_no: entry.invoiceNo,
          description: entry.description,
        }
      : {
          name: '',
          category: '',
          employee: '',
          date: todayYmd(),
          bank_account: '',
          invoice_no: '',
          description: '',
        },
  });
  const { errors } = form.formState;

  // Backend reports the category under its own key (income_category / expense_head).
  const setServerError: UseFormSetError<LedgerEntryFormValues> = (field, error, opts) =>
    form.setError(
      (field as string) === LEDGER_CONFIG[kind].categoryField ? 'category' : field,
      error,
      opts,
    );
  const save = useSaveLedgerEntry(kind, (e) => handleApiError(e, setServerError));

  const categoryNames = withCurrent(
    (categories.data ?? []).map((c) => c.name),
    entry?.category,
  );
  const bankAccounts = withCurrent(options.data?.bankAccounts ?? [], entry?.bankAccount);
  const employees = useMemo(() => {
    const list = options.data?.employees ?? [];
    return entry?.employeeId && !list.some((e) => e.id === entry.employeeId)
      ? [{ id: entry.employeeId, name: entry.employeeName || `#${entry.employeeId}` }, ...list]
      : list;
  }, [options.data, entry]);
  const employeeLabels = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.name])),
    [employees],
  );

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(
      {
        id: entry?.id,
        input: {
          ...values,
          invoice_no: values.invoice_no ?? '',
          description: values.description ?? '',
        },
      },
      {
        onSuccess: () => {
          toast.success(
            entry
              ? `Entry #${entry.id} updated`
              : `${noun.charAt(0).toUpperCase()}${noun.slice(1)} entry recorded (pending approval)`,
          );
          onOpenChange(false);
        },
      },
    ),
  );

  const optionsLoading = options.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {entry ? `Edit ${noun} entry #${entry.id}` : `Record ${noun} entry`}
          </DialogTitle>
          <DialogDescription>
            New entries are saved as pending until an admin approves them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ledger-name">Name *</Label>
            <Input id="ledger-name" {...form.register('name')} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ledger-category">Category *</Label>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="text-primary text-[11px] hover:underline"
                >
                  Manage
                </button>
              </div>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? '')}
                    disabled={categories.isPending}
                  >
                    <SelectTrigger id="ledger-category" className="w-full">
                      <SelectValue
                        placeholder={categories.isPending ? 'Loading…' : 'Select category'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {categories.isSuccess && categoryNames.length === 0 && (
                <p className="text-muted-foreground text-[11px]">
                  No categories yet — add one via Manage.
                </p>
              )}
              {categories.isError && (
                <p className="text-destructive text-xs">Could not load categories.</p>
              )}
              <FieldError message={errors.category?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ledger-date">Date *</Label>
              <Input id="ledger-date" type="date" {...form.register('date')} />
              <FieldError message={errors.date?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ledger-amount">Amount (৳) *</Label>
              <Input
                id="ledger-amount"
                type="number"
                step="0.01"
                min="0"
                {...form.register('amount', { valueAsNumber: true })}
              />
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ledger-employee">Employee *</Label>
              <Controller
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <Select
                    items={employeeLabels}
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? '')}
                    disabled={optionsLoading}
                  >
                    <SelectTrigger id="ledger-employee" className="w-full">
                      <SelectValue placeholder={optionsLoading ? 'Loading…' : 'Select employee'} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {options.isSuccess && employees.length === 0 && (
                <p className="text-muted-foreground text-[11px]">No employees available.</p>
              )}
              <FieldError message={errors.employee?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ledger-bank">Bank account *</Label>
              <Controller
                control={form.control}
                name="bank_account"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? '')}
                    disabled={optionsLoading}
                  >
                    <SelectTrigger id="ledger-bank" className="w-full">
                      <SelectValue placeholder={optionsLoading ? 'Loading…' : 'Select account'} />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {options.isSuccess && bankAccounts.length === 0 && (
                <p className="text-muted-foreground text-[11px]">No bank accounts available.</p>
              )}
              {options.isError && (
                <p className="text-destructive text-xs">
                  Could not load employees / bank accounts.
                </p>
              )}
              <FieldError message={errors.bank_account?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ledger-invoice">Invoice no.</Label>
              <Input id="ledger-invoice" {...form.register('invoice_no')} />
              <FieldError message={errors.invoice_no?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ledger-description">Description</Label>
            <Textarea id="ledger-description" rows={2} {...form.register('description')} />
            <FieldError message={errors.description?.message} />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={save.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={save.isPending}
            >
              {save.isPending ? 'Saving…' : entry ? 'Save changes' : 'Record entry'}
            </Button>
          </DialogFooter>
        </form>

        {/* Nested in the popup so the category dialog stacks on top of this one. */}
        {manageOpen && (
          <ManageCategoriesDialog kind={kind} noun={noun} open onOpenChange={setManageOpen} />
        )}
      </DialogContent>
    </Dialog>
  );
}
