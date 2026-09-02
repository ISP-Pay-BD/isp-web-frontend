import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return <AppShell portal="admin">{children}</AppShell>;
}
