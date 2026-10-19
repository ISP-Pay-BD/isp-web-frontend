import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `error` is for a failed load: announced to screen readers, with a warning icon unless `icon` is given. */
  variant?: 'empty' | 'error';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
  className,
}: EmptyStateProps) {
  const isError = variant === 'error';
  const shownIcon = icon ?? (isError ? <AlertTriangle className="h-5 w-5" /> : null);
  return (
    <div
      role={isError ? 'alert' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-8 py-14 text-center shadow-[var(--shadow-xs)]',
        isError ? 'border-destructive/40 bg-destructive/5' : 'border-border/70 bg-muted/25',
        className,
      )}
    >
      {shownIcon ? (
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg border shadow-[var(--shadow-xs)]',
            isError ? 'border-destructive/30 bg-card text-destructive' : 'border-border/60 bg-card text-muted-foreground',
          )}
        >
          {shownIcon}
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
        <Button onClick={onAction} variant={isError ? 'outline' : 'default'} className="mt-1 min-h-11 px-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
