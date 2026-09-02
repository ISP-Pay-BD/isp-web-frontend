'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth-store';

export function ExpiredBanner() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.status !== 'inactive') return null;

  const message =
    user.role === 'user'
      ? 'Your subscription has expired. Renew to restore full access to your dashboard and support.'
      : 'Your admin subscription has expired. Recharge to restore operations access.';

  return (
    <Alert variant="destructive" className="mb-4 border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Subscription expired</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
