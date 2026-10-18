'use client';

import { useEffect, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useCustomerOptions } from '../hooks/use-catalog';
import type { CustomerOption } from '../catalog.types';

/**
 * Searchable tenant-customer picker (GET /v1/catalog/customers, 20 rows).
 * `multiple` toggles rows in/out of `selected`; single mode replaces it.
 */
export function CatalogCustomerPicker({
  selected,
  onChange,
  multiple = false,
}: {
  selected: CustomerOption[];
  onChange: (next: CustomerOption[]) => void;
  multiple?: boolean;
}) {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300); // debounce server search
    return () => clearTimeout(timer);
  }, [input]);
  const { data, isLoading, isError, error } = useCustomerOptions(search);

  const toggle = (c: CustomerOption) => {
    const isOn = selected.some((s) => s.id === c.id);
    if (!multiple) return onChange(isOn ? [] : [c]);
    onChange(isOn ? selected.filter((s) => s.id !== c.id) : [...selected, c]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('admin.ops.catalogPicker.placeholder', 'Search customer by name, mobile or ID…')}
          className="h-9 pl-8 text-xs"
          aria-label={t('admin.ops.catalogPicker.searchLabel', 'Search customers')}
        />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
        {isLoading ? (
          <p className="p-3 text-xs text-muted-foreground">{t('admin.ops.catalogPicker.loading', 'Loading customers…')}</p>
        ) : isError ? (
          <p className="p-3 text-xs text-destructive">{error?.message ?? t('admin.ops.catalogPicker.loadFailed', 'Could not load customers')}</p>
        ) : (data ?? []).length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">{t('admin.ops.catalogPicker.empty', 'No customers found')}</p>
        ) : (
          (data ?? []).map((c) => {
            const isOn = selected.some((s) => s.id === c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted/40',
                  isOn && 'bg-primary/5',
                )}
              >
                <span>
                  <span className="font-semibold text-foreground">{c.name || `#${c.id}`}</span>
                  <span className="ml-2 font-mono text-muted-foreground">{c.mobile}</span>
                </span>
                {isOn && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })
        )}
      </div>
      {multiple && selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('admin.ops.catalogPicker.selected', '{n} customer(s) selected', { n: formatCount(selected.length) })}
        </p>
      )}
    </div>
  );
}
