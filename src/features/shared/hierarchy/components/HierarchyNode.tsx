'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Building2, ChevronDown, ChevronRight, Shield, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HierarchyFlowNodeData } from '../lib/layout';
import type { HierarchyRole } from '../types';

const roleMeta: Record<
  HierarchyRole,
  { label: string; icon: typeof Shield; tint: string; ring: string; bar: string }
> = {
  super_admin: {
    label: 'Super Admin',
    icon: Shield,
    tint: 'bg-foreground/90 text-background dark:bg-foreground/20 dark:text-foreground',
    ring: 'border-foreground/25 dark:border-foreground/35',
    bar: 'bg-foreground dark:bg-foreground/80',
  },
  admin: {
    label: 'Admin',
    icon: Building2,
    tint: 'bg-primary/15 text-primary',
    ring: 'border-primary/40 dark:border-primary/60',
    bar: 'bg-primary',
  },
  reseller: {
    label: 'Reseller',
    icon: Store,
    tint: 'bg-muted text-foreground dark:bg-muted/80 dark:text-foreground',
    ring: 'border-border/80',
    bar: 'bg-muted-foreground/60',
  },
  customer: {
    label: 'Customer',
    icon: User,
    tint: 'bg-muted text-muted-foreground',
    ring: 'border-border/70',
    bar: 'bg-muted-foreground/40',
  },
};

function HierarchyNodeCard({ data }: NodeProps<Node<HierarchyFlowNodeData>>) {
  const meta = roleMeta[data.role];
  const Icon = meta.icon;
  const isLR = data.layout === 'LR';

  return (
    <div
      className={cn(
        'relative w-[240px] overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-xs)] transition-[box-shadow,transform] duration-200',
        meta.ring,
        data.selected && 'shadow-[var(--shadow-md)] ring-2 ring-primary/50',
        data.matched === false && 'opacity-35',
        data.matched === true && 'ring-1 ring-primary/40',
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', meta.bar)} aria-hidden />

      <Handle
        type="target"
        position={isLR ? Position.Left : Position.Top}
        className="!border-background !bg-muted-foreground/70 !h-2.5 !w-2.5 !border-2"
      />

      <div className="flex items-start gap-2.5 px-3 py-2.5 pl-3.5">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            meta.tint,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-muted-foreground text-[10px] font-medium tracking-wide">
              {meta.label}
            </p>
            {data.expandable ? (
              <span className="text-muted-foreground dark:text-zinc-400" aria-hidden>
                {data.expanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            ) : null}
          </div>
          <p className="text-foreground truncate text-sm font-semibold">{data.label}</p>
          {data.meta ? (
            <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{data.meta}</p>
          ) : null}
          <div className="text-foreground/80 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px]">
            {data.childCount > 0 ? <span>{data.childCount} child</span> : null}
            {data.descendantCount > 0 ? (
              <span>{data.descendantCount.toLocaleString('en-BD')} below</span>
            ) : null}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={isLR ? Position.Right : Position.Bottom}
        className="!border-background !bg-muted-foreground/70 !h-2.5 !w-2.5 !border-2"
      />
    </div>
  );
}

export const HierarchyNodeComponent = memo(HierarchyNodeCard);
