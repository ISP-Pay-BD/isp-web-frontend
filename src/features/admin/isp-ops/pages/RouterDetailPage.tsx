'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Activity, Cpu, MemoryStick, Timer, Users } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';

export function RouterDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useIspOps();

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load router" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const router = data.routerDetails.find((r) => r.id === params.id) ?? data.routerDetails[0];
  if (!router) {
    return <EmptyState title="Router not found" />;
  }

  const kpis = [
    { label: 'CPU', value: `${router.cpuPct}%`, icon: Cpu },
    { label: 'RAM', value: `${router.ramPct}%`, icon: MemoryStick },
    { label: 'Uptime', value: router.uptime, icon: Timer },
    { label: 'Online users', value: String(router.onlineUsers), icon: Users },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={router.name}
        subtitle={`${router.ip} · RouterOS ${router.version}`}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Routers', url: '/admin/routers' },
          { label: router.name },
        ]}
        actions={
          <Link href={`/admin/routers/${router.id}/users`} className={cn(buttonVariants({ size: 'sm' }))}>
            <Activity className="mr-1.5 h-4 w-4" />
            Live PPPoE users
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border/60 shadow-sm ring-1 ring-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6 text-sm">
          <Badge variant="outline">Health OK</Badge>
          <span className="text-muted-foreground">
            Mock health snapshot — CPU/RAM under thresholds. Open live users to kick sessions.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
