'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  useBillingCustomerOptions,
  useDebouncedValue,
  type BillingCustomerOption,
} from '../hooks/use-billing-config';

/** Server-searched customer picker (tenant scope comes from the JWT). */
export function BillingCustomerPicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id?: string;
  value: BillingCustomerOption | null;
  onChange: (c: BillingCustomerOption | null) => void;
  invalid?: boolean;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const options = useBillingCustomerOptions(debounced, value === null);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
        <div className="min-w-0 truncate text-xs">
          <span className="font-semibold text-foreground">{value.name}</span>
          <span className="text-muted-foreground">
            {[value.mobile, value.pppoeId].filter(Boolean).map((v) => ` · ${v}`).join('')}
          </span>
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
          aria-invalid={invalid || undefined}
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
