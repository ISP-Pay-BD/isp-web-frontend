'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthCookieSync } from '@/components/providers/auth-cookie-sync';
import { LocaleProvider } from '@/i18n/locale-context';
import { queryClient } from '@/lib/query-client';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <LocaleProvider>
            <AuthCookieSync />
            {children}
            <Toaster richColors closeButton position="top-right" />
          </LocaleProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
