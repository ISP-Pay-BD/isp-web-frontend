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
        'flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      {items.map((item, idx) => (
        <Fragment key={`${item.label}-${idx}`}>
          {idx > 0 ? (
            <span className="text-border/60" aria-hidden>
              ·
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <span className="text-foreground font-semibold tabular-nums">{item.value}</span>
            <span className="text-muted-foreground/80">{item.label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
