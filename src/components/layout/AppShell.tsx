'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import { useTranslations } from '@/i18n/locale-context';

interface AppShellProps {
  children: ReactNode;
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

/**
 * Persistent chrome: sidebar + header never remount on route change.
 * Page content fades via portal `template.tsx` only.
 */
export function AppShell({ children, portal }: AppShellProps) {
  const t = useTranslations();
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="bg-background text-foreground sr-only z-[100] rounded-md px-3 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('common.skipToContent', 'Skip to content')}
      </a>
      <PortalSidebar portal={portal} />
      <SidebarInset>
        <PortalHeader portal={portal} />
        <div id="main-content" tabIndex={-1} className="flex-1 min-w-0 overflow-x-clip px-4 pt-4 pb-6 outline-none md:px-6 md:pt-5 md:pb-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { SidebarTrigger };
