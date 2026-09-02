import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import type { NavItem } from '@/config/navigation/index';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import { useMemo, useState } from 'react';

interface PortalSidebarProps {
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

function NavIcon({ name }: { name?: string }) {
  if (!name) return null;
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined;
  return Icon ? <Icon className="h-4 w-4" /> : null;
}

function NavTree({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map((item) =>
        item.children?.length ? (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              {item.children.map((child: NavItem) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton render={<Link href={child.href ?? '#'} />}>
                    {child.label}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton render={<Link href={item.href ?? '#'} />}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </>
  );
}

export function PortalSidebar({ portal }: PortalSidebarProps) {
  const items = useFilteredNav();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    const match = (n: NavItem): boolean =>
      n.label.toLowerCase().includes(q) || (n.children?.some(match) ?? false);
    return items.filter(match);
  }, [items, query]);

  const sections = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of filtered) {
      const key = item.section ?? 'Menu';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <Image src={brandAssets.logo} alt="" width={32} height={32} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{siteConfig.name}</div>
          <div className="text-muted-foreground truncate text-xs capitalize">{portal} portal</div>
        </div>
      </div>
      <div className="p-3">
        <Input
          placeholder="Search menu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search menu"
          className="h-8"
        />
      </div>
      <SidebarContent>
        {sections.map(([section, sectionItems]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel>{section}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavTree items={sectionItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {filtered.length === 0 ? (
          <p className="text-muted-foreground px-4 py-2 text-sm">No menu matches</p>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
