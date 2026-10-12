'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { useCustomerLookup } from '../hooks/use-customer-payments';
import type { CustomerOption } from '../types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Async customer picker: debounced server-side search over the tenant's
 * customers (name, mobile, id, PPPoE id) instead of a pre-loaded first page.
 */
export function CustomerPicker({
  value,
  onChange,
  invalid,
}: {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
  invalid?: boolean;
}) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data = [], isFetching, isError } = useCustomerLookup(debounced);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm">
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{value.name || `#${value.id}`}</div>
          <div className="text-xs text-muted-foreground font-mono">
            ID {value.id}
            {value.mobile ? ` · ${value.mobile}` : ''}
            {value.packageName ? ` · ${value.packageName}` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Change customer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search by name, mobile, customer ID or PPPoE ID"
        className={cn('pl-9', invalid && 'border-destructive')}
        aria-invalid={invalid}
      />
      {isFetching ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" /> : null}
      {open ? (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-border/70 bg-popover shadow-md">
          {isError ? (
            <p className="px-3 py-3 text-xs text-destructive">Could not search customers. Try again.</p>
          ) : data.length === 0 && !isFetching ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">No customers match “{debounced}”.</p>
          ) : (
            data.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setTerm('');
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-foreground truncate">{c.name || `#${c.id}`}</span>
                  <span className="block text-xs text-muted-foreground font-mono">
                    ID {c.id}
                    {c.mobile ? ` · ${c.mobile}` : ''}
                    {c.packageName ? ` · ${c.packageName}` : ''}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
