'use client';

import { createElement, useMemo, type ComponentType } from 'react';
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
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import { canSee } from '@/lib/permissions/can';
import { useAuthStore } from '@/stores/auth-store';
import type { NavItem } from '@/config/navigation';
import { getNavIcon } from './nav-icons';

/**
 * Shortcuts to the pages the daily jobs start from. Shown only to the roles and permissions the
 * destination (and its API) requires, so the palette never offers a page that would refuse the caller.
 */
const QUICK_ACTIONS: ReadonlyArray<
  Pick<NavItem, 'roles' | 'permission'> & {
    href: string;
    label: string;
    keywords: string;
    Icon: ComponentType<{ className?: string }>;
    tone: string;
  }
> = [
  {
    href: '/admin/customers/new',
    label: 'Add New Customer',
    keywords: 'Add customer new create subscriber',
    Icon: UserPlus,
    tone: 'text-primary',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer', action: 'create' },
  },
  {
    href: '/admin/customer-payments/new',
    label: 'Record Customer Payment',
    keywords: 'Record payment collection invoice bill',
    Icon: Receipt,
    tone: 'text-emerald-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer_payment', action: 'create' },
  },
  {
    href: '/admin/customers/expired',
    label: 'View Payment Due Customers',
    keywords: 'Due payment expired customers collection',
    Icon: Users,
    tone: 'text-amber-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'customer', action: 'read' },
  },
  {
    href: '/admin/reports/btrc',
    label: 'Generate BTRC Compliance Reports',
    keywords: 'BTRC compliance reports subscriber export',
    Icon: FileText,
    tone: 'text-emerald-500',
    roles: ['admin', 'resellerAdmin'],
    permission: { menu: 'reports', action: 'read' },
  },
  {
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

function NavIcon({ name }: { name?: string }) {
  return createElement(getNavIcon(name) ?? Compass, { className: 'mr-2 h-4 w-4 shrink-0 text-muted-foreground' });
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Quick Jump & Actions" description="Search pages or run quick ISP operations">
      <CommandInput placeholder="Search pages, customers, operations (e.g. 'Payment', 'Router', 'SMS')..." />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No matching pages or actions found.</CommandEmpty>

        {/* Quick Operations Group */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map(({ href, label, keywords, Icon, tone }) => (
            <CommandItem
              key={href}
              value={keywords}
              onSelect={() => navigate(href)}
              onClick={() => navigate(href)}
              className="cursor-pointer"
            >
              <Icon className={`mr-2 h-4 w-4 ${tone}`} />
              <span className="font-medium">{label}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">{href}</span>
            </CommandItem>
          ))}

          <CommandItem
            value="Toggle theme dark light mode appearance"
            onSelect={() => {
              handleAction(() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                toast.success(`Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
              });
            }}
            onClick={() => {
              handleAction(() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                toast.success(`Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
              });
            }}
            className="cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-blue-500" />
            )}
            <span className="font-medium">Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">Theme Switch</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation Categories */}
        {grouped.map(([section, items]) => (
          <CommandGroup key={section} heading={section}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.href} ${section}`}
                onSelect={() => item.href && navigate(item.href)}
                onClick={() => item.href && navigate(item.href)}
                className="cursor-pointer"
              >
                <NavIcon name={item.icon} />
                <span className="font-medium">{item.label}</span>
                {item.href ? (
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/80">
                    {item.href}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

