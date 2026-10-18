'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { useCustomerOptions, type CustomerOption, type PickOption } from '../hooks/use-network-ops';

const NONE = '__none__';

/** Prev / next footer for the custom (non-DataTable) server-paginated tables. */
export function NetOpsPager({
  page,
  totalPages,
  total,
  onPageChange,
  label = 'records',
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground">
      <span>
        <strong className="text-foreground">{total.toLocaleString()}</strong> {label} · page{' '}
        <strong className="text-foreground">{page}</strong> of {Math.max(1, totalPages)}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** Select over API-provided options; shows the label (not the id) when closed. */
export function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  noneLabel,
  className,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: PickOption[];
  placeholder: string;
  /** When set, an extra first item clears the value. */
  noneLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value || (noneLabel ? NONE : null)} onValueChange={(v) => onChange(!v || v === NONE ? '' : String(v))} disabled={disabled}>
      <SelectTrigger id={id} className={className ?? 'h-9 text-xs'}>
        <SelectValue>
          {(v: string | null) => (v && v !== NONE ? (options.find((o) => o.value === v)?.label ?? v) : (noneLabel ?? placeholder))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {noneLabel ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Server-searched customer picker (tenant scope comes from the JWT). */
export function CustomerPicker({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: CustomerOption | null;
  onChange: (c: CustomerOption | null) => void;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const options = useCustomerOptions(debounced, value === null);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
        <div className="min-w-0 truncate text-xs">
          <span className="font-semibold text-foreground">{value.name}</span>
          <span className="text-muted-foreground">{[value.mobile, value.pppoeId].filter(Boolean).map((v) => ` · ${v}`).join('')}</span>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Clear customer" onClick={() => onChange(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const results = options.data ?? [];
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, mobile or PPPoE ID…"
          className="h-9 pl-8 text-xs"
          autoComplete="off"
        />
      </div>
      <div className="max-h-44 overflow-y-auto rounded-lg border border-border/60">
        {options.isLoading ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
        ) : options.isError ? (
          <p className="px-3 py-2 text-xs text-destructive">{errorMessage(options.error)}</p>
        ) : results.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">No customers found.</p>
        ) : (
          results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c)}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent/60"
            >
              <span className="font-medium text-foreground">{c.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{[c.mobile, c.pppoeId].filter(Boolean).join(' · ')}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/** "2026-10-11 09:30:00" → "2026-10-11 09:30"; empty → em dash. */
export function fmtDateTime(value: string | null | undefined): string {
  return value ? value.slice(0, 16) : '—';
}
