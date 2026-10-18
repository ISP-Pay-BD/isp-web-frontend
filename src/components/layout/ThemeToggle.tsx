'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';

export type ThemeMode = 'light' | 'dark';

/** Read theme directly from document.documentElement class so the icon never desyncs */
export function readTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/**
 * Executes a circular ripple View Transition when switching themes, identical to PayOnTask.
 * The new theme ripples out as an expanding circle from the click position.
 */
export function toggleThemeWithTransition(
  next: ThemeMode,
  setTheme: (theme: string) => void,
  event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }
) {
  const apply = () => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(next);
    root.style.colorScheme = next;
    setTheme(next);
  };

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document === 'undefined' || !document.startViewTransition || reduce) {
    apply();
    return;
  }

  const x = event && 'clientX' in event && typeof event.clientX === 'number' ? event.clientX : window.innerWidth / 2;
  const y = event && 'clientY' in event && typeof event.clientY === 'number' ? event.clientY : window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => undefined);
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const t = useTranslations();
  const { setTheme } = useTheme();
  // Server default (dark) is returned on SSR; client synchronizes to stored DOM state after hydration
  const theme = useSyncExternalStore(subscribe, readTheme, (): ThemeMode => 'dark');

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    const next: ThemeMode = readTheme() === 'dark' ? 'light' : 'dark';
    toggleThemeWithTransition(next, setTheme, event);
  }

  const dark = theme === 'dark';
  const label = dark ? t('common.theme.toLight', 'Switch to light mode') : t('common.theme.toDark', 'Switch to dark mode');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={dark}
      title={label}
      className={cn(
        'text-muted-foreground hover:bg-accent hover:text-foreground relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-transparent transition-colors duration-150 hover:border-border active:scale-95',
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          'absolute h-4 w-4 text-amber-500 transition duration-500',
          dark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          'absolute h-4 w-4 text-muted-foreground transition duration-500',
          dark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0',
        )}
      />
    </button>
  );
}
