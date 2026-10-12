'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gatewayLabel } from '../hooks/use-platform-checkout';

const BRAND: Record<string, string> = {
  bkash: '#e2136e',
  nagad: '#f7941d',
  sslcommerz: '#2563eb',
};

/** Gateway selector over the provider slugs returned by the backend. */
export function GatewayPicker({
  providers,
  value,
  onChange,
  className,
}: {
  providers: string[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
}) {
  if (!providers.length) {
    return <p className="text-xs text-muted-foreground">No online payment gateway is available right now.</p>;
  }
  return (
    <div className={cn('grid gap-2 grid-cols-2 sm:grid-cols-3', className)}>
      {providers.map((slug) => {
        const selected = value === slug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onChange(slug)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-lg border p-2.5 text-left text-xs font-semibold transition',
              selected
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                : 'border-border/70 bg-card/40 text-muted-foreground hover:border-border',
            )}
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" style={BRAND[slug] ? { backgroundColor: BRAND[slug] } : undefined} />
              {gatewayLabel(slug)}
            </span>
            {selected ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        );
      })}
    </div>
  );
}
