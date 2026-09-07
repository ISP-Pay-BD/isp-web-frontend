import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/** Static card surface — name kept for call sites; no mouse spotlight. */
export function SpotlightCard({ children, className, ...props }: SpotlightCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card transition-colors hover:border-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
