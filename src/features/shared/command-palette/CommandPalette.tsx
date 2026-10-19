'use client';

import { createElement, useMemo, type ComponentType, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  UserPlus,
  Receipt,
  FileText,
  Send,
  Sun,
  Moon,
  Users,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { toggleThemeWithTransition } from '@/components/layout/ThemeToggle';
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import { canSee } from '@/lib/permissions/can';
import { useAuthStore } from '@/stores/auth-store';
import type { NavItem } from '@/config/navigation';
import { useTranslations } from '@/i18n/locale-context';
import { getNavIcon } from './nav-icons';

/**
 * Shortcuts to the pages the daily jobs start from. Shown only to the roles and permissions the
 * destination (and its API) requires, so the palette never offers a page that would refuse the caller.
 */
const QUICK_ACTIONS: ReadonlyArray<
  Pick<NavItem, 'roles' | 'permission'> & {
    id: string;
    href: string;
    label: string;
    keywords: string;
    Icon: ComponentType<{ className?: string }>;
    tone: string;
  }
> = [
  {
    id: 'addCustomer',
    href: '/admin/customers/new',
    label: 'Add New Customer',
    keywords: 'Add customer new create subscriber',
    Icon: UserPlus,
    tone: 'text-primary',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer', action: 'create' },
  },
  {
    id: 'recordPayment',
    href: '/admin/customer-payments/new',
    label: 'Record Customer Payment',
    keywords: 'Record payment collection invoice bill',
    Icon: Receipt,
    tone: 'text-emerald-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer_payment', action: 'create' },
  },
  {
    id: 'dueCustomers',
    href: '/admin/customers/expired',
    label: 'View Payment Due Customers',
    keywords: 'Due payment expired customers collection',
    Icon: Users,
    tone: 'text-amber-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer', action: 'read' },
  },
  {
    id: 'btrcReports',
    href: '/admin/reports/btrc',
    label: 'Generate BTRC Compliance Reports',
    keywords: 'BTRC compliance reports subscriber export',
    Icon: FileText,
    tone: 'text-emerald-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'reports', action: 'read' },
  },
  {
    id: 'dueSms',
    href: '/admin/sms',
    label: 'Send Due SMS Reminders',
    keywords: 'Send SMS due reminders broadcast templates',
    Icon: Send,
    tone: 'text-purple-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'sms_message', action: 'read' },
  },
];

function flattenNav(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    if (item.href) result.push(item);
    if (item.children) result.push(...flattenNav(item.children));
  }
  return result;
}

function sectionSlug(section: string): string {
  return section.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function NavIcon({ name }: { name?: string }) {
  return createElement(getNavIcon(name) ?? Compass, { className: 'mr-2 h-4 w-4 shrink-0 text-muted-foreground' });
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const t = useTranslations();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const navItems = useFilteredNav();
  const quickActions = useMemo(
    () => (user ? QUICK_ACTIONS.filter((action) => canSee(action, user.permissions, user.role)) : []),
    [user],
  );

  const commands = useMemo(() => flattenNav(navItems), [navItems]);

  const grouped = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of commands) {
      const key = item.section ?? 'Navigation';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()];
  }, [commands]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const handleAction = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  const switchTheme = (event?: MouseEvent<HTMLElement>) => {
    handleAction(() => {
      const next = theme === 'dark' ? 'light' : 'dark';
      toggleThemeWithTransition(next, setTheme, event);
      toast.success(
        t('common.palette.themeSwitched', 'Theme switched to {mode} mode', {
          mode: next === 'dark' ? t('common.theme.dark', 'Dark') : t('common.theme.light', 'Light'),
        }),
      );
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t('common.palette.title', 'Quick Jump & Actions')} description={t('common.palette.description', 'Search pages or run quick ISP operations')}>
      <CommandInput placeholder={t('common.palette.placeholder', "Search pages, customers, operations (e.g. 'Payment', 'Router', 'SMS')...")} />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>{t('common.palette.empty', 'No matching pages or actions found.')}</CommandEmpty>

        {/* Quick Operations Group */}
        <CommandGroup heading={t('common.palette.quickActions', 'Quick Actions')}>
          {quickActions.map(({ id, href, label, keywords, Icon, tone }) => {
            const actionLabel = t(`common.palette.action.${id}`, label);
            return (
              <CommandItem
                key={href}
                value={`${keywords} ${actionLabel}`}
                onSelect={() => navigate(href)}
                onClick={() => navigate(href)}
                className="cursor-pointer"
              >
                <Icon className={`mr-2 h-4 w-4 ${tone}`} />
                <span className="font-medium">{actionLabel}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{href}</span>
              </CommandItem>
            );
          })}

          <CommandItem
            value="Toggle theme dark light mode appearance"
            onSelect={() => switchTheme()}
            onClick={(e) => switchTheme(e)}
            className="cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-blue-500" />
            )}
            <span className="font-medium">
              {t('common.palette.toggleTheme', 'Toggle Theme ({mode})', {
                mode: theme === 'dark' ? t('common.theme.light', 'Light') : t('common.theme.dark', 'Dark'),
              })}
            </span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{t('common.palette.themeSwitch', 'Theme Switch')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation Categories */}
        {grouped.map(([section, items]) => {
          const sectionLabel = t(`nav.section.${sectionSlug(section)}`, section);
          return (
            <CommandGroup key={section} heading={sectionLabel}>
              {items.map((item) => {
                const itemLabel = t(`nav.${item.id}`, item.label);
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${itemLabel} ${item.href} ${section} ${sectionLabel}`}
                    onSelect={() => item.href && navigate(item.href)}
                    onClick={() => item.href && navigate(item.href)}
                    className="cursor-pointer"
                  >
                    <NavIcon name={item.icon} />
                    <span className="font-medium">{itemLabel}</span>
                    {item.href ? (
                      <span className="ml-auto font-mono text-xs text-muted-foreground/80">
                        {item.href}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

