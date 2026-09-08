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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load engines" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const groups = data.groups.filter((g) => g.portal === portal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ISP Engines"
        subtitle="Automation, provisioning, NOC, billing, AI — full static mock suite"
        breadcrumb={[
          { label: 'Dashboard', url: portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard' },
          { label: 'Engines' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Groups" value={groups.length} description="Hubs in this portal" icon={Workflow} />
        <StatCard title="Features" value={data.summary.features} description="Named capabilities" icon={BarChart3} />
        <StatCard title="Records" value={data.summary.records} description="Dummy rows" icon={Boxes} />
        <StatCard title="Logs" value={data.summary.logs} description="Execution samples" icon={Radar} />
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No engines for this portal" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const Icon = ICONS[g.icon] ?? Workflow;
            return (
              <Link
                key={g.id}
                href={g.href}
                className="group block rounded-lg outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full border-border/60 transition-colors duration-200 ease-out group-hover:border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <CardTitle className="text-base">{g.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {g.priority}
                      </Badge>
                    </div>
                    <CardDescription>{g.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {g.features.length} features · open hub →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
