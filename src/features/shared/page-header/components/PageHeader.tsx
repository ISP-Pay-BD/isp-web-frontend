'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHero } from '@/components/motion/PageHero';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <PageHero className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <span key={item.label} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
                  {item.url && !isLast ? (
                    <Link href={item.url} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-foreground font-medium' : ''}>{item.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-portal">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </PageHero>
  );
}
