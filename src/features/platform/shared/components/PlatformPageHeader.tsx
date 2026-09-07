import type { ReactNode } from 'react';
import { PageHeader, type BreadcrumbItem } from '@/components/shared/PageHeader';

interface PlatformPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

/** Default Platform crumb; otherwise same as shared PageHeader. */
export function PlatformPageHeader({
  title,
  subtitle,
  breadcrumb = [{ label: 'Platform', href: '/platform/dashboard' }],
  actions,
}: PlatformPageHeaderProps) {
  return (
    <PageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} actions={actions} />
  );
}
