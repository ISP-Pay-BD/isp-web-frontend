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
import {
  fmtStamp,
  useSaveTaxConfig,
  useTaxConfig,
  type TaxConfig,
  type TaxMode,
} from '../hooks/use-billing-config';

const MODE_ITEMS: Record<TaxMode, string> = {
  exclusive: 'Exclusive — added on top of the price',
  inclusive: 'Inclusive — already in the price',
};

interface FormState {
  enabled: boolean;
  label: string;
  ratePercent: string;
  mode: TaxMode;
  binNumber: string;
  tinNumber: string;
  registrationNumber: string;
}

const toForm = (t: TaxConfig): FormState => ({
  enabled: t.enabled,
  label: t.label,
  ratePercent: String(t.ratePercent),
  mode: t.mode,
  binNumber: t.binNumber ?? '',
  tinNumber: t.tinNumber ?? '',
  registrationNumber: t.registrationNumber ?? '',
});

export function TaxSettingsPage() {
  const { data: tax, isLoading, isError, error, refetch } = useTaxConfig();
  const save = useSaveTaxConfig();
  const [form, setForm] = useState<FormState | null>(null);
  const [calcBase, setCalcBase] = useState('');

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
      { onSuccess: (t) => toast.success(`${t.label} ${t.enabled ? 'enabled' : 'disabled'}`) },
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    save.mutate(toTaxInput(form), {
      onSuccess: () => {
        toast.success('Tax settings saved');
        setForm(null);
      },
    });
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !tax) {
    return (
      <EmptyState
        title="Failed to load tax settings"
        description={errorMessage(error, 'Could not load the tax configuration.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const registration = tax.binNumber ?? tax.tinNumber ?? tax.registrationNumber;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Tax label', value: tax.label },
    { label: 'Rate', value: `${tax.ratePercent}%` },
    { label: 'Calculation', value: MODE_ITEMS[tax.mode] },
    { label: 'BIN', value: tax.binNumber ?? '—' },
    { label: 'TIN', value: tax.tinNumber ?? '—' },
    { label: 'Registration no.', value: tax.registrationNumber ?? '—' },
  ];

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Tax & VAT Settings"
        subtitle="Your VAT rate, how it is applied to prices, and the registration numbers printed on invoices."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Tax / VAT' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setForm(toForm(tax))}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" /> Edit Settings
          </Button>
        }
      />

      {!tax.configured && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Tax is not configured yet. Edit the settings to set your VAT rate and registration numbers.
        </div>
      )}

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
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
              {tax.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Click to {tax.enabled ? 'disable' : 'enable'}</div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tax.label} Rate</span>
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculation</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-sky-600 dark:text-sky-400 capitalize">{tax.mode}</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {tax.mode === 'inclusive' ? 'Already included in prices' : 'Added on top of prices'}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-foreground font-mono truncate">{registration ?? 'Not set'}</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {tax.binNumber ? 'BIN' : tax.tinNumber ? 'TIN' : tax.registrationNumber ? 'Registration no.' : 'Add BIN / TIN in settings'}
          </div>
        </Card>
      </div>

      {/* Calculator using the saved settings */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{tax.label} Calculator</h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/80">
              Uses your saved settings
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label htmlFor="tax-base" className="text-[11px] font-medium text-muted-foreground block mb-1">
                {tax.mode === 'inclusive' ? 'Price incl. tax (BDT)' : 'Price before tax (BDT)'}
              </label>
              <Input
                id="tax-base"
                type="number"
                min={0}
                placeholder="Enter an amount"
                value={calcBase}
                onChange={(e) => setCalcBase(e.target.value)}
                className="h-9 text-xs font-mono font-bold"
              />
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Net of tax</span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums">{formatBdtWithSymbol(calc.net)}</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                {tax.label} {tax.enabled ? `(${tax.ratePercent}%)` : '(disabled)'}
              </span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums">{formatBdtWithSymbol(calc.vat)}</p>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <span className="text-[10px] text-primary uppercase font-semibold">Customer pays</span>
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
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Setting</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground text-sm">{row.label}</td>
                  <td className="py-3.5 px-3 font-mono text-foreground">{row.value}</td>
                  <td className="py-3.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm(toForm(tax))}
                      className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                    >
                      <Sliders className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tax.updatedAt && (
          <div className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            Last saved {fmtStamp(tax.updatedAt)}
            {tax.updatedByName ? ` by ${tax.updatedByName}` : ''}
          </div>
        )}
      </Card>

      {/* Edit drawer */}
      <Sheet open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {form && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-bold text-foreground">Tax Settings</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  One tax configuration for your whole account.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <Card className="p-4 border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">Charge tax</p>
                      <p className="text-[11px] text-muted-foreground">Apply this tax to customer bills</p>
                    </div>
                    <Switch checked={form.enabled} onCheckedChange={(v) => set('enabled', Boolean(v))} />
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="tax-label" className="font-semibold text-foreground">Label</label>
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
                    <label htmlFor="tax-rate" className="font-semibold text-foreground">Rate (%)</label>
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
                  <label htmlFor="tax-mode" className="font-semibold text-foreground">Calculation</label>
                  <Select items={MODE_ITEMS} value={form.mode} onValueChange={(v) => v && set('mode', v as TaxMode)}>
                    <SelectTrigger id="tax-mode" className="h-9 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MODE_ITEMS) as TaxMode[]).map((m) => (
                        <SelectItem key={m} value={m}>
                          {MODE_ITEMS[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(
                  [
                    ['binNumber', 'BIN (VAT registration)'],
                    ['tinNumber', 'TIN'],
                    ['registrationNumber', 'Other registration no.'],
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
                    {save.isPending ? 'Saving…' : 'Save Tax Settings'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(null)}
                    className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                  >
                    Cancel
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
