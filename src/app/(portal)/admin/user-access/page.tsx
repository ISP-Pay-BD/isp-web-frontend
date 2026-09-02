'use client';

import { UserAccessPage } from '@/features/admin/user-access';
import { PermissionGuard } from '@/features/shared/permission';

export default function AdminUserAccessRoutePage() {
  return (
    <PermissionGuard menu="user_access" action="read">
      <UserAccessPage portal="admin" />
    </PermissionGuard>
  );
}
