import type { UserRole } from '@/types/auth';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  roles?: UserRole[];
  permission?: { menu: string; action?: string };
  children?: NavItem[];
  badge?: number;
}

/** Portal navigation — filtered at runtime by role + permissions */
export const portalNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'resellerAdmin'],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer', action: 'read' },
    children: [
      { id: 'customers-all', label: 'All Customers', href: '/admin/customers' },
      { id: 'customers-expired', label: 'Expired Customers', href: '/admin/customers/expired' },
      {
        id: 'customers-payments',
        label: 'Customers Payment',
        href: '/admin/customer-payments',
        permission: { menu: 'customer_payment', action: 'read' },
      },
    ],
  },
  {
    id: 'customer-dashboard',
    label: 'Dashboard',
    href: '/customer/dashboard',
    icon: 'LayoutDashboard',
    roles: ['user'],
  },
  {
    id: 'customer-subscription',
    label: 'My Subscription',
    href: '/customer/subscription',
    icon: 'CalendarCheck',
    roles: ['user'],
    permission: { menu: 'subscription', action: 'read' },
  },
  {
    id: 'platform-dashboard',
    label: 'Dashboard',
    href: '/platform/dashboard',
    icon: 'LayoutDashboard',
    roles: ['super_admin'],
  },
  {
    id: 'platform-tenants',
    label: 'Tenants',
    href: '/platform/tenants',
    icon: 'Globe',
    roles: ['super_admin'],
  },
];
