import type { UserRole } from '@/types/auth';
import type { NavItem } from './types';
import { adminNavigation } from './admin';
import { customerNavigation } from './customer';
import { platformNavigation } from './platform';

export type { NavItem } from './types';
export { adminNavigation, customerNavigation, platformNavigation };

export function getNavigationForRole(role: UserRole, isExpired: boolean): NavItem[] {
  switch (role) {
    case 'super_admin':
      return platformNavigation;
    case 'user':
      return filterExpiredNav(customerNavigation, isExpired);
    case 'admin':
    case 'resellerAdmin':
      return filterExpiredNav(adminNavigation, isExpired);
    case 'employee':
      return employeeNavigation;
    default:
      return [];
  }
}

export const employeeNavigation: NavItem[] = [
  { id: 'emp-salaries', label: 'Salaries', href: '/employee/salaries', icon: 'Banknote', roles: ['employee'] },
  { id: 'emp-advance', label: 'Advance Salary', href: '/employee/advance-salary', icon: 'Wallet', roles: ['employee'] },
  { id: 'emp-attendance', label: 'Attendance', href: '/employee/attendance', icon: 'MapPinned', roles: ['employee'] },
  { id: 'emp-jobs', label: 'Work Orders', href: '/employee/jobs', icon: 'ClipboardList', roles: ['employee'] },
  { id: 'emp-installs', label: 'Installations', href: '/employee/installations', icon: 'HardHat', roles: ['employee'] },
  { id: 'emp-profile', label: 'Profile', href: '/employee/profile', icon: 'User', roles: ['employee'] },
];

export const marketingNavLinks = [
  { label: 'Product', href: '/#auto-reconcile' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
] as const;

function filterExpiredNav(items: NavItem[], isExpired: boolean): NavItem[] {
  return items
    .filter((item) => {
      if (isExpired) return item.expiredOnly || !item.hideWhenExpired;
      return !item.expiredOnly;
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterExpiredNav(item.children, isExpired) : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}

/** @deprecated Use getNavigationForRole — kept for gradual migration */
export const portalNavigation = [...adminNavigation, ...customerNavigation, ...platformNavigation];
