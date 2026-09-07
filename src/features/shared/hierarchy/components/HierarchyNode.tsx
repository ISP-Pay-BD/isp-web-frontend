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
    tint: 'bg-[#1a0b38] text-white dark:bg-violet-500/25 dark:text-violet-200',
    ring: 'border-[#1a0b38]/50 dark:border-violet-400/50',
    bar: 'bg-[#1a0b38] dark:bg-violet-400',
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
    tint: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    ring: 'border-sky-500/40 dark:border-sky-400/50',
    bar: 'bg-sky-500 dark:bg-sky-400',
  },
  customer: {
    label: 'Customer',
    icon: User,
    tint: 'bg-muted text-muted-foreground dark:bg-slate-500/20 dark:text-slate-200',
    ring: 'border-border/70 dark:border-slate-400/35',
    bar: 'bg-muted-foreground/50 dark:bg-slate-400',
  },
};

function HierarchyNodeCard({ data }: NodeProps<Node<HierarchyFlowNodeData>>) {
  const meta = roleMeta[data.role];
  const Icon = meta.icon;
  const isLR = data.layout === 'LR';

  return (
    <div
      className={cn(
        'relative w-[240px] overflow-hidden rounded-xl border shadow-sm transition-shadow',
        'bg-card dark:bg-zinc-900/95 dark:shadow-black/40',
        meta.ring,
        data.selected && 'ring-2 ring-primary/55 shadow-md dark:ring-primary/70',
        data.matched === false && 'opacity-35',
        data.matched === true && 'ring-1 ring-primary/45',
      )}
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', meta.bar)} aria-hidden />

      <Handle
        type="target"
        position={isLR ? Position.Left : Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-muted-foreground/70 dark:!bg-slate-300"
      />

      <div className="flex items-start gap-2.5 px-3 py-2.5 pl-3.5">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            meta.tint,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground dark:text-zinc-400">
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
          <p className="truncate text-sm font-semibold text-foreground dark:text-zinc-50">
            {data.label}
          </p>
          {data.meta ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground dark:text-zinc-400">
              {data.meta}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-foreground/80 dark:text-zinc-300">
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
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-muted-foreground/70 dark:!bg-slate-300"
      />
    </div>
  );
}

export const HierarchyNodeComponent = memo(HierarchyNodeCard);
