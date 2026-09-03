import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LogOut, Search } from 'lucide-react';
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
import { ChevronDown } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface PortalSidebarProps {
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

function NavIcon({ name }: { name?: string }) {
  if (!name) return null;
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined;
  return Icon ? <Icon className="h-4 w-4" /> : null;
}

function NavTree({ items, currentPath }: { items: NavItem[]; currentPath: string }) {
  // Auto-expand items that have active children, and allow manual toggle
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const active = new Set<string>();
    for (const item of items) {
      if (item.children?.some(c => c.href === currentPath)) {
        active.add(item.id);
      }
    }
    return active;
  });

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <>
      {items.map((item) => {
        const isParentActive = item.href === currentPath || (item.children?.some(c => c.href === currentPath) ?? false);
        const isExpanded = expandedIds.has(item.id);
        return item.children?.length ? (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isParentActive}
              onClick={() => toggle(item.id)}
              className={
                isParentActive
                  ? 'ipb-sidebar-button font-bold text-primary bg-primary/10 dark:bg-primary/15 dark:text-primary-foreground/95 rounded-lg border-l-2 border-primary shadow-xs'
                  : 'ipb-sidebar-button hover:bg-sidebar-accent/80 hover:text-sidebar-foreground text-sidebar-foreground/80 hover:shadow-xs rounded-lg'
              }
            >
              <NavIcon name={item.icon} />
              <span className="transition-transform duration-150 group-hover/menu-button:translate-x-0.5">{item.label}</span>
              <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            </SidebarMenuButton>
            {isExpanded && (
              <SidebarMenuSub className="border-l border-sidebar-border/70 ml-3.5 pl-2 my-1 space-y-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                {item.children.map((child: NavItem) => {
                  const isChildActive = child.href === currentPath;
                  return (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton
                        isActive={isChildActive}
                        className={
                          isChildActive
                            ? 'ipb-sidebar-sub-button font-bold text-primary bg-primary/15 dark:bg-primary/20 dark:text-white border-l-2 border-primary rounded-r-md shadow-2xs'
                            : 'ipb-sidebar-sub-button text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all rounded-md hover:translate-x-1'
                        }
                        render={<Link href={child.href ?? '#'} />}
                      >
                        <span className="transition-transform duration-150 group-hover/menu-sub-button:translate-x-0.5">{child.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={item.href === currentPath}
              className={
                item.href === currentPath
                  ? 'ipb-sidebar-button font-bold text-primary bg-primary/15 dark:bg-primary/20 dark:text-white border-l-2 border-primary rounded-r-md shadow-2xs'
                  : 'ipb-sidebar-button hover:bg-sidebar-accent/80 hover:text-sidebar-foreground text-sidebar-foreground/80 hover:shadow-xs rounded-lg'
              }
              render={<Link href={item.href ?? '#'} />}
            >
              <NavIcon name={item.icon} />
              <span className="transition-transform duration-150 group-hover/menu-button:translate-x-0.5">{item.label}</span>
              {item.badge ? (
                <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-semibold shadow-2xs">
                  {item.badge}
                </span>
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function PortalSidebar({ portal }: PortalSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
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
    <Sidebar className="border-r border-sidebar-border bg-sidebar shadow-xs">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-3.5">
        <div className="relative flex items-center justify-center p-1 rounded-xl bg-card border border-border/80 shadow-2xs dark:bg-sidebar-accent/50 dark:border-sidebar-border">
          <Image src={brandAssets.logo} alt="ISP Pay BD" width={28} height={28} className="shrink-0" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold tracking-tight text-sidebar-foreground">{siteConfig.name}</div>
          <div className="text-muted-foreground truncate text-[11px] font-medium capitalize flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            {portal} portal
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search menu"
            className="h-8 pl-8 text-xs bg-background/50 focus:bg-background border-border/80 rounded-lg dark:bg-sidebar-accent/40 dark:focus:bg-sidebar-accent/70 dark:border-sidebar-border"
          />
        </div>
      </div>
      <SidebarContent>
        {sections.map(([section, sectionItems]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-3">
              {section}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavTree items={sectionItems} currentPath={pathname} />
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
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent/80 transition-colors group dark:hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8 border border-primary/25 shadow-2xs">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs dark:bg-primary/20 dark:text-primary-foreground">
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive text-xs font-semibold py-2 transition-all hover:border-destructive/40 active:scale-[0.98] dark:bg-destructive/10 dark:hover:bg-destructive/20 dark:border-destructive/30"
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
