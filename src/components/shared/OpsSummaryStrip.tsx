import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type OpsSummaryItem = {
  value: ReactNode;
  label: string;
};

/**
 * Dense ops summary — Linear/Stripe list pattern.
 * Prefer this over 4 equal KPI StatCards on portal list hubs.
 */
export function OpsSummaryStrip({
  items,
  className,
}: {
  items: OpsSummaryItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-muted/25 px-4 py-2.5 text-xs text-muted-foreground shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      {items.map((item, idx) => (
        <Fragment key={`${item.label}-${idx}`}>
          {idx > 0 ? (
            <span className="text-border" aria-hidden>
              ·
            </span>
          ) : null}
          <span>
            <span className="font-medium tabular-nums text-foreground">{item.value}</span>{' '}
            {item.label}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
