'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/features/shared/permission';

export default function PlatformPortalLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['super_admin']}>
      <AppShell portal="platform">{children}</AppShell>
    </AuthGuard>
  );
}
