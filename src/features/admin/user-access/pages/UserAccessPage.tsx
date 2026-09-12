'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useCallback, useEffect, useState } from 'react';
import { Shield, Users, Lock, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockFetch } from '@/lib/mock-api/client';
import type { PermissionSectionDef, CustomUserAccessRecord } from '@/data/users';
import type { PermissionMap } from '@/types/auth';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PermissionMatrixEditor } from '../components/PermissionMatrix';
import { CustomAccessTable } from '../components/CustomAccessTable';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'resellerAdmin', label: 'Reseller / POP', icon: Users },
  { value: 'employee', label: 'Employee', icon: Key },
  { value: 'user', label: 'Customer', icon: Lock },
] as const;

const ROLE_STATS: Record<string, { total: number; sections: string; level: string }> = {
  admin: { total: 120, sections: '27', level: 'Full Access' },
  resellerAdmin: { total: 32, sections: '11', level: 'Limited' },
  employee: { total: 4, sections: '2', level: 'Restricted' },
  user: { total: 12, sections: '8', level: 'Self Only' },
};

interface UserAccessPageProps {
  portal?: 'admin' | 'platform';
}

export function UserAccessPage({ portal = 'admin' }: UserAccessPageProps) {
  const [sections, setSections] = useState<PermissionSectionDef[]>([]);
  const [role, setRole] = useState<string>('admin');
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [customAccess, setCustomAccess] = useState<CustomUserAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const loadRolePermissions = useCallback(async (selectedRole: string) => {
    const data = await mockFetch('auth.rolePermissions.get', selectedRole);
    setPermissions(data.permissions);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setIsError(false);
      try {
        const [sectionData, accessList] = await Promise.all([
          mockFetch('auth.permissionSections'),
          mockFetch('auth.customAccess.list'),
        ]);
        if (!active) return;
        setSections(sectionData);
        setCustomAccess(accessList);
        await loadRolePermissions(role);
      } catch {
        if (active) setIsError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadRolePermissions, role, retryKey]);

  const handleRoleChange = async (value: string | null) => {
    if (!value) return;
    setRole(value);
    await loadRolePermissions(value);
  };

  const handleSave = async (next: PermissionMap) => {
    await mockFetch('auth.rolePermissions.update', { role, permissions: next });
    setPermissions(next);
  };

  const stats = ROLE_STATS[role] ?? ROLE_STATS.admin;
  const enabledCount = Object.values(permissions).reduce((sum, acts) => sum + acts.length, 0);

  if (loading && sections.length === 0) {
    return <PageSkeleton variant="table" rows={6} />;
  }
  if (isError && sections.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load user access"
          description="Could not fetch permission sections and custom access."
          actionLabel="Retry"
          onAction={() => setRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  return (
    <div
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
      <PageHero>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Access Management</h1>
              <p className="text-muted-foreground text-sm">
                Configure default permissions by role and review custom access overrides —{' '}
                {portal === 'platform' ? 'platform' : 'tenant'} scope.
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
          const stats = ROLE_STATS[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRoleChange(opt.value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'border-primary/40 bg-primary/5 text-foreground'
                  : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <RoleIcon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : ''}`} />
              <span className="font-medium">{opt.label}</span>
              <span className="font-mono tabular-nums text-xs text-muted-foreground">
                {stats?.total ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div >
        <Tabs defaultValue="default">
          <TabsList className="bg-muted/40 p-1 rounded-xl">
            <TabsTrigger value="default" className="gap-1.5 rounded-lg px-4 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Shield className="h-3.5 w-3.5" />
              Default access
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5 rounded-lg px-4 font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" />
              Custom access
              {customAccess.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px] font-mono rounded-full">
                  {customAccess.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="default" className="mt-4">
            <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <span className="p-1.5 rounded-lg border border-border/60 bg-muted/40">
                        <Lock className="h-4 w-4 text-primary" />
                      </span>
                      Role permissions
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Mirrors default-access-fields.php — checkbox grid per menu and action.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {enabledCount} / {stats.total} active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2 animate-pulse">
                        <div className="h-4 w-32 bg-muted/60 rounded" />
                        <div className="flex gap-2">
                          <div className="h-8 w-20 bg-muted/40 rounded-lg" />
                          <div className="h-8 w-24 bg-muted/40 rounded-lg" />
                          <div className="h-8 w-20 bg-muted/40 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <PermissionMatrixEditor
                    key={role}
                    sections={sections}
                    initialPermissions={permissions}
                    onSave={handleSave}
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
                  Custom user access
                </CardTitle>
                <CardDescription className="text-xs">
                  Users with individual permission overrides beyond their role defaults.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <CustomAccessTable 
                    records={customAccess} 
                    sections={sections}
                    onUpdateRecord={(updated) => {
                      setCustomAccess((prev) =>
                        prev.map((r) => (r.id === updated.id ? updated : r))
                      );
                    }}
                    onDeleteRecord={(deletedId) => {
                      setCustomAccess((prev) => prev.filter((r) => r.id !== deletedId));
                    }}
                    onAddRecord={(newRecord) => {
                      setCustomAccess((prev) => [newRecord, ...prev]);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
      </PageContent>
    </div>
  );
}
