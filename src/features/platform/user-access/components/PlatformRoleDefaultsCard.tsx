'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { PermissionMatrixEditor } from '@/features/admin/user-access/components/PermissionMatrix';
import {
  useAccessCatalog,
  useRolePermissions,
  useSaveRolePermissions,
} from '@/features/admin/user-access/hooks/use-user-access';
import { roleLabel } from '@/features/admin/user-access/labels';
import type { AccessRole } from '@/features/admin/user-access/types';

const ROLES: AccessRole[] = ['admin', 'resellerAdmin', 'employee', 'user'];

/**
 * Platform-wide default access per role (`/v1/reseller/role-permissions/{role}`, super admin writes). Since lane
 * W2-R13 a tenant's own default row (`/v1/access/defaults`) wins for its users; this row is the fallback for
 * tenants without one and the template new tenants start from.
 */
export function PlatformRoleDefaultsCard() {
  const t = useTranslations();
  const [role, setRole] = useState<AccessRole>('employee');
  const catalog = useAccessCatalog(role);
  const rolePerms = useRolePermissions(role);
  const save = useSaveRolePermissions(role);

  return (
    <Card className="border-border/60 bg-card shadow-xs">
      <CardHeader className="border-border/40 space-y-3 border-b pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="text-primary h-4 w-4" />
            {t('platform.userAccess.defaults.title', 'Platform default access')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t(
              'platform.userAccess.defaults.desc',
              'Used for every tenant that has not saved its own default access for the role.',
            )}
          </CardDescription>
        </div>
        <div
          role="group"
          aria-label={t('platform.userAccess.defaults.role', 'Role')}
          className="flex flex-wrap gap-2"
        >
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={cn(
                'min-h-9 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 ease-out',
                role === r
                  ? 'border-primary/40 bg-primary/5 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              )}
            >
              {roleLabel(t, r)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {catalog.isLoading || rolePerms.isLoading ? (
          <PageSkeleton variant="table" rows={4} />
        ) : catalog.isError || rolePerms.isError || !catalog.data || !rolePerms.data ? (
          <EmptyState
            variant="error"
            title={t(
              'platform.userAccess.defaults.loadFailed',
              'Could not load the default access',
            )}
            description={errorMessage(catalog.error ?? rolePerms.error)}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => {
              void catalog.refetch();
              void rolePerms.refetch();
            }}
          />
        ) : catalog.data.sections.length === 0 ? (
          <EmptyState
            title={t('platform.userAccess.defaults.empty', 'No permission sections yet')}
            description={t(
              'platform.userAccess.defaults.emptyHint',
              'The access catalogue is empty until a role default grants something.',
            )}
          />
        ) : (
          <PermissionMatrixEditor
            key={`${role}-${rolePerms.dataUpdatedAt}`}
            sections={catalog.data.sections}
            initialPermissions={rolePerms.data.permissions}
            readOnly={!rolePerms.data.editable}
            onSave={(next) => save.mutateAsync(next)}
          />
        )}
      </CardContent>
    </Card>
  );
}
