import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 bg-muted/25 px-8 py-14 text-center shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      {icon ? (
        <div className="border-border/60 bg-card text-muted-foreground flex h-12 w-12 items-center justify-center rounded-lg border shadow-[var(--shadow-xs)]">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-foreground text-base font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} size="sm" className="mt-1">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
