'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageContent, PageHero } from '@/components/motion/PageHero';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CustomerPageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function CustomerPageShell({
  title,
  subtitle,
  breadcrumbs = [{ label: 'Customer', href: '/customer/dashboard' }],
  actions,
  children,
}: CustomerPageShellProps) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 md:pb-8">
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div className="space-y-1.5">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {breadcrumbs.map((bc, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                  {bc.href ? (
                    <Link
                      href={bc.href}
                      className="hover:text-primary transition-colors font-medium hover:underline underline-offset-4"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground/90">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">{actions}</div>}
      </PageHero>

      <PageContent>{children}</PageContent>
    </div>
  );
}
