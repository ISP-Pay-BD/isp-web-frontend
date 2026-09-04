'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Activity } from 'lucide-react';

const LEVEL_STYLES: Record<string, string> = {
  info: 'border-blue-500/30 text-blue-600 bg-blue-500/10',
  warning: 'border-amber-500/30 text-amber-600 bg-amber-500/10',
  error: 'border-red-500/30 text-red-600 bg-red-500/10',
  debug: 'border-slate-500/30 text-slate-600 bg-slate-500/10',
};

export function RedisLogsPage() {
  const [level, setLevel] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'redis-logs', level],
    queryFn: () => mockFetch('platform.redis-logs', level === 'all' ? undefined : level),
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load logs"
        description="Could not retrieve Redis and system logs."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Redis & System Logs"
        subtitle="Cache telemetry, session stats, and platform event inspector"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Redis Memory" value={`${data.stats.redisMemoryMb} MB`} icon={Database} />
        <StatCard title="Active Keys" value={data.stats.redisKeysTotal.toLocaleString()} icon={Server} />
        <StatCard title="Uptime" value={`${data.stats.uptimeDays} days`} icon={Activity} />
        <StatCard title="Active Sessions" value={data.stats.activeSessions} icon={Activity} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            {['all', 'info', 'warning', 'error', 'debug'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`px-3 py-1 rounded-md text-xs capitalize transition-colors ${
                  level === l ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto">
            {data.logs.map((log) => (
              <div key={log.id} className="flex gap-3 p-2 rounded-md hover:bg-muted/40 border border-border/30">
                <span className="text-muted-foreground shrink-0 w-36">{log.timestamp}</span>
                <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${LEVEL_STYLES[log.level]}`}>
                  {log.level}
                </Badge>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {log.channel}
                </Badge>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
