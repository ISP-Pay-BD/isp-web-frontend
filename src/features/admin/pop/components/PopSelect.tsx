'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { usePops, type PopReseller } from '../hooks/use-pop';

/** Backend max page size; tenants with more POPs get a server-side search box. */
const OPTION_LIMIT = 100;

/**
 * POP picker fed by GET /v1/pops. Selects the first POP when nothing is
 * chosen yet so ledger screens open on real data.
 */
export function PopSelect({
  value,
  onChange,
  className,
  autoSelectFirst = true,
}: {
  value: PopReseller | null;
  onChange: (pop: PopReseller) => void;
  className?: string;
  autoSelectFirst?: boolean;
}) {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300); // debounce server search
    return () => clearTimeout(timer);
  }, [input]);
  const { data, isLoading, isError } = usePops({ page: 1, pageSize: OPTION_LIMIT, search });
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const hasMore = (data?.meta.total ?? 0) > items.length;

  useEffect(() => {
    if (autoSelectFirst && !value && !search && items.length > 0) onChange(items[0]);
  }, [autoSelectFirst, value, search, items, onChange]);

  const options = value && !items.some((p) => p.id === value.id) ? [value, ...items] : items;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {(hasMore || input) && (
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('admin.pop.select.find', 'Find POP…')}
          className="h-9 w-40 text-xs"
          aria-label={t('admin.pop.select.search', 'Search POPs')}
        />
      )}
      <Select
        value={value?.id ?? null}
        onValueChange={(id) => {
          const pop = options.find((p) => p.id === id);
          if (pop) onChange(pop);
        }}
        disabled={isLoading || isError}
      >
        <SelectTrigger aria-label="POP" className="h-9 min-w-[220px] text-xs">
          <SelectValue>
            {(id: string | null) =>
              id
                ? (options.find((p) => p.id === id)?.name ?? value?.name ?? id)
                : isLoading
                  ? t('admin.pop.select.loading', 'Loading POPs…')
                  : isError
                    ? t('admin.pop.select.failed', 'Could not load POPs')
                    : items.length === 0
                      ? t('admin.pop.select.none', 'No POPs found')
                      : t('admin.pop.select.placeholder', 'Select POP')
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
