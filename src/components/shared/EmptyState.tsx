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
  /** If true, stretches the empty/error state to take full available container height. Defaults to true for errors. */
  fullHeight?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
  className,
  fullHeight,
}: EmptyStateProps) {
  const isError = variant === 'error';
  const shouldFullHeight = fullHeight ?? (isError && !className?.includes('min-h-'));
  const shownIcon = icon ?? (isError ? <AlertTriangle className="h-6 w-6" /> : null);
  return (
    <div
      role={isError ? 'alert' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-8 py-14 text-center shadow-[var(--shadow-xs)]',
        isError ? 'border-destructive/40 bg-destructive/5' : 'border-border/70 bg-muted/25',
        shouldFullHeight && 'min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-10rem)] flex-1 w-full my-auto',
        className,
      )}
    >
      {shownIcon ? (
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-xl border shadow-[var(--shadow-xs)]',
            isError ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border/60 bg-card text-muted-foreground',
          )}
        >
          {shownIcon}
        </div>
      ) : null}
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant={isError ? 'outline' : 'default'} className="mt-2 min-h-11 px-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
