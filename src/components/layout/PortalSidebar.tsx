'use client';

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
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';
import type { NavItem } from '@/config/navigation/index';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface PortalSidebarProps {
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

function NavIcon({ name }: { name?: string }) {
  if (!name) return null;
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined;
  return Icon ? <Icon className="h-4 w-4" /> : null;
}

function NavTree({ items, currentPath }: { items: NavItem[]; currentPath: string }) {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const active = new Set<string>();
    for (const item of items) {
      if (item.children?.some((c) => c.href === currentPath)) {
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
        const isParentActive =
          item.href === currentPath || (item.children?.some((c) => c.href === currentPath) ?? false);
        const isExpanded = expandedIds.has(item.id);
        const isLeafActive = item.href === currentPath;

        return item.children?.length ? (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isParentActive}
              onClick={() => toggle(item.id)}
              tooltip={item.label}
              className={
                isParentActive
                  ? 'ipb-sidebar-button relative rounded-lg font-semibold text-primary'
                  : 'ipb-sidebar-button rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
              }
            >
              {isParentActive && (
                <>
                  <span className="absolute inset-0 -z-10 rounded-lg bg-primary/10 dark:bg-primary/15" />
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
                </>
              )}
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {!isCollapsed && (
                <ChevronDown
                  className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${
                    isExpanded ? '' : '-rotate-90'
                  }`}
                />
              )}
            </SidebarMenuButton>
            {isExpanded && !isCollapsed && (
              <SidebarMenuSub className="border-sidebar-border/70 my-1 ml-3.5 space-y-0.5 border-l pl-2">
                {item.children.map((child: NavItem) => {
                  const isChildActive = child.href === currentPath;
                  return (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton
                        isActive={isChildActive}
                        className={
                          isChildActive
                            ? 'ipb-sidebar-sub-button relative rounded-r-md font-semibold text-primary'
                            : 'ipb-sidebar-sub-button rounded-md text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                        }
                        render={<Link href={child.href ?? '#'} />}
                      >
                        {isChildActive && (
                          <>
                            <span className="absolute inset-0 -z-10 rounded-r-md bg-primary/15 dark:bg-primary/20" />
                            <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
                          </>
                        )}
                        <span>{child.label}</span>
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
              isActive={isLeafActive}
              tooltip={item.label}
              className={
                isLeafActive
                  ? 'ipb-sidebar-button relative rounded-r-md font-semibold text-primary'
                  : 'ipb-sidebar-button rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
              }
              render={<Link href={item.href ?? '#'} />}
            >
              {isLeafActive && (
                <>
                  <span className="absolute inset-0 -z-10 rounded-r-md bg-primary/15 dark:bg-primary/20" />
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
                </>
              )}
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="bg-primary text-primary-foreground ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium">
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
  const hydrated = useAuthHydrated();
  const items = useFilteredNav();
  const [query, setQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  const handleLogout = () => {
    logout();
    toast.success('You are signed out');
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

  const showNavSkeleton = !hydrated;

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar border-r shadow-[var(--shadow-xs)]">
      {/* Header — Logo + Brand */}
      <div className={`border-sidebar-border flex items-center gap-3 border-b ${isCollapsed ? 'justify-center p-3' : 'p-3.5'}`}>
        <div className="bg-card border-border/80 relative flex shrink-0 items-center justify-center rounded-lg border p-1 shadow-[var(--shadow-xs)] dark:border-sidebar-border dark:bg-sidebar-accent/50">
          <Image src={brandAssets.logo} alt={`${siteConfig.name} logo`} width={28} height={28} className="shrink-0" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sidebar-foreground truncate text-xs font-semibold tracking-tight">{siteConfig.name}</div>
            <div className="text-muted-foreground flex items-center gap-1.5 truncate text-[11px] font-medium capitalize">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {portal} portal
            </div>
          </div>
        )}
      </div>

      {/* Search — hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search menu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search menu"
              className="border-border/80 bg-background/50 focus:bg-background dark:border-sidebar-border dark:bg-sidebar-accent/40 dark:focus:bg-sidebar-accent/70 h-8 rounded-lg pl-8 text-xs"
            />
          </div>
        </div>
      )}

      <SidebarContent>
        {showNavSkeleton ? (
          <div className="space-y-3 px-3 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {sections.map(([section, sectionItems]) => (
              <SidebarGroup key={section}>
                <SidebarGroupLabel className="text-muted-foreground/80 px-3 text-[11px] font-medium tracking-wide">
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
          </>
        )}
      </SidebarContent>

      {/* Sidebar Footer with User Profile and Logout */}
      <SidebarFooter className={`border-sidebar-border border-t ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {showNavSkeleton ? (
          <div className="flex items-center gap-2.5 p-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            {!isCollapsed && (
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            )}
          </div>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <Link
              href={portal === 'customer' ? '/customer/profile' : '/admin/profile'}
              className={`hover:bg-sidebar-accent/80 group flex items-center gap-2.5 rounded-lg p-2 transition-colors dark:hover:bg-sidebar-accent ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? `${user.name} — Profile` : undefined}
            >
              <Avatar className="border-primary/25 h-8 w-8 shrink-0 rounded-md border shadow-[var(--shadow-xs)]">
                <AvatarFallback className="bg-primary/10 text-primary rounded-md text-xs font-semibold dark:bg-primary/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sidebar-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors">
                    {user.name}
                  </div>
                  <div className="text-muted-foreground truncate text-[10px]">{user.email}</div>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive hover:border-destructive/40 dark:border-destructive/30 dark:bg-destructive/10 dark:hover:bg-destructive/20 flex items-center gap-2 rounded-lg border py-2 text-xs font-medium transition-all active:scale-[0.98] ${isCollapsed ? 'justify-center' : 'w-full'}`}
              title={isCollapsed ? 'Log out' : undefined}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>Log out</span>}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={`bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold shadow-[var(--shadow-primary)] transition-all ${isCollapsed ? 'px-0' : 'w-full'}`}
          >
            {!isCollapsed && <span>Log in</span>}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
