'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard, ExpiredBanner } from '@/features/shared/permission';

export default function CustomerPortalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell portal="customer">
      <AuthGuard allowedRoles={['user']}>
        <ExpiredBanner />
        {children}
      </AuthGuard>
    </AppShell>
  );
}
