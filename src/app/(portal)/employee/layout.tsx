'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/features/shared/permission';

export default function EmployeePortalLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['employee']}>
      <AppShell portal="employee">{children}</AppShell>
    </AuthGuard>
  );
}
