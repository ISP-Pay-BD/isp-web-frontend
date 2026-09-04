'use client';

import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageContent } from '@/components/motion/PageHero';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EmployeePageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function EmployeePageShell({
  title,
  subtitle,
  breadcrumbs = [{ label: 'Employee', href: '/employee/salaries' }],
  actions,
  children,
}: EmployeePageShellProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} actions={actions} />
      <PageContent>{children}</PageContent>
    </div>
  );
}
