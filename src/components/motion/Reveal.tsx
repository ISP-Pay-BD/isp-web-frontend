import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Kept for API compatibility: each `RevealItem` already reveals on its own scroll position. */
  stagger?: boolean;
  delay?: number;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'li';
  id?: string;
}

/**
 * Fades and lifts its children in as they scroll into view. Pure CSS (`.lp-reveal`, a scroll-driven
 * animation), so content is in the server HTML and never waits on hydration; where the browser lacks
 * scroll timelines, or motion is reduced, it is simply shown. `delay` (seconds) staggers siblings by
 * shifting their scroll range.
 */
export function Reveal({ children, className, delay = 0, as: Comp = 'div', id }: RevealProps) {
  return (
    <Comp
      id={id}
      className={cn('lp-reveal', className)}
      style={delay ? { ['--reveal-shift' as string]: `${Math.round(delay * 60)}%` } : undefined}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as: Comp = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'span';
}) {
  return <Comp className={cn('lp-reveal', className)}>{children}</Comp>;
}
