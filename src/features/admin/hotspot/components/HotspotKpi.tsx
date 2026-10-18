import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One tile of the hotspot KPI ribbon (same shell on every hotspot screen). */
export function HotspotKpi({
  label,
  value,
  hint,
  icon,
  positive,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  /** Emerald value/hint — live/healthy counters only. */
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div
        className={cn(
          'mt-2 text-2xl font-bold tracking-tight tabular-nums',
          positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
        )}
      >
        {value}
      </div>
      {hint ? (
        <p className={cn('mt-1 text-xs', positive ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground')}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function HotspotKpiRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{children}</div>;
}

export function HotspotKpiSkeleton() {
  return (
    <HotspotKpiRow>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[104px] animate-pulse rounded-xl border border-border/60 bg-muted/40" />
      ))}
    </HotspotKpiRow>
  );
}
