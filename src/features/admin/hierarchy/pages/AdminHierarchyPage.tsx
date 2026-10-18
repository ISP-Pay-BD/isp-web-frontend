'use client';

import { HierarchyExplorer } from '@/features/shared/hierarchy';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/i18n/locale-context';

export function AdminHierarchyPage() {
  const t = useTranslations();
  const role = useAuthStore((s) => s.user?.role);
  const isReseller = role === 'resellerAdmin';

  return (
    <HierarchyExplorer
      scope={isReseller ? 'reseller' : 'admin'}
      resellerId={isReseller ? 'pop_uttara' : undefined}
      breadcrumb={[
        { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
        { label: t('nav.hierarchy', 'Hierarchy') },
      ]}
    />
  );
}
