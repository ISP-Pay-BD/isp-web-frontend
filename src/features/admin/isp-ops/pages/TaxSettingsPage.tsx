'use client';

import { useMemo, useState } from 'react';
import {
  Building2,
  Percent,
  ShieldCheck,
  Calculator,
  AlertCircle,
  FileCheck,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  fmtStamp,
  useSaveTaxConfig,
  useTaxConfig,
  type TaxConfig,
  type TaxMode,
} from '../hooks/use-billing-config';

interface FormState {
  enabled: boolean;
  label: string;
  ratePercent: string;
  mode: TaxMode;
  binNumber: string;
  tinNumber: string;
  registrationNumber: string;
}

const toForm = (cfg: TaxConfig): FormState => ({
  enabled: cfg.enabled,
  label: cfg.label,
  ratePercent: String(cfg.ratePercent),
  mode: cfg.mode,
  binNumber: cfg.binNumber ?? '',
  tinNumber: cfg.tinNumber ?? '',
  registrationNumber: cfg.registrationNumber ?? '',
});

export function TaxSettingsPage() {
  const t = useTranslations();
  const { data: tax, isLoading, isError, error, refetch } = useTaxConfig();
  const save = useSaveTaxConfig();
  const [form, setForm] = useState<FormState | null>(null);
  const [calcBase, setCalcBase] = useState('');

  const modeItems = useMemo<Record<TaxMode, string>>(
    () => ({
      exclusive: t('admin.ops.tax.modeExclusiveLong', 'Exclusive — added on top of the price'),
      inclusive: t('admin.ops.tax.modeInclusiveLong', 'Inclusive — already in the price'),
    }),
    [t],
  );

  const calc = useMemo(() => {
    const base = Number(calcBase) || 0;
    const rate = tax?.enabled ? tax.ratePercent : 0;
    if (tax?.mode === 'inclusive') {
      const vat = base - base / (1 + rate / 100);
      return { vat, net: base - vat, gross: base };
    }
    const vat = base * (rate / 100);
    return { vat, net: base, gross: base + vat };
  }, [calcBase, tax]);

  const handleToggleEnabled = () => {
    if (!tax) return;
    save.mutate(
      { ...toTaxInput(toForm(tax)), enabled: !tax.enabled },
      {
        onSuccess: (saved) =>
          toast.success(
            saved.enabled
              ? t('admin.ops.tax.toastEnabled', '{label} enabled', { label: saved.label })
              : t('admin.ops.tax.toastDisabled', '{label} disabled', { label: saved.label }),
          ),
      },
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    save.mutate(toTaxInput(form), {
      onSuccess: () => {
        toast.success(t('admin.ops.tax.saved', 'Tax settings saved'));
        setForm(null);
      },
    });
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !tax) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.tax.loadFailed', 'Failed to load tax settings')}
        description={errorMessage(error, t('admin.ops.tax.loadFailedDesc', 'Could not load the tax configuration.'))}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const registration = tax.binNumber ?? tax.tinNumber ?? tax.registrationNumber;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('admin.ops.tax.rowLabel', 'Tax label'), value: tax.label },
    { label: t('admin.ops.tax.rowRate', 'Rate'), value: `${tax.ratePercent}%` },
    { label: t('admin.ops.tax.rowCalculation', 'Calculation'), value: modeItems[tax.mode] },
    { label: 'BIN', value: tax.binNumber ?? '—' },
    { label: 'TIN', value: tax.tinNumber ?? '—' },
    { label: t('admin.ops.tax.rowRegistration', 'Registration no.'), value: tax.registrationNumber ?? '—' },
  ];

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('admin.ops.tax.title', 'Tax & VAT Settings')}
        subtitle={t('admin.ops.tax.subtitle', 'Your VAT rate, how it is applied to prices, and the registration numbers printed on invoices.')}
        breadcrumb={[
          { label: t('common.crumb.admin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.billing', 'Billing') },
          { label: t('admin.ops.tax.crumb', 'Tax / VAT') },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setForm(toForm(tax))}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" /> {t('admin.ops.tax.editSettings', 'Edit Settings')}
          </Button>
        }
      />

      {!tax.configured && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('admin.ops.tax.notConfigured', 'Tax is not configured yet. Edit the settings to set your VAT rate and registration numbers.')}
        </div>
      )}

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.customers.list.statusLabel', 'Status')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleToggleEnabled}
              disabled={save.isPending}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition',
                tax.enabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-muted/60 text-muted-foreground border-border/80',
              )}
            >
              {tax.enabled ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {tax.enabled ? t('status.enabled', 'Enabled') : t('status.disabled', 'Disabled')}
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {tax.enabled ? t('admin.ops.tax.clickDisable', 'Click to disable') : t('admin.ops.tax.clickEnable', 'Click to enable')}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.tax.kpiRate', '{label} Rate', { label: tax.label })}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {tax.ratePercent}%
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.tax.rowCalculation', 'Calculation')}</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-sky-600 dark:text-sky-400 capitalize">
              {tax.mode === 'inclusive' ? t('admin.ops.tax.modeInclusive', 'Inclusive') : t('admin.ops.tax.modeExclusive', 'Exclusive')}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {tax.mode === 'inclusive' ? t('admin.ops.tax.modeInclusiveHint', 'Already included in prices') : t('admin.ops.tax.modeExclusiveHint', 'Added on top of prices')}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.tax.kpiRegistration', 'Registration')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-foreground font-mono truncate">{registration ?? t('admin.ops.tax.notSet', 'Not set')}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {tax.binNumber
              ? 'BIN'
              : tax.tinNumber
                ? 'TIN'
                : tax.registrationNumber
                  ? t('admin.ops.tax.rowRegistration', 'Registration no.')
                  : t('admin.ops.tax.addBin', 'Add BIN / TIN in settings')}
          </div>
        </Card>
      </div>

      {/* Calculator using the saved settings */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('admin.ops.tax.calculator', '{label} Calculator', { label: tax.label })}</h3>
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-border/80">
              {t('admin.ops.tax.usesSaved', 'Uses your saved settings')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label htmlFor="tax-base" className="text-xs font-medium text-muted-foreground block mb-1">
                {tax.mode === 'inclusive' ? t('admin.ops.tax.priceIncl', 'Price incl. tax (BDT)') : t('admin.ops.tax.priceExcl', 'Price before tax (BDT)')}
              </label>
              <Input
                id="tax-base"
                type="number"
                min={0}
                placeholder={t('admin.ops.tax.enterAmount', 'Enter an amount')}
                value={calcBase}
                onChange={(e) => setCalcBase(e.target.value)}
                className="h-9 text-xs font-mono font-bold"
              />
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/60">
              <span className="text-xs text-muted-foreground uppercase font-semibold">{t('admin.ops.tax.netOfTax', 'Net of tax')}</span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums">{formatBdtWithSymbol(calc.net)}</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/60">
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                {tax.label} {tax.enabled ? `(${tax.ratePercent}%)` : `(${t('admin.ops.tax.disabledShort', 'disabled')})`}
              </span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums">{formatBdtWithSymbol(calc.vat)}</p>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <span className="text-xs text-primary uppercase font-semibold">{t('admin.ops.tax.customerPays', 'Customer pays')}</span>
              <p className="text-lg font-bold text-primary font-mono tabular-nums">{formatBdtWithSymbol(calc.gross)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t('admin.ops.tax.colSetting', 'Setting')}</th>
                <th className="py-3 px-3">{t('admin.ops.tax.colValue', 'Value')}</th>
                <th className="py-3 px-3 text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground text-sm">{row.label}</td>
                  <td className="py-3.5 px-3 font-mono text-foreground break-words">{row.value}</td>
                  <td className="py-3.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm(toForm(tax))}
                      className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                    >
                      <Sliders className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tax.updatedAt && (
          <div className="border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            {tax.updatedByName
              ? t('admin.ops.tax.lastSavedBy', 'Last saved {when} by {name}', { when: fmtStamp(tax.updatedAt), name: tax.updatedByName })
              : t('admin.ops.tax.lastSaved', 'Last saved {when}', { when: fmtStamp(tax.updatedAt) })}
          </div>
        )}
      </Card>

      {/* Edit drawer */}
      <Sheet open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {form && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-bold text-foreground">{t('admin.ops.tax.sheetTitle', 'Tax Settings')}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {t('admin.ops.tax.sheetDesc', 'One tax configuration for your whole account.')}
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <Card className="p-4 border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{t('admin.ops.tax.chargeTax', 'Charge tax')}</p>
                      <p className="text-xs text-muted-foreground">{t('admin.ops.tax.chargeTaxHint', 'Apply this tax to customer bills')}</p>
                    </div>
                    <Switch aria-label={t('admin.ops.tax.chargeTax', 'Charge tax')} checked={form.enabled} onCheckedChange={(v) => set('enabled', Boolean(v))} />
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="tax-label" className="font-semibold text-foreground">{t('admin.ops.tax.fieldLabel', 'Label')}</label>
                    <Input
                      id="tax-label"
                      required
                      maxLength={40}
                      value={form.label}
                      onChange={(e) => set('label', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tax-rate" className="font-semibold text-foreground">{t('admin.ops.tax.fieldRate', 'Rate (%)')}</label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      required
                      value={form.ratePercent}
                      onChange={(e) => set('ratePercent', e.target.value)}
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="tax-mode" className="font-semibold text-foreground">{t('admin.ops.tax.rowCalculation', 'Calculation')}</label>
                  <Select items={modeItems} value={form.mode} onValueChange={(v) => v && set('mode', v as TaxMode)}>
                    <SelectTrigger id="tax-mode" className="h-9 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(modeItems) as TaxMode[]).map((m) => (
                        <SelectItem key={m} value={m}>
                          {modeItems[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(
                  [
                    ['binNumber', t('admin.ops.tax.fieldBin', 'BIN (VAT registration)')],
                    ['tinNumber', 'TIN'],
                    ['registrationNumber', t('admin.ops.tax.fieldOther', 'Other registration no.')],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <label htmlFor={`tax-${key}`} className="font-semibold text-foreground">{label}</label>
                    <Input
                      id={`tax-${key}`}
                      maxLength={50}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <Button
                    type="submit"
                    disabled={save.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                  >
                    {save.isPending ? t('admin.ops.tax.saving', 'Saving…') : t('admin.ops.tax.saveSettings', 'Save Tax Settings')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(null)}
                    className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                </div>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function toTaxInput(f: FormState) {
  return {
    enabled: f.enabled,
    label: f.label.trim(),
    ratePercent: Number(f.ratePercent || 0),
    mode: f.mode,
    binNumber: f.binNumber.trim() || null,
    tinNumber: f.tinNumber.trim() || null,
    registrationNumber: f.registrationNumber.trim() || null,
  };
}
