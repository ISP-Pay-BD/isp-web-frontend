import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  children: ReactNode;
  className?: string;
}

/** Portal page chrome — static. Marketing keeps Framer in Reveal/Hero. */
export function PageHero({ children, className }: PageHeroProps) {
  return <div className={cn(className)}>{children}</div>;
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn(className)}>{children}</div>;
}
