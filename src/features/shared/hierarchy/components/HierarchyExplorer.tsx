'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Search,
  Table2,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Phone,
  Package,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HierarchyRole, HierarchyScope, HierarchyNode } from '../types';
import { findNodeById } from '../lib/layout';
import { useHierarchyTree, useResellerSubscribers } from '../hooks/use-hierarchy';
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
  { role: 'Super Admin', color: 'bg-foreground' },
  { role: 'Admin', color: 'bg-primary' },
  { role: 'Reseller', color: 'bg-muted-foreground' },
  { role: 'Customer', color: 'bg-border' },
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
        <span>Reseller (POP)</span>
        <span aria-hidden>→</span>
        <span>Subscribers</span>
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
          <dt className="text-[11px] text-muted-foreground">Total Subscribers</dt>
          <dd className="mt-1 font-mono text-xl font-semibold">{summary.customers.toLocaleString('en-BD')}</dd>
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
                placeholder="Search POP reseller or admin…"
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
            Click any node to view real-time live subscribers and statistics
          </span>
        </div>

        <TabsContent value="graph" className="space-y-3">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className={selected ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <HierarchyGraph
                root={root}
                query={query}
                selectedId={selectedId}
                onSelect={setSelectedId}
                layout={layout}
              />
            </div>
            {selected ? (
              <aside className="space-y-4 rounded-xl border border-border/60 bg-card p-4 lg:col-span-5">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selected.role === 'reseller' ? 'default' : 'secondary'} className="text-[10px]">
                        {roleLabel[selected.role]}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                        <span className={`h-1.5 w-1.5 rounded-full ${selected.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {selected.status ?? 'active'}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-foreground">{selected.label}</h3>
                    {selected.meta ? (
                      <p className="mt-0.5 text-xs text-muted-foreground font-mono">{selected.meta}</p>
                    ) : null}
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

                {selected.role === 'reseller' ? (
                  <ResellerSubscribersPanel node={selected} />
                ) : (
                  <div className="space-y-4">
                    <dl className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                        <dt className="text-[11px] text-muted-foreground">Direct Sub-Nodes</dt>
                        <dd className="mt-1 font-mono text-lg font-semibold">{selected.childCount}</dd>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                        <dt className="text-[11px] text-muted-foreground">Total In Network</dt>
                        <dd className="mt-1 font-mono text-lg font-semibold">{selected.descendantCount}</dd>
                      </div>
                    </dl>
                    <p className="text-xs text-muted-foreground">
                      Select a specific POP Reseller node in the graph to view live subscribers, package distributions, and customer details.
                    </p>
                  </div>
                )}
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

/**
 * On-Demand Lazy-Loaded Reseller Subscribers Panel
 */
function ResellerSubscribersPanel({ node }: { node: HierarchyNode }) {
  const resellerId = node.id.replace('reseller_', '');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading, isFetching } = useResellerSubscribers(resellerId, {
    page,
    limit: 6,
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  return (
    <div className="space-y-3.5">
      {/* Quick KPI stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border/50 bg-background/40 p-2">
          <p className="text-[10px] text-muted-foreground">Total Subscribers</p>
          <p className="mt-0.5 font-mono text-base font-bold text-foreground">
            {data?.stats?.total ?? node.descendantCount}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/40 p-2">
          <p className="text-[10px] text-emerald-500 font-medium">Active</p>
          <p className="mt-0.5 font-mono text-base font-bold text-emerald-500">
            {data?.stats?.active ?? '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/40 p-2">
          <p className="text-[10px] text-muted-foreground">Inactive</p>
          <p className="mt-0.5 font-mono text-base font-bold text-muted-foreground">
            {data?.stats?.inactive ?? '—'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search subscribers by name, phone…"
            className="h-7 pl-7 text-[11px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
            setPage(1);
          }}
          className="h-7 rounded-md border border-border/60 bg-background px-2 text-[11px] text-foreground focus:outline-none"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Subscribers list */}
      <div className="space-y-1.5 min-h-[180px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-xs text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
            <span>Loading subscribers…</span>
          </div>
        ) : data?.items?.length ? (
          data.items.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 text-xs transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      sub.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                    }`}
                  />
                  <span className="truncate font-medium text-foreground text-[12px]">{sub.name}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="truncate flex items-center gap-1">
                    <Package className="h-2.5 w-2.5" />
                    {sub.packageName}
                  </span>
                  {sub.mobile ? (
                    <span className="font-mono">{sub.mobile}</span>
                  ) : null}
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge
                  variant={sub.status === 'active' ? 'outline' : 'secondary'}
                  className="text-[9px] px-1.5 py-0"
                >
                  {sub.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            No subscribers found for this reseller.
          </div>
        )}
      </div>

      {/* Pagination & Full View CTA */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>
            Page {data?.pagination?.page ?? 1} of {data?.pagination?.totalPages ?? 1}
          </span>
          {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-6 w-6 p-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= (data?.pagination?.totalPages ?? 1) || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="h-6 w-6 p-0"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Link
            href={`/admin/customers?resellerId=${resellerId}`}
            className="inline-flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 ml-1"
          >
            <span>View All</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
