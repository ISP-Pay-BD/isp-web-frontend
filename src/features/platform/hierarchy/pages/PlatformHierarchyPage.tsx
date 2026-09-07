'use client';

import { HierarchyExplorer } from '@/features/shared/hierarchy';

export function PlatformHierarchyPage() {
  return (
    <HierarchyExplorer
      scope="platform"
      breadcrumb={[
        { label: 'Platform', url: '/platform/dashboard' },
        { label: 'Hierarchy' },
      ]}
    />
  );
}
