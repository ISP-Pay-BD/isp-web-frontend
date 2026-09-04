'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';

interface AppShellProps {
  children: ReactNode;
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

/**
 * Persistent chrome: sidebar + header never remount on route change.
 * Page content fades via portal `template.tsx` only.
 */
export function AppShell({ children, portal }: AppShellProps) {
  return (
    <SidebarProvider>
      <PortalSidebar portal={portal} />
      <SidebarInset>
        <PortalHeader portal={portal} />
        <div className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { SidebarTrigger };
