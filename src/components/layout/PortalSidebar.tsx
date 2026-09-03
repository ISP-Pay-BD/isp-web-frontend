import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import { useAuthStore } from '@/stores/auth-store';
import type { NavItem } from '@/config/navigation/index';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
  const router = useRouter();
  const items = useFilteredNav();
  const [query, setQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

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

      {/* Sidebar Footer with User Profile and Logout */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user ? (
          <div className="flex flex-col gap-2">
            <Link
              href={portal === 'customer' ? '/customer/profile' : '/admin/profile'}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
            >
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-xs font-bold text-sidebar-foreground group-hover:text-primary transition-colors">
                  {user.name}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-semibold py-2 transition-all hover:border-destructive/40 active:scale-[0.98]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-2 hover:bg-primary/90 transition-all shadow-xs"
          >
            <span>Log In</span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
