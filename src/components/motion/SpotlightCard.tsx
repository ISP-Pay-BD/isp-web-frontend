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
        'rounded-xl border border-border/60 bg-card shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-border hover:shadow-[var(--shadow-sm)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
