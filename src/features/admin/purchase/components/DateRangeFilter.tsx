'use client';

import { Input } from '@/components/ui/input';
import { useTranslations } from '@/i18n/locale-context';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

/** From / to (Y-m-d) inputs for a table toolbar. */
export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label={t('admin.purchase.dateRange.from', 'From date')}
        value={from}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="h-9 w-36 text-xs font-mono"
      />
      <span className="text-xs text-muted-foreground">{t('admin.purchase.dateRange.sep', 'to')}</span>
      <Input
        type="date"
        aria-label={t('admin.purchase.dateRange.to', 'To date')}
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="h-9 w-36 text-xs font-mono"
      />
    </div>
  );
}
