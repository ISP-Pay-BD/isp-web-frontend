import type { NavItem } from './types';

export const customerNavigation: NavItem[] = [
  {
    id: 'customer-dashboard',
    label: 'Dashboard',
    href: '/customer/dashboard',
    icon: 'LayoutDashboard',
    roles: ['user'],
    hideWhenExpired: true,
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
    id: 'customer-packages',
    label: 'Packages',
    href: '/customer/packages',
    icon: 'Package',
    roles: ['user'],
    permission: { menu: 'packages', action: 'read' },
    section: 'Billing',
    expiredOnly: true,
  },
  {
    id: 'customer-payments',
    label: 'My Payment',
    href: '/customer/payments',
    icon: 'Banknote',
    roles: ['user'],
    section: 'Billing',
  },
  {
    id: 'customer-support',
    label: 'Support',
    href: '/customer/support',
    icon: 'LifeBuoy',
    roles: ['user'],
    permission: { menu: 'support', action: 'read' },
    hideWhenExpired: true,
  },
  {
    id: 'customer-rewards',
    label: 'Rewards',
    href: '/customer/rewards',
    icon: 'Gift',
    roles: ['user'],
    permission: { menu: 'reward', action: 'read' },
    hideWhenExpired: true,
  },
  {
    id: 'customer-news',
    label: 'News',
    href: '/customer/news',
    icon: 'Newspaper',
    roles: ['user'],
    hideWhenExpired: true,
  },
  {
    id: 'customer-router',
    label: 'Router',
    href: '/customer/router',
    icon: 'Router',
    roles: ['user'],
    hideWhenExpired: true,
  },
  {
    id: 'customer-profile',
    label: 'Profile',
    href: '/customer/profile',
    icon: 'User',
    roles: ['user'],
    hideWhenExpired: true,
  },
];

/** Mobile bottom nav — top 5 tabs */
export const customerBottomNav = [
  'customer-dashboard',
  'customer-subscription',
  'customer-payments',
  'customer-support',
  'customer-profile',
] as const;
