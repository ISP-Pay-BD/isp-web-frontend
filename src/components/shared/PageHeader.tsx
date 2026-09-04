'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHero } from '@/components/motion/PageHero';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <PageHero
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((bc, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 ? <ChevronRight className="h-3 w-3 opacity-60" /> : null}
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-foreground transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </PageHero>
  );
}
