'use client';

import { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { GripVertical, Pin, Trash2, Plus, ExternalLink, Sparkles, Compass, BookmarkCheck, ArrowUp, ArrowDown, Save, CheckCircle2 } from 'lucide-react';
import { useFilteredNav } from '@/hooks/use-filtered-nav';
import type { NavItem } from '@/config/navigation';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { useSaveSidebarPins, useSidebarPins, type SidebarPin, type SidebarPinInput } from '../hooks/use-sidebar-pins';

const MAX_PINS = 12;

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((i) => [...(i.href ? [i] : []), ...(i.children ? flatten(i.children) : [])]);
}

export function SidebarPinsPage() {
  const t = useTranslations();
  const { data, isLoading, isError, error, refetch } = useSidebarPins();

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState variant="error" title={t('admin.sidebarPins.loadFailed', 'Failed to load pins')} description={errorMessage(error)} actionLabel={t('common.retry', 'Retry')} onAction={() => refetch()} />;
  }
  return <PinsEditor saved={data} />;
}

function PinsEditor({ saved }: { saved: SidebarPin[] }) {
  const t = useTranslations();
  const save = useSaveSidebarPins();
  const nav = useFilteredNav();
  const destinations = useMemo(() => flatten(nav).filter((n) => n.href && !n.href.includes('[')), [nav]);
  const navIdByHref = useMemo(() => new Map(destinations.map((d) => [d.href as string, d.id])), [destinations]);
  const pinLabel = (pin: SidebarPin) => {
    const navId = navIdByHref.get(pin.href);
    return navId ? t(`nav.${navId}`, pin.label) : pin.label;
  };

  // Local order only for drag/move; add/remove are saved immediately.
  const [order, setOrder] = useState<SidebarPin[] | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customHref, setCustomHref] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const list = order ?? saved;
  const unsavedOrder = order !== null && order.map((p) => p.id).join() !== saved.map((p) => p.id).join();
  const suggestions = destinations.filter((d) => !saved.some((p) => p.href === d.href)).slice(0, 8);

  const persist = (pins: SidebarPinInput[], message: string) => {
    save.mutate(pins, {
      onSuccess: () => {
        setOrder(null);
        toast.success(message);
      },
    });
  };

  const asInput = (p: SidebarPin): SidebarPinInput => ({ pinKey: p.pinKey, label: p.label, href: p.href, icon: p.icon });

  const handleAdd = (pin: SidebarPinInput) => {
    if (!pin.label.trim() || !pin.href.trim()) {
      toast.error(t('admin.sidebarPins.errNamePath', 'Enter a name and an in-app path'));
      return;
    }
    if (!pin.href.startsWith('/') || pin.href.startsWith('//')) {
      toast.error(t('admin.sidebarPins.errPath', 'Use an in-app path that starts with /'));
      return;
    }
    if (saved.length >= MAX_PINS) {
      toast.error(t('admin.sidebarPins.errMax', 'You can pin up to {max} shortcuts', { max: MAX_PINS }));
      return;
    }
    persist([...saved.map(asInput), { ...pin, label: pin.label.trim(), href: pin.href.trim() }], t('admin.sidebarPins.pinned', 'Pinned “{label}”', { label: pin.label.trim() }));
    setCustomLabel('');
    setCustomHref('');
    setIsAdding(false);
  };

  const handleRemove = (pin: SidebarPin) => {
    persist(
      list.filter((p) => p.id !== pin.id).map(asInput),
      t('admin.sidebarPins.unpinned', 'Unpinned “{label}”', { label: pinLabel(pin) }),
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setOrder(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.sidebarPins.title', 'Sidebar Pinned Shortcuts')}
        subtitle={t('admin.sidebarPins.subtitle', 'Quick links shown at the top of your sidebar — drag to reorder')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.sidebar_pins', 'Sidebar Pins') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {unsavedOrder && (
              <Button
                onClick={() => persist(list.map(asInput), t('admin.sidebarPins.orderSaved', 'Pin order saved'))}
                disabled={save.isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {t('admin.sidebarPins.saveOrder', 'Save New Order')}
              </Button>
            )}
            <Button
              onClick={() => setIsAdding(!isAdding)}
              disabled={saved.length >= MAX_PINS}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.sidebarPins.add', 'Add Shortcut')}
            </Button>
          </div>
        }
      />

      {isAdding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t('admin.sidebarPins.custom', 'Custom shortcut')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t('admin.sidebarPins.fieldName', 'Name')}</label>
              <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} maxLength={150} className="bg-background/80 border-border/70 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t('admin.sidebarPins.fieldPath', 'In-app path')}</label>
              <Input
                placeholder="/admin/…"
                value={customHref}
                onChange={(e) => setCustomHref(e.target.value)}
                className="bg-background/80 border-border/70 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="text-xs">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button size="sm" disabled={save.isPending} onClick={() => handleAdd({ label: customLabel, href: customHref, icon: 'Pin' })} className="text-xs">
              {t('admin.sidebarPins.saveShortcut', 'Save Shortcut')}
            </Button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && saved.length < MAX_PINS && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {t('admin.sidebarPins.suggestions', 'Pages you can pin')}
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((d) => (
              <Button
                key={d.href}
                size="sm"
                variant="outline"
                disabled={save.isPending}
                onClick={() => handleAdd({ label: d.label, href: d.href as string, icon: d.icon, pinKey: d.id })}
                className="text-xs h-7 border-border/70 hover:border-primary/50 hover:bg-primary/5 text-foreground"
              >
                <Plus className="mr-1.5 h-3 w-3 text-primary" />
                {t(`nav.${d.id}`, d.label)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {t('admin.sidebarPins.pinnedCount', 'Pinned ({n} / {max})', { n: list.length, max: MAX_PINS })}
            </h3>
          </div>
          {unsavedOrder && <span className="text-xs text-amber-400 font-medium">{t('admin.sidebarPins.unsaved', 'Unsaved order')}</span>}
        </div>

        {list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
            <Compass className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p>{t('admin.sidebarPins.emptyTitle', 'No shortcuts pinned yet.')}</p>
            <p className="text-xs">{t('admin.sidebarPins.emptyHint', 'Pin pages you open often from the suggestions above.')}</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={list} onReorder={setOrder} className="divide-y divide-border/40">
            {list.map((pin, idx) => (
              <Reorder.Item
                key={pin.id}
                value={pin}
                className="flex items-center gap-3 px-4 py-3.5 bg-card/40 hover:bg-muted/30 transition-colors select-none group cursor-grab active:cursor-grabbing border-b border-border/30 last:border-0 relative touch-none"
              >
                <div className="p-1.5 rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center shrink-0">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground">{pinLabel(pin)}</p>
                  <p className="font-mono text-xs text-muted-foreground truncate flex items-center gap-1">
                    <ExternalLink className="h-3 w-3 inline text-muted-foreground/70" />
                    {pin.href}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => handleMove(idx, 'up')} aria-label={t('admin.sidebarPins.moveUp', 'Move up')}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === list.length - 1} onClick={() => handleMove(idx, 'down')} aria-label={t('admin.sidebarPins.moveDown', 'Move down')}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
                    aria-label={t('admin.sidebarPins.remove', 'Remove {label}', { label: pinLabel(pin) })}
                    disabled={save.isPending}
                    onClick={() => handleRemove(pin)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {unsavedOrder && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs text-foreground font-medium">{t('admin.sidebarPins.saveHint', 'Save to keep this order in your sidebar.')}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOrder(null)} className="text-xs">
              {t('admin.sidebarPins.discard', 'Discard')}
            </Button>
            <Button size="sm" disabled={save.isPending} onClick={() => persist(list.map(asInput), t('admin.sidebarPins.orderSaved', 'Pin order saved'))} className="text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {t('admin.sidebarPins.saveChanges', 'Save Changes')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
