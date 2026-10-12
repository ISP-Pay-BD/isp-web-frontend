import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiTileProps {
  label: string;
  icon: ReactNode;
  /** Rendered as-is; pass '—' while the summary is loading. */
  value: ReactNode;
  hint?: ReactNode;
  valueClassName?: string;
  hintClassName?: string;
}

/** One tile of the KPI ribbon used across the inventory / purchase screens. */
export function KpiTile({ label, icon, value, hint, valueClassName, hintClassName }: KpiTileProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className={cn('mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums', valueClassName)}>
        {value}
      </div>
      {hint ? <p className={cn('mt-1 text-xs text-muted-foreground', hintClassName)}>{hint}</p> : null}
    </div>
  );
}
