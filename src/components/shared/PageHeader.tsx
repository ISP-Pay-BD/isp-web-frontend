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
    <div className={cn('mb-7 space-y-2.5', className)}>
      {crumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {crumbs.map((item, idx) => {
            const href = crumbHref(item);
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 ? <ChevronRight className="h-3 w-3 opacity-60" /> : null}
                {href && !isLast ? (
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors duration-200 ease-out"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-foreground font-heading text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
