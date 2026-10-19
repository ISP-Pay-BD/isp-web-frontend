'use client';

import {
  Command,
  LogOut,
  User,
  CreditCard,
  ChevronDown,
  Bell,
  ArrowRightLeft,
  LifeBuoy,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LocaleToggle } from '@/components/shared/LocaleToggle';
import { useTranslations } from '@/i18n/locale-context';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';
import { ThemeToggle } from './ThemeToggle';
import { ShortcutsDialog } from './ShortcutsDialog';
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { CommandPalette } from '@/features/shared/command-palette';
import { toast } from 'sonner';

interface PortalHeaderProps {
  portal: string;
}

export function PortalHeader({ portal }: PortalHeaderProps) {
  const router = useRouter();
  const t = useTranslations();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const showCommandPalette = true;
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  useGlobalShortcuts({ enabled: portal === 'admin', onHelp: openShortcuts });
  const applyThemeCustomizerStyles = useThemeCustomizerStore((s) => s.applyDomStyles);

  // Re-apply the saved brand color/radius/density on every full load — the
  // customizer dialog only applies them while it's mounted, so without this
  // a refresh silently reverted the picked color back to the default orange.
  useEffect(() => {
    applyThemeCustomizerStyles();
  }, [applyThemeCustomizerStyles]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success(t('common.header.signedOut', 'You are signed out'));
    router.push('/login');
  };

  const handleSwitchAccount = () => {
    logout();
    toast.info(t('common.header.switchHint', 'Sign in with another account to continue'));
    router.push('/login');
  };

  // Initials for avatar
  const initials = user?.name
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'U';

  const roleDisplayLabel =
    user?.role === 'user'
      ? t('common.role.customer', 'Customer')
      : user?.role === 'admin'
        ? t('common.role.admin', 'ISP Admin')
        : user?.role === 'super_admin'
          ? t('common.role.superAdmin', 'Platform Super Admin')
          : user?.role === 'resellerAdmin'
            ? t('common.role.reseller', 'Reseller Admin')
            : t('common.role.employee', 'Employee');
  const profileHref =
    portal === 'customer' ? '/customer/profile' : portal === 'employee' ? '/employee/profile' : portal === 'admin' ? '/admin/profile' : null;

  return (
    <>
      <header className="bg-background/88 sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/70 px-4 shadow-[var(--shadow-xs)] backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-xs font-medium tracking-wide capitalize sm:block">
              {t(`common.portal.${portal}`, `${portal} portal`)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Search trigger (Admin) */}
          {showCommandPalette ? (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground border-border/80 hidden h-8 gap-2 hover:border-primary/35 sm:flex"
              onClick={() => setPaletteOpen(true)}
            >
              <Command className="h-3.5 w-3.5" />
              <span className="text-xs font-normal">{t('common.header.quickJump', 'Quick jump')}</span>
              <kbd className="bg-muted pointer-events-none rounded border px-1.5 py-0.5 font-mono text-xs">
                ⌘K
              </kbd>
            </Button>
          ) : null}

          {/* Quick Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent hover:text-foreground relative h-10 w-10 rounded-lg border border-transparent sm:h-8 sm:w-8 transition-colors hover:border-border"
            onClick={() => toast.info(t('common.header.noNotifications', 'You are all caught up'))}
            aria-label={t('common.header.notifications', 'Notifications')}
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme Studio Customizer Trigger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent hover:text-foreground relative h-10 w-10 rounded-lg border border-transparent sm:h-8 sm:w-8 transition-colors hover:border-border"
            onClick={() => setThemeCustomizerOpen(true)}
            aria-label={t('common.header.themeStudio', 'Theme Studio')}
            title={t('common.header.themeStudioTitle', 'Theme Studio & Appearance')}
          >
            <Palette className="text-primary h-4 w-4" />
          </Button>

          <LocaleToggle variant="portal" className="hidden sm:inline-flex" />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Account Dropdown Menu */}
          {!hydrated ? (
            <div className="border-border/80 ml-1 flex h-8 w-28 items-center gap-2 rounded-lg border px-1.5">
              <div className="bg-muted h-7 w-7 animate-pulse rounded-md" />
              <div className="hidden flex-1 space-y-1 sm:block">
                <div className="bg-muted h-2.5 w-16 animate-pulse rounded" />
                <div className="bg-muted h-2 w-12 animate-pulse rounded" />
              </div>
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="border-border/80 bg-card/80 hover:border-primary/35 hover:bg-accent/70 group ml-1 flex items-center gap-2.5 rounded-lg border py-1 pr-2.5 pl-1.5 shadow-[var(--shadow-xs)] backdrop-blur-xs transition focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  <Avatar className="border-primary/20 ring-background h-7 w-7 rounded-md border shadow-[var(--shadow-xs)] ring-2">
                    <AvatarFallback className="bg-primary/15 text-primary rounded-md text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ring-background absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2" />
                </div>

                <div className="hidden flex-col items-start text-left leading-tight sm:flex">
                  <span className="text-foreground group-hover:text-primary text-xs font-semibold tracking-tight transition-colors">
                    {user.name}
                  </span>
                  <span className="text-muted-foreground/90 text-xs font-medium">
                    {roleDisplayLabel}
                  </span>
                </div>

                <ChevronDown className="text-muted-foreground/70 group-hover:text-foreground ml-0.5 h-3 w-3 transition-transform duration-200 group-hover:translate-y-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="border-border/80 w-60 p-2 shadow-[var(--shadow-md)] backdrop-blur-md">
                {/* User Info Card */}
                <div className="border-border/40 bg-muted/50 mb-1 flex items-center gap-2.5 rounded-lg border p-2">
                  <Avatar className="border-primary/30 h-9 w-9 rounded-md border">
                    <AvatarFallback className="bg-primary/15 text-primary rounded-md text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-foreground truncate text-xs font-semibold">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mt-0.5 w-fit px-1 py-0 text-xs font-medium">
                      {roleDisplayLabel}
                    </Badge>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  {profileHref ? (
                    <DropdownMenuItem render={<Link href={profileHref} />} className="cursor-pointer gap-2 py-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <span>{t('common.header.profile', 'My profile')}</span>
                    </DropdownMenuItem>
                  ) : null}

                  <DropdownMenuItem
                    onClick={() => setThemeCustomizerOpen(true)}
                    className="cursor-pointer gap-2 py-2"
                  >
                    <Palette className="text-muted-foreground h-4 w-4" />
                    <span>{t('common.header.appearance', 'Theme & appearance')}</span>
                  </DropdownMenuItem>

                  {portal === 'customer' && (
                    <DropdownMenuItem render={<Link href="/customer/subscription" />} className="cursor-pointer gap-2 py-2">
                      <CreditCard className="text-muted-foreground h-4 w-4" />
                      <span>{t('common.header.subscription', 'Subscription & plan')}</span>
                    </DropdownMenuItem>
                  )}

                  {portal === 'customer' && (
                    <DropdownMenuItem render={<Link href="/customer/support" />} className="cursor-pointer gap-2 py-2">
                      <LifeBuoy className="text-muted-foreground h-4 w-4" />
                      <span>{t('common.header.tickets', 'Support tickets')}</span>
                    </DropdownMenuItem>
                  )}

                  <div className="px-2 py-1.5 sm:hidden">
                    <LocaleToggle variant="portal" />
                  </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Switch Account */}
                <DropdownMenuItem
                  onClick={handleSwitchAccount}
                  className="hover:text-primary text-foreground cursor-pointer gap-2 py-2"
                >
                  <ArrowRightLeft className="text-muted-foreground h-4 w-4" />
                  <span>{t('common.header.switchAccount', 'Switch account')}</span>
                </DropdownMenuItem>

                {/* Logout Action */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer gap-2 py-2 text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">{t('common.header.logout', 'Log out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="h-8 text-xs font-semibold" render={<Link href="/login" />}>
                {t('common.header.login', 'Log in')}
              </Button>
          )}
        </div>
      </header>

      {showCommandPalette ? (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      ) : null}

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Theme Customizer Modal */}
      <ThemeCustomizerModal
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </>
  );
}
