'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PortalPageMotion } from '@/components/layout/PortalPageMotion';
import { AuthGuard } from '@/features/shared/permission';
import { useSyncEmployeePermissions } from '@/features/employee/shared/hooks/use-sync-employee-permissions';

export default function EmployeePortalLayout({ children }: { children: ReactNode }) {
  useSyncEmployeePermissions();
  return (
    <AppShell portal="employee">
      <AuthGuard allowedRoles={['employee']}>
        <PortalPageMotion>{children}</PortalPageMotion>
      </AuthGuard>
    </AppShell>
  );
}
