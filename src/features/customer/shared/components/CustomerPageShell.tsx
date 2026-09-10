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
    <div className="w-full flex flex-col gap-6 pb-16 md:pb-8">
      <PageHero className="border-border/40 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
              {breadcrumbs.map((bc, idx) => (
                <span key={`${bc.label}-${idx}`} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                  {bc.href ? (
                    <Link
                      href={bc.href}
                      className="hover:text-foreground font-medium transition-colors"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-foreground font-heading text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-2.5 pt-1 sm:pt-0">{actions}</div> : null}
      </PageHero>

      <PageContent>{children}</PageContent>
    </div>
  );
}
