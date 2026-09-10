'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Reorder, motion } from 'framer-motion';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { 
  GripVertical, 
  Pin, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  Check, 
  BookmarkCheck, 
  RotateCw,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2
} from 'lucide-react';
import type { SidebarPin } from '@/data/admin/extras.data';

const PRESET_SUGGESTIONS = [
  { label: 'Active Subscribers', href: '/admin/subscribers?status=active' },
  { label: 'Billing Invoices', href: '/admin/billing/invoices' },
  { label: 'MikroTik Routers', href: '/admin/routers' },
  { label: 'Open Support Tickets', href: '/admin/support/tickets' },
  { label: 'Staff Journal Entries', href: '/admin/accounting/journal-entries' },
  { label: 'IP / NAT Compliance', href: '/admin/compliance/ip-logs' },
];

export function SidebarPinsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'sidebarPins'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'sidebarPins');
      return res as { items: SidebarPin[] };
    },
  });
  
  const [pins, setPins] = useState<SidebarPin[] | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customHref, setCustomHref] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const list = pins ?? data?.items ?? [];

  const handleReorder = (newList: SidebarPin[]) => {
    const reordered = newList.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setPins(reordered);
    setIsSaved(false);
  };

  const handleSaveOrder = () => {
    setIsSaved(true);
    toast.success('Sidebar pin ordering saved successfully!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const newList = [...list];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    const reordered = newList.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setPins(reordered);
    setIsSaved(false);
    toast.info(`Moved "${moved.label}" ${direction}`);
  };

  const handleAddPin = (label: string, href: string) => {
    if (!label.trim() || !href.trim()) {
      toast.error('Please provide both label and URL path');
      return;
    }
    const newPin: SidebarPin = {
      id: `pin_${Date.now()}`,
      label: label.trim(),
      href: href.trim(),
      icon: 'Pin',
      order: list.length + 1,
    };
    setPins([...list, newPin]);
    setCustomLabel('');
    setCustomHref('');
    setIsAdding(false);
    setIsSaved(false);
    toast.success(`Pinned "${label}" to sidebar`);
  };

  const handleRemovePin = (id: string, label: string) => {
    const remaining = list.filter((p) => p.id !== id).map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setPins(remaining);
    setIsSaved(false);
    toast.success(`Unpinned "${label}"`);
  };

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load pins" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sidebar Pinned Shortcuts"
        subtitle="Hold & drag items to reorder quick-access navigation shortcuts displayed at the top of your sidebar"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Sidebar Pins' }]}
        actions={
          <div className="flex items-center gap-2">
            {!isSaved && (
              <Button 
                onClick={handleSaveOrder}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm animate-pulse"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save New Order
              </Button>
            )}
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-sm shadow-primary/20"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Shortcut
            </Button>
          </div>
        }
      />

      {/* Quick Add Custom Pin Card */}
      {isAdding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Create Custom Shortcut</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Shortcut Name</label>
              <Input
                placeholder="e.g. VIP Corporate Clients"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="bg-background/80 border-border/70 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Path / URL</label>
              <Input
                placeholder="e.g. /admin/subscribers?type=corporate"
                value={customHref}
                onChange={(e) => setCustomHref(e.target.value)}
                className="bg-background/80 border-border/70 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={() => handleAddPin(customLabel, customHref)} className="text-xs bg-primary hover:bg-primary/90">
              Save Shortcut
            </Button>
          </div>
        </div>
      )}

      {/* Suggested Quick Pins */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Recommended Quick-Add Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_SUGGESTIONS.map((preset) => {
            const isAlreadyPinned = list.some((p) => p.href === preset.href);
            return (
              <Button
                key={preset.href}
                size="sm"
                variant="outline"
                disabled={isAlreadyPinned}
                onClick={() => handleAddPin(preset.label, preset.href)}
                className={`text-xs h-7 border-border/70 ${
                  isAlreadyPinned 
                    ? 'opacity-50 cursor-not-allowed bg-muted/20' 
                    : 'hover:border-primary/50 hover:bg-primary/5 text-foreground'
                }`}
              >
                {isAlreadyPinned ? (
                  <Check className="mr-1.5 h-3 w-3 text-emerald-400" />
                ) : (
                  <Plus className="mr-1.5 h-3 w-3 text-primary" />
                )}
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Pinned Items Reorderable List */}
      <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Current Pinned Navigation ({list.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            {!isSaved && (
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                Unsaved order changes
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 text-primary" />
              Hold & Drag to reorder
            </span>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
            <Compass className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p>No shortcuts pinned yet.</p>
            <p className="text-xs">Add common routes from suggestions above for rapid 1-click access.</p>
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={list} 
            onReorder={handleReorder}
            className="divide-y divide-border/40"
          >
            {list.map((pin, idx) => (
              <Reorder.Item
                key={pin.id}
                value={pin}
                whileDrag={{
                  scale: 1.015,
                  boxShadow: "0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
                  backgroundColor: "rgba(247, 88, 3, 0.12)",
                  borderColor: "rgba(247, 88, 3, 0.5)",
                  zIndex: 50,
                  cursor: "grabbing"
                }}
                className="flex items-center gap-3 px-4 py-3.5 bg-card/40 hover:bg-muted/30 transition-colors select-none group cursor-grab active:cursor-grabbing border-b border-border/30 last:border-0 relative touch-none"
              >
                {/* Drag Handle Indicator */}
                <div 
                  className="p-1.5 rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center shrink-0"
                  title="Click and hold to drag"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Index Pill */}
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {idx + 1}
                </div>

                {/* Pin Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                    {pin.label}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground truncate flex items-center gap-1">
                    <ExternalLink className="h-3 w-3 inline text-muted-foreground/70" />
                    {pin.href}
                  </p>
                </div>

                {/* Move Controls & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'up');
                    }}
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={idx === list.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'down');
                    }}
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
                    aria-label={`Remove ${pin.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePin(pin.id, pin.label);
                    }}
                    title="Remove pin"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {!isSaved && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs text-foreground font-medium">You have reordered pins. Click save to persist this arrangement.</span>
          </div>
          <Button size="sm" onClick={handleSaveOrder} className="text-xs bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
