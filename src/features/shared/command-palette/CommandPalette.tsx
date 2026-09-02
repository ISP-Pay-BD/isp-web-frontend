'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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
  if (!name) return null;
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined;
  return Icon ? <Icon className="mr-2 h-4 w-4" /> : null;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command palette" description="Jump to any page">
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        {grouped.map(([section, items], idx) => (
          <div key={section}>
            {idx > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={section}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.href}`}
                  onSelect={() => item.href && navigate(item.href)}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
