'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PortalPageMotion } from '@/components/layout/PortalPageMotion';
import { AuthGuard } from '@/features/shared/permission';

export default function EmployeePortalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell portal="employee">
      <AuthGuard allowedRoles={['employee']}>
        <PortalPageMotion>{children}</PortalPageMotion>
      </AuthGuard>
    </AppShell>
  );
}
