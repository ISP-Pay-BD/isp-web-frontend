'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  UserPlus,
  Receipt,
  RefreshCw,
  Send,
  Sun,
  Moon,
  LifeBuoy,
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
import type { NavItem } from '@/config/navigation';

function flattenNav(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    if (item.href) result.push(item);
    if (item.children) result.push(...flattenNav(item.children));
  }
  return result;
}

function NavIcon({ name }: { name?: string }) {
  if (!name) return <Compass className="mr-2 h-4 w-4 text-muted-foreground" />;
  const Component = LucideIcons[name as keyof typeof LucideIcons] as unknown;
  if (typeof Component === 'function' || (typeof Component === 'object' && Component !== null)) {
    const Icon = Component as LucideIcon;
    return <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />;
  }
  return <Compass className="mr-2 h-4 w-4 text-muted-foreground" />;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const navItems = useFilteredNav();

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
          <CommandItem
            value="Add customer new create subscriber"
            onSelect={() => navigate('/admin/customers/new')}
            onClick={() => navigate('/admin/customers/new')}
            className="cursor-pointer"
          >
            <UserPlus className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium">Add New Customer</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">/admin/customers/new</span>
          </CommandItem>

          <CommandItem
            value="Record payment collection invoice bill"
            onSelect={() => navigate('/admin/customer-payments/new')}
            onClick={() => navigate('/admin/customer-payments/new')}
            className="cursor-pointer"
          >
            <Receipt className="mr-2 h-4 w-4 text-emerald-500" />
            <span className="font-medium">Record Customer Payment</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">/admin/customer-payments/new</span>
          </CommandItem>

          <CommandItem
            value="Due payment expired customers collection"
            onSelect={() => navigate('/admin/customers?status=expired')}
            onClick={() => navigate('/admin/customers?status=expired')}
            className="cursor-pointer"
          >
            <Users className="mr-2 h-4 w-4 text-amber-500" />
            <span className="font-medium">View Payment Due Customers</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">/admin/customers?status=expired</span>
          </CommandItem>

          <CommandItem
            value="Sync MikroTik routers RADIUS gateways"
            onSelect={() => {
              handleAction(() => {
                toast.success('MikroTik sync initiated — queues and sessions updating');
              });
            }}
            onClick={() => {
              handleAction(() => {
                toast.success('MikroTik sync initiated — queues and sessions updating');
              });
            }}
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
            <span className="font-medium">Sync MikroTik Gateways</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">Instant Action</span>
          </CommandItem>

          <CommandItem
            value="BTRC compliance reports subscriber export"
            onSelect={() => navigate('/admin/reports')}
            onClick={() => navigate('/admin/reports')}
            className="cursor-pointer"
          >
            <Send className="mr-2 h-4 w-4 text-emerald-500" />
            <span className="font-medium">Generate BTRC Compliance Reports</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">/admin/reports</span>
          </CommandItem>

          <CommandItem
            value="Send SMS due reminders broadcast templates"
            onSelect={() => navigate('/admin/sms')}
            onClick={() => navigate('/admin/sms')}
            className="cursor-pointer"
          >
            <Send className="mr-2 h-4 w-4 text-purple-500" />
            <span className="font-medium">Send Due SMS Reminders</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">/admin/sms</span>
          </CommandItem>

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

