'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState } from 'react';
import { Shield, Users, Lock, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { PermissionMatrixEditor } from '../components/PermissionMatrix';
import { CustomAccessTable } from '../components/CustomAccessTable';
import {
  fetchPlatformDefaults,
  useAccessCatalog,
  useRolePermissions,
  useSaveRolePermissions,
} from '../hooks/use-user-access';
import { roleLabel } from '../labels';
import type { AccessRole } from '../types';

const ROLE_OPTIONS = [
  { value: 'admin', icon: Shield },
  { value: 'resellerAdmin', icon: Users },
  { value: 'employee', icon: Key },
  { value: 'user', icon: Lock },
] as const satisfies readonly { value: AccessRole; icon: typeof Shield }[];

interface UserAccessPageProps {
  portal?: 'admin' | 'platform';
}

export function UserAccessPage({ portal = 'admin' }: UserAccessPageProps) {
  const t = useTranslations();
  const [role, setRole] = useState<AccessRole>('employee');
  const catalog = useAccessCatalog(role);
  const rolePerms = useRolePermissions(role);
  const save = useSaveRolePermissions(role);

  if (catalog.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (catalog.isError || !catalog.data) {
    return (
      <div className="p-6">
        <EmptyState variant="error"
          title={t('platform.userAccess.page.loadFailed', 'Failed to load user access')}
          description={errorMessage(catalog.error)}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => catalog.refetch()}
        />
      </div>
    );
  }

  const sections = catalog.data.sections;
  const counts = Object.fromEntries(catalog.data.roles.map((r) => [r.role, r]));
  const enabledCount = Object.entries(rolePerms.data?.permissions ?? {}).reduce(
    (sum, [key, acts]) => sum + (sections.some((s) => s.key === key) ? acts.length : 0),
    0,
  );
  const totalActions = counts[role]?.totalActions ?? 0;

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHero>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('nav.user-access', 'User Access Management')}</h1>
              <p className="text-muted-foreground text-sm">
                {portal === 'platform'
                  ? t('admin.userAccess.page.subtitlePlatform', 'Default permissions by role and per-user overrides — platform.')
                  : t('admin.userAccess.page.subtitleOrg', 'Default permissions by role and per-user overrides — your organisation.')}
              </p>
            </div>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">
        <div className="flex flex-wrap gap-2 border-y border-border/60 py-3">
          {ROLE_OPTIONS.map((opt) => {
            const isActive = role === opt.value;
            const RoleIcon = opt.icon;
            const userCount = counts[opt.value]?.users ?? 0;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                title={t('admin.userAccess.page.roleAccounts', '{n} account(s) with this role', { n: formatCount(userCount) })}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <RoleIcon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{roleLabel(t, opt.value)}</span>
                <span className="font-mono tabular-nums text-xs text-muted-foreground">{formatCount(userCount)}</span>
              </button>
            );
          })}
        </div>

        <Tabs defaultValue="default">
          <TabsList className="bg-muted/40 p-1 rounded-xl">
            <TabsTrigger value="default" className="gap-1.5 rounded-lg px-4 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Shield className="h-3.5 w-3.5" />
              {t('admin.userAccess.page.tabDefault', 'Default access')}
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5 rounded-lg px-4 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" />
              {t('admin.userAccess.page.tabCustom', 'Custom access')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="default" className="mt-4">
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <span className="p-1.5 rounded-lg border border-border/60 bg-muted/40">
                        <Lock className="h-4 w-4 text-primary" />
                      </span>
                      {t('admin.userAccess.page.rolePermsTitle', 'Role permissions — {role}', { role: roleLabel(t, role) })}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {rolePerms.data?.source === 'platform'
                        ? t('admin.userAccess.page.descPlatform', 'Platform defaults for this role.')
                        : rolePerms.data && !rolePerms.data.exists
                          ? t('admin.userAccess.page.descNone', 'No defaults saved for this role yet — accounts with it only get what custom access grants.')
                          : t('admin.userAccess.page.descTenant', 'What every account with this role can do unless it has a custom override.')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {t('admin.userAccess.page.actionsCount', '{enabled} / {total} actions', {
                      enabled: formatCount(enabledCount),
                      total: formatCount(totalActions),
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rolePerms.isLoading ? (
                  <PageSkeleton variant="table" rows={4} />
                ) : rolePerms.isError || !rolePerms.data ? (
                  <EmptyState
                    variant="error"
                    title={t('admin.userAccess.page.roleLoadFailed', 'Could not load role permissions')}
                    description={errorMessage(rolePerms.error)}
                    actionLabel={t('common.retry', 'Retry')}
                    onAction={() => rolePerms.refetch()}
                  />
                ) : (
                  <PermissionMatrixEditor
                    key={`${role}-${rolePerms.dataUpdatedAt}`}
                    sections={sections}
                    initialPermissions={rolePerms.data.permissions}
                    readOnly={!rolePerms.data.editable}
                    onSave={(next) => save.mutateAsync(next)}
                    onLoadDefaults={rolePerms.data.source === 'tenant' ? () => fetchPlatformDefaults(role) : undefined}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Users className="h-4 w-4" />
                  </span>
                  {t('admin.userAccess.page.customTitle', 'Custom user access')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('admin.userAccess.page.customDesc', 'Staff and POP accounts with individual permission overrides.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomAccessTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </div>
  );
}
