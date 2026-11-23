'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { useTranslations } from '@/i18n/locale-context';
import {
  EmployeePageShell,
  EmployeeEmptyState,
  EmployeeErrorState,
  EmployeeLoadingSkeleton,
} from '@/features/employee/shared';
import { useEmployeeOperations } from '../hooks/use-employee-operations';
import type { EmployeeOperations } from '../lib/map-operations';

interface Props {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  /** Which `can_*` flag of `GET /v1/employee-portal/operations` opens this screen. */
  allowed: (perms: EmployeeOperations['perms']) => boolean;
  children: ReactNode;
}

/**
 * Employee quick-action screens (collect payment, add customer, tickets) call the admin endpoints, which the API
 * opens to an employee only with the matching permission (lane W2-R13). The operations endpoint reports those
 * permissions as `can_*` flags; this gate shows loading / error / permission-denied before the screen renders.
 */
export function EmployeeAccessGate({ title, breadcrumbs, allowed, children }: Props) {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useEmployeeOperations();

  if (isLoading) {
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }
  const forbidden = error instanceof ApiError && error.status === 403;
  if ((isError && !forbidden) || (!data && !forbidden)) {
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }
  if (forbidden || !data || !allowed(data.perms)) {
    return (
      <EmployeePageShell title={title} breadcrumbs={breadcrumbs}>
        <EmployeeEmptyState
          icon={<ShieldOff className="text-muted-foreground h-5 w-5" />}
          title={t('employee.quick.deniedTitle', 'You do not have access to this')}
          description={t(
            'employee.quick.deniedHint',
            'Your account does not have this permission. Ask your manager to grant it.',
          )}
          action={
            <Button variant="outline" size="sm" render={<Link href="/employee/dashboard" />}>
              {t('employee.quick.backToDashboard', 'Back to dashboard')}
            </Button>
          }
        />
      </EmployeePageShell>
    );
  }
  return <>{children}</>;
}
