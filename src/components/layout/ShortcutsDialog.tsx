'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GO_SHORTCUTS } from '@/hooks/use-global-shortcuts';
import { useTranslations } from '@/i18n/locale-context';

function Keys({ children }: { children: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {children.map((k) => (
        <kbd key={k} className="bg-muted min-w-6 rounded border px-1.5 py-0.5 text-center font-mono text-xs">
          {k}
        </kbd>
      ))}
    </span>
  );
}

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const rows: { keys: string[]; label: string }[] = [
    { keys: ['⌘', 'K'], label: t('common.shortcuts.palette', 'Quick jump to any screen') },
    { keys: ['/'], label: t('common.shortcuts.search', 'Focus the search box') },
    ...GO_SHORTCUTS.map((s) => ({ keys: ['g', s.key], label: t(`common.shortcuts.go_${s.key}`, `Go to ${s.label}`) })),
    { keys: ['?'], label: t('common.shortcuts.help', 'Show this list') },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('common.shortcuts.title', 'Keyboard shortcuts')}</DialogTitle>
          <DialogDescription>{t('common.shortcuts.desc', 'Work faster without leaving the keyboard.')}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span>{r.label}</span>
              <Keys>{r.keys}</Keys>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
