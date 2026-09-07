'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HierarchyNode, HierarchyRole } from '../types';

const roleBadge: Record<HierarchyRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  reseller: 'Reseller',
  customer: 'Customer',
};

function Row({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: HierarchyNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/40">
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 16 }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="inline-block w-6" />
            )}
            <span className="text-sm font-medium text-foreground">{node.label}</span>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <Badge variant="secondary" className="text-[10px]">
            {roleBadge[node.role]}
          </Badge>
        </td>
        <td className="px-3 py-2.5 text-xs text-muted-foreground">{node.meta ?? '—'}</td>
        <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">
          {node.childCount}
        </td>
        <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">
          {node.descendantCount}
        </td>
        <td className="px-3 py-2.5">
          <span
            className={cn(
              'text-xs capitalize',
              node.status === 'active' && 'text-emerald-600 dark:text-emerald-400',
              node.status === 'expired' && 'text-rose-600 dark:text-rose-400',
            )}
          >
            {node.status ?? '—'}
          </span>
        </td>
      </tr>
      {hasChildren && isOpen
        ? node.children.map((child) => (
            <Row
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))
        : null}
    </>
  );
}

function collectExpandableIds(node: HierarchyNode, acc: string[] = []): string[] {
  if (node.children.length > 0) {
    acc.push(node.id);
    node.children.forEach((c) => collectExpandableIds(c, acc));
  }
  return acc;
}

export function HierarchyTable({ root }: { root: HierarchyNode }) {
  const defaultExpanded = useMemo(() => {
    // Expand first two levels by default
    const ids = [root.id, ...root.children.map((c) => c.id)];
    return new Set(ids);
  }, [root]);

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(collectExpandableIds(root)));
  const collapseAll = () => setExpanded(new Set([root.id]));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Expand all
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          type="button"
          onClick={collapseAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Collapse
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Detail</th>
              <th className="px-3 py-2.5 text-right font-medium">Children</th>
              <th className="px-3 py-2.5 text-right font-medium">Below</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <Row node={root} depth={0} expanded={expanded} onToggle={onToggle} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
