import type { useTranslations } from '@/i18n/locale-context';
import type { HierarchyRole } from '../types';

type Translate = ReturnType<typeof useTranslations>;

export function hierarchyRoleLabel(t: Translate, role: HierarchyRole): string {
  switch (role) {
    case 'super_admin':
      return t('shared.hierarchy.role.superAdmin', 'Super Admin');
    case 'admin':
      return t('shared.hierarchy.role.admin', 'Admin');
    case 'reseller':
      return t('shared.hierarchy.role.reseller', 'Reseller');
    case 'customer':
      return t('shared.hierarchy.role.customer', 'Customer');
  }
}

/** Status words come from the API; known ones reuse the shared `status.*` messages, unknown ones stay as sent. */
export function hierarchyStatusLabel(t: Translate, status: string): string {
  return t(`status.${status.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, status);
}
