'use client';

import { useMemo, useState } from 'react';
import { Network, Search, Table2, X } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HierarchyRole, HierarchyScope } from '../types';
import { findNodeById } from '../lib/layout';
import { useHierarchyTree } from '../hooks/use-hierarchy';
import { HierarchyGraph, HierarchyLayoutToggle } from './HierarchyGraph';
import { HierarchyTable } from './HierarchyTable';

interface HierarchyExplorerProps {
  scope: HierarchyScope;
  resellerId?: string;
  breadcrumb: { label: string; url?: string }[];
}

const roleLabel: Record<HierarchyRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  reseller: 'Reseller',
  customer: 'Customer',
};

const legend = [
  { role: 'Super Admin', color: 'bg-[#1a0b38]' },
  { role: 'Admin', color: 'bg-primary' },
  { role: 'Reseller', color: 'bg-sky-500' },
  { role: 'Customer', color: 'bg-slate-400' },
] as const;

export function HierarchyExplorer({ scope, resellerId, breadcrumb }: HierarchyExplorerProps) {
  const { data, isLoading, isError, refetch } = useHierarchyTree(scope, resellerId);
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState<'TB' | 'LR'>('TB');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!data || !selectedId) return null;
    return findNodeById(data.root, selectedId);
  }, [data, selectedId]);

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Could not load hierarchy"
        description="Retry to load the organization graph."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { summary, root, title, subtitle } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <PageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Chain</span>
        <span>Super Admin</span>
        <span aria-hidden>→</span>
        <span>Admin</span>
        <span aria-hidden>→</span>
        <span>Reseller</span>
        <span aria-hidden>→</span>
        <span>Customer</span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scope === 'platform' ? (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <dt className="text-[11px] text-muted-foreground">Super Admin</dt>
            <dd className="mt-1 font-mono text-xl font-semibold">{summary.superAdmins}</dd>
          </div>
        ) : null}
        {(scope === 'platform' || scope === 'admin') && (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <dt className="text-[11px] text-muted-foreground">Admins / tenants</dt>
            <dd className="mt-1 font-mono text-xl font-semibold">{summary.admins}</dd>
          </div>
        )}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <dt className="text-[11px] text-muted-foreground">Resellers (POP)</dt>
          <dd className="mt-1 font-mono text-xl font-semibold">{summary.resellers}</dd>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <dt className="text-[11px] text-muted-foreground">Customers</dt>
          <dd className="mt-1 font-mono text-xl font-semibold">{summary.customers}</dd>
        </div>
      </dl>

      <Tabs defaultValue="graph" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="graph" className="gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5">
              <Table2 className="h-3.5 w-3.5" />
              Table
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, role, area…"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <HierarchyLayoutToggle layout={layout} onChange={setLayout} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {legend.map((item) => (
            <span key={item.role} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${item.color}`} aria-hidden />
              {item.role}
            </span>
          ))}
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Click node to select + expand/collapse · scroll zoom · drag to pan
          </span>
        </div>

        <TabsContent value="graph" className="space-y-3">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className={selected ? 'lg:col-span-8' : 'lg:col-span-12'}>
              <HierarchyGraph
                root={root}
                query={query}
                selectedId={selectedId}
                onSelect={setSelectedId}
                layout={layout}
              />
            </div>
            {selected ? (
              <aside className="space-y-3 rounded-xl border border-border/60 bg-card p-4 lg:col-span-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Selected
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-foreground">{selected.label}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Badge variant="secondary">{roleLabel[selected.role]}</Badge>
                {selected.meta ? (
                  <p className="text-sm text-muted-foreground">{selected.meta}</p>
                ) : null}
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Children</dt>
                    <dd className="font-mono font-semibold">{selected.childCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Below</dt>
                    <dd className="font-mono font-semibold">{selected.descendantCount}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] text-muted-foreground">Status</dt>
                    <dd className="capitalize">{selected.status ?? '—'}</dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <HierarchyTable root={root} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
