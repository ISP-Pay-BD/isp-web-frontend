'use client';

import { useMemo } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { CheckCircle2, Plus, Scale, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { num } from '@/lib/api/case';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import { useChartOfAccounts } from '../../chart-of-accounts/hooks/use-chart-of-accounts';
import { money } from '../../shared/format';
import { todayYmd } from '../../shared/table-utils';
import { useLocale } from '@/i18n/locale-context';
import { useCreateJournalEntry } from '../hooks/use-journal-entries';

/** Snake_case names so the backend's 422 details (`lines.N.account_id`, …) map straight onto fields. */
interface VoucherForm {
  entry_date: string;
  description: string;
  lines: Array<{ account_id: string; debit: string; credit: string }>;
}

const emptyLine = { account_id: '', debit: '', credit: '' };
const cents = (v: string) => Math.round(num(v) * 100);

export function NewJournalVoucherDialog({ onClose }: { onClose: () => void }) {
  const { t, te } = useLocale();
  const { accounts, isLoading: accountsLoading, isError: accountsError } = useChartOfAccounts();
  const form = useForm<VoucherForm>({
    defaultValues: { entry_date: todayYmd(), description: '', lines: [emptyLine, emptyLine] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' });
  const lines = useWatch({ control: form.control, name: 'lines' });
  const [entryDate, description] = useWatch({
    control: form.control,
    name: ['entry_date', 'description'],
  });
  const { errors } = form.formState;

  const create = useCreateJournalEntry((e) => handleApiError(e, form.setError));

  const accountLabels = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, `${a.code} — ${a.name}`])),
    [accounts],
  );

  const debitCents = lines.reduce((s, l) => s + cents(l.debit), 0);
  const creditCents = lines.reduce((s, l) => s + cents(l.credit), 0);
  const diffCents = debitCents - creditCents;
  const linesValid = lines.every((l) => l.account_id && cents(l.debit) > 0 !== cents(l.credit) > 0);
  const blocker =
    lines.length < 2
      ? t('admin.accounting.journal.dialog.blockLines', 'Add at least two lines.')
      : !linesValid
        ? t('admin.accounting.journal.dialog.blockLineValid', 'Each line needs an account and either a debit or a credit amount.')
        : debitCents === 0
          ? t('admin.accounting.journal.dialog.blockAmounts', 'Enter the voucher amounts.')
          : diffCents !== 0
            ? t('admin.accounting.journal.dialog.blockBalance', 'Total debits must equal total credits.')
            : !entryDate || !description.trim()
              ? t('admin.accounting.journal.dialog.blockFields', 'Date and description are required.')
              : null;

  const onSubmit = form.handleSubmit((v) =>
    create.mutate(
      {
        entry_date: v.entry_date,
        description: v.description.trim(),
        lines: v.lines.map((l) => ({
          account_id: Number(l.account_id),
          debit: cents(l.debit) / 100,
          credit: cents(l.credit) / 100,
        })),
      },
      {
        onSuccess: (res) => {
          toast.success(
            res?.id
              ? t('admin.accounting.journal.dialog.postedId', 'Journal voucher #{id} posted', { id: String(res.id) })
              : t('admin.accounting.journal.dialog.posted', 'Journal voucher posted'),
          );
          onClose();
        },
      },
    ),
  );

  const linesError = errors.lines?.message ?? errors.lines?.root?.message;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('admin.accounting.journal.dialog.title', 'Record Journal Voucher')}</DialogTitle>
          <DialogDescription>
            {t('admin.accounting.journal.dialog.desc', 'Post a balanced double-entry transaction to the general ledger.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="jv-date" className="text-muted-foreground text-xs font-semibold">
                {t('admin.accounting.journal.dialog.date', 'Date *')}
              </Label>
              <Input
                id="jv-date"
                type="date"
                className="h-9 font-mono text-xs"
                {...form.register('entry_date')}
              />
              {errors.entry_date && (
                <p className="text-destructive text-xs">{te(errors.entry_date.message ?? '')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jv-desc" className="text-muted-foreground text-xs font-semibold">
                {t('admin.accounting.journal.dialog.description', 'Description *')}
              </Label>
              <Input id="jv-desc" className="h-9 text-xs" {...form.register('description')} />
              {errors.description && (
                <p className="text-destructive text-xs">{te(errors.description.message ?? '')}</p>
              )}
            </div>
          </div>

          <div className="border-border/60 overflow-hidden rounded-xl border">
            <div className="bg-muted/40 text-muted-foreground grid grid-cols-[1fr_120px_120px_36px] gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
              <span>{t('admin.accounting.journal.colAccount', 'Account')}</span>
              <span className="text-right">{t('admin.accounting.journal.dialog.debitTaka', 'Debit (৳)')}</span>
              <span className="text-right">{t('admin.accounting.journal.dialog.creditTaka', 'Credit (৳)')}</span>
              <span />
            </div>
            <div className="divide-border/40 divide-y">
              {fields.map((f, i) => {
                const lineErr = errors.lines?.[i];
                const lineMsg =
                  lineErr?.account_id?.message ??
                  lineErr?.debit?.message ??
                  lineErr?.credit?.message ??
                  lineErr?.message;
                return (
                  <div key={f.id} className="space-y-1 px-3 py-2">
                    <div className="grid grid-cols-[1fr_120px_120px_36px] items-center gap-2">
                      <Controller
                        control={form.control}
                        name={`lines.${i}.account_id`}
                        render={({ field }) => (
                          <Select
                            items={accountLabels}
                            value={field.value || null}
                            onValueChange={(v) => field.onChange(v ?? '')}
                            disabled={accountsLoading}
                          >
                            <SelectTrigger
                              className="h-9 w-full text-xs"
                              aria-label={t('admin.accounting.journal.dialog.lineAccount', 'Line {n} account', { n: i + 1 })}
                            >
                              <SelectValue
                                placeholder={
                                  accountsLoading
                                    ? t('admin.accounting.journal.dialog.loadingAccounts', 'Loading accounts…')
                                    : t('admin.accounting.journal.dialog.selectAccount', 'Select account')
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                              {accounts.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.code} — {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        aria-label={t('admin.accounting.journal.dialog.lineDebit', 'Line {n} debit', { n: i + 1 })}
                        className="h-9 text-right font-mono text-xs"
                        {...form.register(`lines.${i}.debit`, {
                          onChange: (e) =>
                            num(e.target.value) > 0 && form.setValue(`lines.${i}.credit`, ''),
                        })}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        aria-label={t('admin.accounting.journal.dialog.lineCredit', 'Line {n} credit', { n: i + 1 })}
                        className="h-9 text-right font-mono text-xs"
                        {...form.register(`lines.${i}.credit`, {
                          onChange: (e) =>
                            num(e.target.value) > 0 && form.setValue(`lines.${i}.debit`, ''),
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        aria-label={t('admin.accounting.journal.dialog.removeLine', 'Remove line {n}', { n: i + 1 })}
                        disabled={fields.length <= 2}
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {lineMsg && <p className="text-destructive text-xs">{lineMsg}</p>}
                  </div>
                );
              })}
            </div>
            <div className="border-border/60 bg-muted/20 grid grid-cols-[1fr_120px_120px_36px] items-center gap-2 border-t px-3 py-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-fit gap-1.5 text-xs"
                onClick={() => append(emptyLine)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('admin.accounting.journal.dialog.addLine', 'Add line')}
              </Button>
              <span className="text-right font-mono text-xs font-bold tabular-nums">
                {money(debitCents / 100)}
              </span>
              <span className="text-right font-mono text-xs font-bold tabular-nums">
                {money(creditCents / 100)}
              </span>
              <span />
            </div>
          </div>

          {accountsError && (
            <p className="text-destructive text-xs">{t('admin.accounting.journal.dialog.accountsFailed', 'Could not load the chart of accounts.')}</p>
          )}
          {linesError && <p className="text-destructive text-xs">{linesError}</p>}

          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium',
              diffCents === 0 && debitCents > 0
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-400',
            )}
          >
            {diffCents === 0 && debitCents > 0 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Scale className="h-4 w-4" />
            )}
            {diffCents === 0
              ? debitCents > 0
                ? t('admin.accounting.journal.dialog.balanced', 'Balanced')
                : t('admin.accounting.journal.dialog.noAmounts', 'No amounts yet')
              : diffCents > 0
                ? t('admin.accounting.journal.dialog.debitsExceed', 'Difference {amount} (debits exceed credits)', { amount: money(Math.abs(diffCents) / 100) })
                : t('admin.accounting.journal.dialog.creditsExceed', 'Difference {amount} (credits exceed debits)', { amount: money(Math.abs(diffCents) / 100) })}
          </div>
          {blocker && <p className="text-muted-foreground text-xs">{blocker}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={create.isPending}
              className="text-xs"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!!blocker || create.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              {create.isPending ? t('admin.accounting.journal.dialog.posting', 'Posting…') : t('admin.accounting.journal.dialog.post', 'Post Journal Voucher')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
