import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({ filters, actions, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'bg-card flex flex-col gap-3 rounded-xl border border-border/70 px-4 py-3 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{filters}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
