'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
import { adminSectionOrder } from '@/config/navigation/admin';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { createElement, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getNavIcon } from '@/features/shared/command-palette/nav-icons';
import { useSidebarPins } from '@/features/admin/sidebar-pins/hooks/use-sidebar-pins';
import { TenantThemeSync } from '@/features/admin/theme-studio/hooks/use-theme-studio';
import { useTranslations } from '@/i18n/locale-context';

interface PortalSidebarProps {
  portal: 'admin' | 'customer' | 'platform' | 'employee';
}

/** `Billing & Collections` -> `billing_collections`: the key of a sidebar group name under `nav.section`. */
function sectionSlug(section: string): string {
  return section.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function NavIcon({ name, className }: { name?: string; className?: string }) {
  const icon = getNavIcon(name);
  return icon ? createElement(icon, { className: className ?? 'h-4 w-4 shrink-0' }) : null;
}

/** The deepest nav href that contains `path` (`/admin/customers/12` -> `/admin/customers`, not a shorter sibling). */
function pickActiveHref(items: NavItem[], path: string): string | null {
  let best: string | null = null;
  const visit = (item: NavItem) => {
    const href = item.href;
    if (href && (path === href || path.startsWith(`${href}/`)) && (!best || href.length > best.length)) best = href;
    item.children?.forEach(visit);
  };
  items.forEach(visit);
  return best;
}


function NavTree({ items, currentPath }: { items: NavItem[]; currentPath: string }) {
  const t = useTranslations();
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
        const itemLabel = t(`nav.${item.id}`, item.label);

        return item.children?.length ? (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isParentActive}
              onClick={() => toggle(item.id)}
              tooltip={itemLabel}
              className={
                isParentActive
                  ? 'ipb-sidebar-button active-parent group relative rounded-lg py-5 font-semibold text-primary'
                  : 'ipb-sidebar-button rounded-lg py-5 text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              }
            >
              {isParentActive && (
                <>
                  <span className="absolute inset-0 -z-10 rounded-lg bg-primary/[0.08] dark:bg-primary/[0.12]" />
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" aria-hidden />
                </>
              )}
              <NavIcon name={item.icon} />
              <span className="truncate">{itemLabel}</span>
              {!isCollapsed && (
                <ChevronDown
                  className={`ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-250 ease-out group-hover:text-muted-foreground/80 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              )}
            </SidebarMenuButton>
            {isExpanded && !isCollapsed && (
              <SidebarMenuSub className="border-sidebar-border/30 my-0.5 ml-4 space-y-px border-l-2 py-1 pl-3">
                {item.children.map((child: NavItem) => {
                  const isChildActive = child.href === currentPath;
                  return (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton
                        isActive={isChildActive}
                        className={
                          isChildActive
                            ? 'ipb-sidebar-sub-button active-child relative rounded-md py-[7px] pl-3 text-[13px] font-semibold text-primary'
                            : 'ipb-sidebar-sub-button rounded-md py-[7px] pl-3 text-[13px] text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/85'
                        }
                        render={<Link href={child.href ?? '#'} />}
                      >
                        {isChildActive && (
                          <>
                            <span className="absolute inset-0 -z-10 rounded-md bg-primary/[0.07] dark:bg-primary/[0.12]" />
                            <span className="absolute inset-y-1.5 left-0 w-[2.5px] rounded-full bg-primary" aria-hidden />
                          </>
                        )}
                        <span className="truncate">{t(`nav.${child.id}`, child.label)}</span>
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
              tooltip={itemLabel}
              className={
                isLeafActive
                  ? 'ipb-sidebar-button active-leaf group relative rounded-lg py-5 font-semibold text-primary'
                  : 'ipb-sidebar-button rounded-lg py-5 text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              }
              render={<Link href={item.href ?? '#'} />}
            >
              {isLeafActive && (
                <>
                  <span className="absolute inset-0 -z-10 rounded-lg bg-primary/[0.08] dark:bg-primary/[0.14]" />
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" aria-hidden />
                </>
              )}
              <NavIcon name={item.icon} />
              <span className="truncate">{itemLabel}</span>
              {item.badge ? (
                <span className="bg-primary/15 text-primary ml-auto rounded-md px-1.5 py-0.5 text-xs font-semibold dark:bg-primary/20">
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
  const t = useTranslations();
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
    toast.success(t('common.header.signedOut', 'You are signed out'));
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
      n.label.toLowerCase().includes(q) ||
      t(`nav.${n.id}`, n.label).toLowerCase().includes(q) ||
      (n.children?.some(match) ?? false);
    return items.filter(match);
  }, [items, query, t]);

  const sections = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of filtered) {
      const key = item.section ?? 'Menu';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const order = portal === 'admin' ? adminSectionOrder : [];
    const rank = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
    return [...map.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
  }, [filtered, portal]);

  const activeHref = useMemo(() => pickActiveHref(items, pathname), [items, pathname]);

  const showNavSkeleton = !hydrated;

  // Admin portal: the user's pinned shortcuts on top + the tenant's saved theme.
  const isAdminPortal = portal === 'admin' && (user?.role === 'admin' || user?.role === 'resellerAdmin');
  const pins = useSidebarPins(hydrated && portal === 'admin' && Boolean(user));
  const navIdByHref = useMemo(() => {
    const map = new Map<string, string>();
    const visit = (item: NavItem) => {
      if (item.href) map.set(item.href, item.id);
      item.children?.forEach(visit);
    };
    items.forEach(visit);
    return map;
  }, [items]);
  const pinnedItems = useMemo<NavItem[]>(
    () =>
      (pins.data ?? []).map((p) => {
        const navId = navIdByHref.get(p.href);
        return {
          id: `pin-${p.id}`,
          label: navId ? t(`nav.${navId}`, p.label) : p.label,
          href: p.href,
          icon: p.icon || 'Pin',
        };
      }),
    [pins.data, navIdByHref, t],
  );

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar border-r shadow-[var(--shadow-xs)]">
      {/* Header — Logo + Brand */}
      <div className={`border-sidebar-border flex items-center gap-3 border-b ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5'}`}>
        <div className="bg-card border-border/80 relative flex shrink-0 items-center justify-center rounded-lg border p-1 shadow-[var(--shadow-xs)] dark:border-sidebar-border dark:bg-sidebar-accent/50">
          <Image src={brandAssets.logo} alt={t('common.sidebar.logoAlt', '{name} logo', { name: siteConfig.name })} width={28} height={28} className="shrink-0" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sidebar-foreground truncate text-xs font-bold tracking-tight">{siteConfig.name}</div>
            <div className="text-muted-foreground flex items-center gap-1.5 truncate text-xs font-medium capitalize">
              <span className="bg-emerald-500 inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
              {t(`common.portal.${portal}`, `${portal} portal`)}
            </div>
          </div>
        )}
      </div>

      {/* Search — hidden when collapsed */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder={t('common.sidebar.searchPlaceholder', 'Search menu…')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('common.sidebar.searchLabel', 'Search menu')}
              className="border-border/70 bg-background/40 placeholder:text-muted-foreground/50 focus:bg-background focus:ring-primary/20 dark:border-sidebar-border dark:bg-sidebar-accent/30 dark:focus:bg-sidebar-accent/60 h-8 rounded-lg border pl-8 text-xs shadow-none focus:ring-1"
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
            <TenantThemeSync enabled={hydrated && isAdminPortal} />
            {pinnedItems.length > 0 && !query.trim() && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground/60 px-3 pt-3 pb-1 text-xs font-medium tracking-normal select-none">
                  {t('common.sidebar.pinned', 'Pinned')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <NavTree items={pinnedItems} currentPath={pathname} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            {sections.map(([section, sectionItems], idx) => {
              const sectionLabel = t(`nav.section.${sectionSlug(section)}`, section);
              return (
                <SidebarGroup key={section}>
                  {idx > 0 && <div className="border-sidebar-border/30 mx-3 my-1 border-t" />}
                  <SidebarGroupLabel className="text-muted-foreground/60 px-3 pt-3.5 pb-1 text-xs font-medium tracking-normal select-none">
                    {sectionLabel}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <NavTree items={sectionItems} currentPath={activeHref ?? pathname} />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground px-4 py-2 text-sm">{t('common.sidebar.noMatch', 'No menu matches')}</p>
            ) : null}
          </>
        )}
      </SidebarContent>

      {/* Sidebar Footer with User Profile and Logout */}
      <SidebarFooter className={`border-sidebar-border border-t ${isCollapsed ? 'p-2' : 'px-3 py-3'}`}>
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
              className={`hover:bg-sidebar-accent/70 group flex items-center gap-2.5 rounded-lg p-2 transition-colors dark:hover:bg-sidebar-accent ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? `${user.name} — ${t('common.header.profile', 'My profile')}` : undefined}
            >
              <Avatar className="border-primary/20 h-8 w-8 shrink-0 rounded-md border shadow-[var(--shadow-xs)]">
                <AvatarFallback className="bg-primary/10 text-primary rounded-md text-xs font-semibold dark:bg-primary/15">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sidebar-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors">
                    {user.name}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">{user.email}</div>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`border-destructive/15 bg-destructive/5 hover:bg-destructive/10 text-destructive hover:border-destructive/30 dark:border-destructive/25 dark:bg-destructive/[0.08] dark:hover:bg-destructive/15 flex items-center gap-2 rounded-lg border py-2 text-xs font-medium transition active:scale-[0.98] ${isCollapsed ? 'justify-center' : 'w-full'}`}
              title={isCollapsed ? t('common.header.logout', 'Log out') : undefined}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>{t('common.header.logout', 'Log out')}</span>}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={`bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold shadow-[var(--shadow-primary)] transition ${isCollapsed ? 'px-0' : 'w-full'}`}
          >
            {!isCollapsed && <span>{t('common.header.login', 'Log in')}</span>}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
