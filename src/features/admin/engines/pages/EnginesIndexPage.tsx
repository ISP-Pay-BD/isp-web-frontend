'use client';

import Link from 'next/link';
import {
  Workflow,
  Cable,
  Siren,
  UserRoundCog,
  HardHat,
  BookOpen,
  Handshake,
  Code2,
  ShieldCheck,
  DatabaseBackup,
  Bot,
  HeartHandshake,
  Boxes,
  Store,
  Radar,
  Network,
  Receipt,
  BarChart3,
  Building2,
  LineChart,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useEngines } from '../hooks/use-engines';

const ICONS: Record<string, LucideIcon> = {
  Workflow,
  Cable,
  Siren,
  UserRoundCog,
  HardHat,
  BookOpen,
  Handshake,
  Code2,
  ShieldCheck,
  DatabaseBackup,
  Bot,
  HeartHandshake,
  Boxes,
  Store,
  Radar,
  Network,
  Receipt,
  BarChart3,
  Building2,
  LineChart,
};

type Props = { portal?: 'admin' | 'platform' };

export function EnginesIndexPage({ portal = 'admin' }: Props) {
  const { data, isLoading, isError, refetch } = useEngines(portal);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load engines" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const groups = data.groups.filter((g) => g.portal === portal);
  const featureCount = groups.reduce((s, g) => s + g.features.length, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="ISP Engines"
        subtitle="Configure automation, provisioning, NOC, and billing engines"
        breadcrumb={[
          { label: 'Dashboard', url: portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard' },
          { label: 'Engines' },
        ]}
      />

      {/* Summary strip — customers-list pattern, not KPI tiles */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold tabular-nums text-foreground">{groups.length}</span> hubs
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-semibold tabular-nums text-foreground">{featureCount}</span> features
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-semibold tabular-nums text-foreground">{data.summary.records}</span> mock records
        </span>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No engines for this portal"
          description="Engine packs for this portal will appear when enabled."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[11px] tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Engine</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Priority</th>
                <th className="px-4 py-2.5 font-medium tabular-nums">Features</th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const Icon = ICONS[g.icon] ?? Workflow;
                return (
                  <tr key={g.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <Link
                        href={g.href}
                        className="group flex items-start gap-3 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Icon
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
                          aria-hidden
                        />
                        <span>
                          <span className="block font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                            {g.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                            {g.subtitle}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {g.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{g.features.length}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={g.href}
                        className="inline-flex text-muted-foreground transition-transform duration-200 ease-out hover:translate-x-0.5 hover:text-foreground"
                        aria-label={`Open ${g.title}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
