'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CHORD_MS = 1200;

/** `g` then a key jumps to a screen, like in Linear / GitHub. Only the admin portal registers these. */
export const GO_SHORTCUTS: { key: string; href: string; label: string }[] = [
  { key: 'd', href: '/admin/dashboard', label: 'Dashboard' },
  { key: 'c', href: '/admin/customers', label: 'Customers' },
  { key: 'e', href: '/admin/customers/expired', label: 'Expired customers' },
  { key: 'p', href: '/admin/customer-payments', label: 'Payments' },
  { key: 't', href: '/admin/support', label: 'Support tickets' },
  { key: 'r', href: '/admin/reports', label: 'Reports' },
];

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/**
 * Keyboard shortcuts for operators who live in the admin portal: `/` focuses the page search, `g` + letter jumps to
 * a screen, `?` opens the shortcut list. Ignored while typing and when a modifier key is held (⌘K stays with the palette).
 */
export function useGlobalShortcuts({ enabled, onHelp }: { enabled: boolean; onHelp: () => void }) {
  const router = useRouter();
  const chordAt = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;

      if (e.key === '?') {
        e.preventDefault();
        onHelp();
        return;
      }
      if (e.key === '/') {
        const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type="search"], input[aria-label^="Search"]')];
        // the page's own search wins over the sidebar's menu search
        const search = inputs.find((el) => !el.closest('[data-slot^="sidebar"], [data-sidebar]')) ?? inputs[0];
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }
      if (e.key === 'g') {
        chordAt.current = Date.now();
        return;
      }
      if (Date.now() - chordAt.current < CHORD_MS) {
        const target = GO_SHORTCUTS.find((s) => s.key === e.key);
        chordAt.current = 0;
        if (target) {
          e.preventDefault();
          router.push(target.href);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onHelp, router]);
}
