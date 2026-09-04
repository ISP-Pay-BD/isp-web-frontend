import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  trend?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
  href?: string;
  onClick?: () => void;
  ctaText?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
  href,
  onClick,
  ctaText,
}: StatCardProps) {
  const cardContent = (
    <div
      onClick={onClick}
      className={cn(
        'group flex h-full flex-col justify-between rounded-xl bg-card p-5 transition-colors duration-200',
        (href || onClick) && 'cursor-pointer hover:bg-muted/40',
        className,
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          {Icon ? (
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
          ) : null}
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              trend.positive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400',
            )}
          >
            {trend.value}
          </p>
        ) : null}
      </div>

      {(href || ctaText) && (
        <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
          <span>{ctaText || 'View details'}</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
