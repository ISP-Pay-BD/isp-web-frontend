'use client';

import { Moon, Sun, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { CommandPalette } from '@/features/shared/command-palette';

interface PortalHeaderProps {
  portal: string;
}

export function PortalHeader({ portal }: PortalHeaderProps) {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [paletteOpen, setPaletteOpen] = useState(false);
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

  return (
    <>
      <header className="bg-background/95 flex h-14 items-center gap-3 border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <SidebarTrigger />
        <div className="text-muted-foreground hidden text-sm capitalize sm:block">{portal}</div>
        <div className="ml-auto flex items-center gap-2">
          {showCommandPalette ? (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hidden h-8 gap-2 sm:flex"
              onClick={() => setPaletteOpen(true)}
            >
              <Command className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="bg-muted pointer-events-none rounded border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
          {user ? <span className="text-sm font-medium">{user.name}</span> : null}
        </div>
      </header>
      {showCommandPalette ? (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      ) : null}
    </>
  );
}
