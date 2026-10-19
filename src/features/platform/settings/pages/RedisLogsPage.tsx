'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

const LEVEL_STYLES: Record<string, string> = {
  info: 'border-blue-500/30 text-blue-600 bg-blue-500/10',
  warning: 'border-amber-500/30 text-amber-600 bg-amber-500/10',
  error: 'border-red-500/30 text-red-600 bg-red-500/10',
  debug: 'border-slate-500/30 text-slate-600 bg-slate-500/10',
};

export function RedisLogsPage() {
  const t = useTranslations();
  const [level, setLevel] = useState('all');
  const levelLabel = (l: string) => t(`platform.settings.redis.level.${l}`, l);
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'redis-logs', level],
    queryFn: () => platformService.getPlatformLogs(level),
  });

  if (isLoading) return <PageSkeleton variant="table" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState variant="error"
        title={t('platform.settings.redis.loadFailed', 'Failed to load logs')}
        description={error instanceof Error ? error.message : t('platform.settings.redis.loadFailedHint', 'Could not retrieve Redis and system logs.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const filteredLogs = data.logs.filter(
    (l) =>
      !search ||
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.channel.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.settings.redis.title', 'Redis & System Logs')}
        subtitle={t('platform.settings.redis.subtitle', 'Redis cache telemetry (zeros when the cache is not Redis) and the latest application log entries')}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.settings', 'Settings'), href: '/platform/settings' },
          { label: t('nav.platform-redis', 'Redis & Logs') },
        ]}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-primary">{`${data.stats.redisMemoryMb} MB`}</span>{' '}
          <span className="text-muted-foreground">{t('platform.settings.redis.kpiMemory', 'redis memory')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatCount(data.stats.redisKeysTotal)}</span>{' '}
          <span className="text-muted-foreground">{t('platform.settings.redis.kpiKeys', 'active keys')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{t('platform.settings.redis.days', '{n} days', { n: formatCount(data.stats.uptimeDays) })}</span>{' '}
          <span className="text-muted-foreground">{t('platform.settings.redis.kpiUptime', 'redis uptime')}</span>
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {['all', 'info', 'warning', 'error', 'debug'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    level === l ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {levelLabel(l)}
                </button>
              ))}
            </div>

            <div className="max-w-xs w-full">
              <input
                type="text"
                placeholder={t('platform.settings.redis.filterPlaceholder', 'Filter logs by keyword...')}
                aria-label={t('platform.settings.redis.filterLabel', 'Filter logs by keyword')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs max-h-[520px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t('platform.settings.redis.empty', 'No logs found matching your filter criteria.')}</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 rounded-md hover:bg-muted/40 border border-border/30 bg-muted/10 transition-colors">
                  <span className="text-muted-foreground text-xs shrink-0 w-36">{log.timestamp}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className={`text-xs capitalize shrink-0 font-mono ${LEVEL_STYLES[log.level]}`}>
                      {levelLabel(log.level)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs shrink-0 font-mono">
                      {log.channel}
                    </Badge>
                  </div>
                  <span className="flex-1 text-foreground text-xs">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
