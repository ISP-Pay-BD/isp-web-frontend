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
        'group bg-card h-full rounded-xl border border-border/60 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-border hover:shadow-[var(--shadow-sm)]',
        (href || onClick) && 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide">
              {title}
            </p>
            {Icon ? (
              <Icon className="text-muted-foreground/70 h-4 w-4 shrink-0" aria-hidden />
            ) : null}
          </div>
          <div
            data-slot="stat-value"
            className="text-foreground mt-3 text-2xl font-semibold tracking-tight tabular-nums"
          >
            {value}
          </div>
          {description ? <p className="text-muted-foreground mt-1 text-xs">{description}</p> : null}
          {trend ? (
            <p
              className={cn(
                'mt-2 text-xs font-medium tabular-nums',
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
          <div className="text-primary mt-4 flex items-center gap-1 text-[11px] font-medium opacity-80 transition-opacity group-hover:opacity-100">
            <span>{ctaText || 'View details'}</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
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
