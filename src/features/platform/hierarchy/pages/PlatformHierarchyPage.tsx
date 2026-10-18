'use client';

import { HierarchyExplorer } from '@/features/shared/hierarchy';
import { useTranslations } from '@/i18n/locale-context';

export function PlatformHierarchyPage() {
  const t = useTranslations();
  return (
    <HierarchyExplorer
      scope="platform"
      breadcrumb={[
        { label: t('common.crumb.platform', 'Platform'), url: '/platform/dashboard' },
        { label: t('platform.hierarchy.crumb', 'Hierarchy') },
      ]}
    />
  );
}
