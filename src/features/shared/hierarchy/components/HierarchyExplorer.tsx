'use client';

import { Network, Table2 } from 'lucide-react';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HierarchyScope } from '../types';
import { useHierarchyTree } from '../hooks/use-hierarchy';
import { HierarchyGraph } from './HierarchyGraph';
import { HierarchyTable } from './HierarchyTable';

interface HierarchyExplorerProps {
  scope: HierarchyScope;
  resellerId?: string;
  breadcrumb: { label: string; url?: string }[];
}

export function HierarchyExplorer({ scope, resellerId, breadcrumb }: HierarchyExplorerProps) {
  const { data, isLoading, isError, refetch } = useHierarchyTree(scope, resellerId);

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
        <TabsContent value="graph" className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Scroll to zoom · drag canvas to pan · use controls for fit view
          </p>
          <HierarchyGraph root={root} />
        </TabsContent>
        <TabsContent value="table">
          <HierarchyTable root={root} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
