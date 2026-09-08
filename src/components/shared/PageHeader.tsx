import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** @deprecated use href */
  url?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  /** Alias for breadcrumb */
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function crumbHref(item: BreadcrumbItem): string | undefined {
  return item.href ?? item.url;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  breadcrumbs,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const crumbs = breadcrumb ?? breadcrumbs ?? [];

  return (
    <div className={cn('mb-6 space-y-2', className)}>
      {crumbs.length > 0 ? (
        <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {crumbs.map((item, idx) => {
            const href = crumbHref(item);
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 ? <ChevronRight className="h-3 w-3 opacity-60" /> : null}
                {href && !isLast ? (
                  <Link
                    href={href}
                    className="transition-colors duration-200 ease-out hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-foreground font-medium' : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
