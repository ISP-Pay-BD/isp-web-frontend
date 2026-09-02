'use client';

import { useCallback, useEffect, useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockFetch } from '@/lib/mock-api/client';
import type { PermissionSectionDef, CustomUserAccessRecord } from '@/data/users';
import type { PermissionMap } from '@/types/auth';
import { PermissionMatrixEditor } from '../components/PermissionMatrix';
import { CustomAccessTable } from '../components/CustomAccessTable';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'resellerAdmin', label: 'Reseller / POP' },
  { value: 'employee', label: 'Employee' },
  { value: 'user', label: 'Customer' },
] as const;

interface UserAccessPageProps {
  portal?: 'admin' | 'platform';
}

export function UserAccessPage({ portal = 'admin' }: UserAccessPageProps) {
  const [sections, setSections] = useState<PermissionSectionDef[]>([]);
  const [role, setRole] = useState<string>('admin');
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [customAccess, setCustomAccess] = useState<CustomUserAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRolePermissions = useCallback(async (selectedRole: string) => {
    const data = await mockFetch('auth.rolePermissions.get', selectedRole);
    setPermissions(data.permissions);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [sectionData, accessList] = await Promise.all([
          mockFetch('auth.permissionSections'),
          mockFetch('auth.customAccess.list'),
        ]);
        if (!active) return;
        setSections(sectionData);
        setCustomAccess(accessList);
        await loadRolePermissions(role);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadRolePermissions, role]);

  const handleRoleChange = async (value: string | null) => {
    if (!value) return;
    setRole(value);
    await loadRolePermissions(value);
  };

  const handleSave = async (next: PermissionMap) => {
    await mockFetch('auth.rolePermissions.update', { role, permissions: next });
    setPermissions(next);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">User Access Management</h1>
        <p className="text-muted-foreground text-sm">
          Configure default permissions by role and review custom access overrides —{' '}
          {portal === 'platform' ? 'platform' : 'tenant'} scope.
        </p>
      </div>

      <Tabs defaultValue="default">
        <TabsList>
          <TabsTrigger value="default">
            <Shield className="mr-2 h-4 w-4" />
            Default access
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Users className="mr-2 h-4 w-4" />
            Custom access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Role permissions</CardTitle>
              <CardDescription>
                Mirrors default-access-fields.php — checkbox grid per menu and action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-xs space-y-2">
                <label className="text-sm font-medium">User type</label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <p className="text-muted-foreground text-sm">Loading permission matrix…</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Custom user access</CardTitle>
              <CardDescription>
                Users with individual permission overrides beyond their role defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading custom access…</p>
              ) : (
                <CustomAccessTable records={customAccess} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
