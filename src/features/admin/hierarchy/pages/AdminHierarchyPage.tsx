'use client';

import { HierarchyExplorer } from '@/features/shared/hierarchy';
import { useAuthStore } from '@/stores/auth-store';

export function AdminHierarchyPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isReseller = role === 'resellerAdmin';

  return (
    <HierarchyExplorer
      scope={isReseller ? 'reseller' : 'admin'}
      resellerId={isReseller ? 'pop_uttara' : undefined}
      breadcrumb={[
        { label: 'Admin', url: '/admin/dashboard' },
        { label: 'Hierarchy' },
      ]}
    />
  );
}
