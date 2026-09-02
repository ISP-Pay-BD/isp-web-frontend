import type { UserRole } from '@/types/auth';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  section?: string;
  roles?: UserRole[];
  permission?: { menu: string; action?: string };
  children?: NavItem[];
  badge?: number;
  /** Shown only for expired (inactive) sessions */
  expiredOnly?: boolean;
  /** Hidden when session is expired */
  hideWhenExpired?: boolean;
}
