'use client';

import type { ReactNode } from 'react';
import { LocaleToggle } from '@/components/shared/LocaleToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="font-portal relative min-h-screen">
      <LocaleToggle variant="portal" className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6" />
      {children}
    </div>
  );
}
