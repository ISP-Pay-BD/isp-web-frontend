'use client';

import {
  Moon,
  Sun,
  Command,
  LogOut,
  User,
  Settings,
  Shield,
  CreditCard,
  ChevronDown,
  Bell,
  Sparkles,
  ArrowRightLeft,
  LifeBuoy,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';
import { CommandPalette } from '@/features/shared/command-palette';
import { toast } from 'sonner';

interface PortalHeaderProps {
  portal: string;
}

export function PortalHeader({ portal }: PortalHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const showCommandPalette = portal === 'admin';

  useEffect(() => {
    if (!showCommandPalette) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCommandPalette]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleSwitchAccount = () => {
    logout();
    toast.info('Please select or log in with another account');
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
      ? 'Customer'
      : user?.role === 'admin'
        ? 'ISP Admin'
        : user?.role === 'super_admin'
          ? 'Platform Super Admin'
          : user?.role === 'resellerAdmin'
            ? 'Reseller Admin'
            : 'Employee';

  return (
    <>
      <header className="bg-background/90 sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/80 px-4 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-xs font-semibold tracking-wide uppercase sm:block">
              {portal} Portal
            </span>
            <span className="h-3 w-px bg-border/80 hidden sm:block" />
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 font-mono hidden md:inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Gateway
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search trigger (Admin) */}
          {showCommandPalette ? (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hidden h-8 gap-2 border-border/80 hover:border-primary/40 sm:flex"
              onClick={() => setPaletteOpen(true)}
            >
              <Command className="h-3.5 w-3.5" />
              <span className="text-xs font-normal">Quick Jump</span>
              <kbd className="bg-muted pointer-events-none rounded border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </Button>
          ) : null}

          {/* Quick Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent relative border border-transparent hover:border-border transition-transform hover:scale-105 active:scale-95"
            onClick={() => toast.info('No unread network notifications')}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          {/* Theme Studio Customizer Trigger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-transform hover:scale-105 active:scale-95 relative"
            onClick={() => setThemeCustomizerOpen(true)}
            aria-label="Theme Studio"
            title="Theme Studio & Appearance"
          >
            <Palette className="h-4 w-4 text-primary" />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-transform hover:scale-105 active:scale-95"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-amber-500" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-blue-400" />
          </Button>

          {/* User Account Dropdown Menu */}
          {!hydrated ? (
            <div className="ml-1 flex h-8 w-28 items-center gap-2 rounded-full border border-border/80 px-1.5">
              <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
              <div className="hidden flex-1 space-y-1 sm:block">
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-2 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 hover:bg-accent/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group border border-border/80 hover:border-primary/40 shadow-xs bg-card/80 backdrop-blur-xs ml-1"
              >
                <div className="relative flex items-center justify-center">
                  <Avatar className="h-7 w-7 border border-primary/20 shadow-xs ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>

                <div className="flex flex-col items-start text-left leading-tight hidden sm:flex">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/90">
                    {roleDisplayLabel}
                  </span>
                </div>

                <ChevronDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-transform duration-200 group-hover:translate-y-0.5 ml-0.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60 p-2 shadow-xl border-border/80 backdrop-blur-md">
                {/* User Info Card */}
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/50 mb-1 border border-border/40">
                  <Avatar className="h-9 w-9 border border-primary/30">
                    <AvatarFallback className="bg-primary/15 text-primary font-black text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate text-foreground">{user.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                    <Badge variant="outline" className="w-fit text-[9px] px-1 py-0 mt-0.5 font-medium border-primary/30 text-primary bg-primary/5">
                      {roleDisplayLabel}
                    </Badge>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <Link href={portal === 'customer' ? '/customer/profile' : '/admin/profile'}>
                    <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>My Profile & NID</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    onClick={() => setThemeCustomizerOpen(true)}
                    className="cursor-pointer gap-2 py-2"
                  >
                    <Palette className="h-4 w-4 text-primary" />
                    <span>Theme & Appearance</span>
                  </DropdownMenuItem>

                  {portal === 'customer' && (
                    <Link href="/customer/subscription">
                      <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                        <span>Subscription & Plan</span>
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {portal === 'customer' && (
                    <Link href="/customer/support">
                      <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                        <LifeBuoy className="h-4 w-4 text-blue-500" />
                        <span>Support Tickets</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Switch Account */}
                <DropdownMenuItem
                  onClick={handleSwitchAccount}
                  className="cursor-pointer gap-2 py-2 text-foreground hover:text-primary"
                >
                  <ArrowRightLeft className="h-4 w-4 text-amber-500" />
                  <span>Switch Account</span>
                </DropdownMenuItem>

                {/* Logout Action */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer gap-2 py-2 text-rose-600 dark:text-rose-400 focus:bg-rose-500/10 focus:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-semibold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white">
                Log In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {showCommandPalette ? (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      ) : null}

      {/* Theme Customizer Modal */}
      <ThemeCustomizerModal
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </>
  );
}
