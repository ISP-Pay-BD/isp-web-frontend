'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PortalPageMotion } from '@/components/layout/PortalPageMotion';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell portal="platform">
      <PortalPageMotion>{children}</PortalPageMotion>
    </AppShell>
  );
}
