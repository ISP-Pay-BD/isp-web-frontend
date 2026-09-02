'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard, ExpiredBanner } from '@/features/shared/permission';

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin', 'resellerAdmin']}>
      <AppShell portal="admin">
        <ExpiredBanner />
        {children}
      </AppShell>
    </AuthGuard>
  );
}
