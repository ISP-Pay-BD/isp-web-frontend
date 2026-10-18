'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';

const KPI_TONES = {
  emerald: {
    glow: 'bg-emerald-500/5',
    icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    value: 'text-emerald-400',
  },
  rose: {
    glow: 'bg-rose-500/5',
    icon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    value: 'text-rose-400',
  },
  blue: {
    glow: 'bg-blue-500/5',
    icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    value: 'text-blue-400',
  },
  amber: {
    glow: 'bg-amber-500/5',
    icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    value: 'text-amber-400',
  },
  purple: {
    glow: 'bg-purple-500/5',
    icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    value: 'text-foreground',
  },
} as const;

export type KpiTone = keyof typeof KPI_TONES;

/** KPI tile used across the accounting screens. */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  tone: KpiTone;
  valueClassName?: string;
}) {
  const t = KPI_TONES[tone];
  return (
    <Card className="border-border/70 bg-card/60 relative overflow-hidden border shadow-sm backdrop-blur-md">
      <div
        className={cn(
          'pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full blur-xl',
          t.glow,
        )}
      />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {label}
          </span>
          <div className={cn('rounded-lg border p-2', t.icon)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div
          className={cn('mt-2 font-mono text-2xl font-black tabular-nums', t.value, valueClassName)}
        >
          {value}
        </div>
        {hint ? <div className="text-muted-foreground mt-2 text-xs">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

/**
 * Search box whose value is debounced into `onSearchChange` (server search).
 * `onSearchChange` must be stable (e.g. from `useServerTable`).
 */
export function DebouncedSearchInput({
  onSearchChange,
  placeholder,
  className,
}: {
  onSearchChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const t = useTranslations();
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value, onSearchChange]);

  return (
    <div className={cn('relative max-w-md flex-1', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-background/80 h-9 pl-9 text-xs"
      />
      {value && (
        <button
          type="button"
          aria-label={t('admin.accounting.shared.clearSearch', 'Clear search')}
          onClick={() => setValue('')}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** From / To date inputs (YYYY-MM-DD; empty = no bound). */
export function DateRangeInputs({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label={t('admin.accounting.shared.fromDate', 'From date')}
        value={from}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="bg-background/80 h-9 w-[150px] font-mono text-xs"
      />
      <span className="text-muted-foreground text-xs">{t('admin.accounting.shared.to', 'to')}</span>
      <Input
        type="date"
        aria-label={t('admin.accounting.shared.toDate', 'To date')}
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="bg-background/80 h-9 w-[150px] font-mono text-xs"
      />
    </div>
  );
}
