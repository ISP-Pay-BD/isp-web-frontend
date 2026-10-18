'use client';

import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageContent } from '@/components/motion/PageHero';
import { useTranslations } from '@/i18n/locale-context';

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

export function EmployeePageShell({ title, subtitle, breadcrumbs, actions, children }: EmployeePageShellProps) {
  const t = useTranslations();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs ?? [{ label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/salaries' }]}
        actions={actions}
      />
      <PageContent>{children}</PageContent>
    </div>
  );
}
