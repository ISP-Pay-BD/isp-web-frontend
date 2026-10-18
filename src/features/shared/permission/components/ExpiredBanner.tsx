'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/i18n/locale-context';

export function ExpiredBanner() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);

  if (!user || user.status !== 'inactive') return null;

  const message =
    user.role === 'user'
      ? t(
          'shared.permission.expired.customer',
          'Your subscription has expired. Renew to restore full access to your dashboard and support.',
        )
      : t(
          'shared.permission.expired.admin',
          'Your admin subscription has expired. Recharge to restore operations access.',
        );

  return (
    <Alert variant="destructive" className="mb-4 border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t('shared.permission.expired.title', 'Subscription expired')}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
