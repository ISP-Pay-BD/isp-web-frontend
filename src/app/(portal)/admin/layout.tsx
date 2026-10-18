'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PortalPageMotion } from '@/components/layout/PortalPageMotion';
import { AuthGuard, ExpiredBanner, ImpersonationBanner } from '@/features/shared/permission';

/**
 * Shell mounts once; AuthGuard only gates the main content so the sidebar
 * stays visible during auth checks and route changes.
 */
export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell portal="admin">
      <AuthGuard allowedRoles={['admin', 'resellerAdmin']}>
        <ImpersonationBanner />
        <ExpiredBanner />
        <PortalPageMotion>{children}</PortalPageMotion>
      </AuthGuard>
    </AppShell>
  );
}
