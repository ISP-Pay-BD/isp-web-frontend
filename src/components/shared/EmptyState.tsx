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
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center backdrop-blur-xs',
        className,
      )}
    >
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
        {description ? <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold mt-1">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
