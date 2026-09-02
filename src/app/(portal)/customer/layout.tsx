import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CustomerBottomNav } from '@/features/customer/shared';

export default function CustomerPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AppShell portal="customer">
        {children}
      </AppShell>
      <CustomerBottomNav />
    </div>
  );
}
