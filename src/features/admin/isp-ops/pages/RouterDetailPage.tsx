'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';

export function RouterDetailPage() {
  const params = useParams<{ id: string }>();
  const nav = useRouter();
  const { data, isLoading, isError, refetch } = useIspOps();

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load router" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const router = data.routerDetails.find((r) => r.id === params.id) ?? data.routerDetails[0];
  if (!router) {
    return (
      <EmptyState
        title="Router not found"
        description="This router may have been removed from the inventory."
        actionLabel="Back to routers"
        onAction={() => nav.push('/admin/routers')}
      />
    );
  }

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

      <OpsSummaryStrip
        items={[
          { label: 'CPU', value: `${router.cpuPct}%` },
          { label: 'RAM', value: `${router.ramPct}%` },
          { label: 'Uptime', value: router.uptime },
          { label: 'online users', value: router.onlineUsers },
        ]}
      />

      <Card className="rounded-xl border-border/60">
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
