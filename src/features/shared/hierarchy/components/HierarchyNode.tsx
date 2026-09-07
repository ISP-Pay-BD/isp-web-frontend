'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Building2, Shield, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HierarchyFlowNodeData } from '../lib/layout';
import type { HierarchyRole } from '../types';

const roleMeta: Record<
  HierarchyRole,
  { label: string; icon: typeof Shield; tint: string; ring: string }
> = {
  super_admin: {
    label: 'Super Admin',
    icon: Shield,
    tint: 'bg-[#1a0b38] text-white',
    ring: 'border-[#1a0b38]/40',
  },
  admin: {
    label: 'Admin',
    icon: Building2,
    tint: 'bg-primary/15 text-primary',
    ring: 'border-primary/30',
  },
  reseller: {
    label: 'Reseller',
    icon: Store,
    tint: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    ring: 'border-sky-500/30',
  },
  customer: {
    label: 'Customer',
    icon: User,
    tint: 'bg-muted text-muted-foreground',
    ring: 'border-border/60',
  },
};

function HierarchyNodeCard({ data }: NodeProps<Node<HierarchyFlowNodeData>>) {
  const meta = roleMeta[data.role];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'w-[220px] rounded-xl border bg-card px-3 py-2.5 shadow-sm',
        meta.ring,
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-muted-foreground/40" />
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            meta.tint,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {meta.label}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{data.label}</p>
          {data.meta ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{data.meta}</p>
          ) : null}
          {data.descendantCount > 0 ? (
            <p className="mt-1 font-mono text-[11px] text-foreground/80">
              {data.descendantCount.toLocaleString('en-BD')} below
            </p>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-muted-foreground/40" />
    </div>
  );
}

export const HierarchyNodeComponent = memo(HierarchyNodeCard);
