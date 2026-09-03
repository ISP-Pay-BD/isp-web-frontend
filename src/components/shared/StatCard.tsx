import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden border-border/70 bg-card/90 shadow-2xs transition-all duration-200 group h-full flex flex-col justify-between',
        (href || onClick) && 'cursor-pointer hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2.5">
          <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {title}
          </CardTitle>
          {Icon ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-2xs">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
          {description ? <p className="text-muted-foreground mt-1 text-xs">{description}</p> : null}
          {trend ? (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border',
                  trend.positive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', trend.positive ? 'bg-emerald-500' : 'bg-amber-500')} />
                {trend.value}
              </span>
            </div>
          ) : null}
        </CardContent>
      </div>

      {(href || ctaText) && (
        <div className="px-6 pb-4 pt-1">
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>{ctaText || 'View details'}</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      )}
    </Card>
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
