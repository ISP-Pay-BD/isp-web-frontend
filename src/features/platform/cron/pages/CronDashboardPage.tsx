'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw, Unlock } from 'lucide-react';
import { formatCount } from '@/lib/format';
import { PlatformPageHeader, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/locale-context';
import { useCronActions, useCronStatus } from '../hooks/use-cron';
import { CronJobsTable } from '../components/CronJobsTable';
import { LoadErrorState } from '@/features/platform/shared/components/LoadErrorState';

export function CronDashboardPage() {
  const t = useTranslations();
  const { data, isLoading, error, refetch, isFetching } = useCronStatus();
  const { reset, run } = useCronActions();
  const [confirmReset, setConfirmReset] = useState(false);

  const header = (
    <PlatformPageHeader
      title={t('platform.cron.title', 'Cron Jobs')}
      subtitle={t(
        'platform.cron.subtitle',
        'Background workers: when each last ran, whether it is running or locked, and its last error',
      )}
      breadcrumb={[
        { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
        { label: t('platform.cron.crumb', 'Cron Jobs') },
      ]}
      actions={
        data ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('platform.cron.refresh', 'Refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmReset(true)}
              disabled={reset.isPending}
            >
              <Unlock className="mr-1.5 h-4 w-4" />
              {t('platform.cron.resetLocks', 'Reset locks')}
            </Button>
          </div>
        ) : null
      }
    />
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <LoadErrorState
          error={error}
          title={t('platform.cron.loadFailed', 'Failed to load cron status')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const running = data.jobs.filter((j) => j.running).length;
  const stuck = data.jobs.filter((j) => j.locked && !j.running).length;
  const failed = data.jobs.filter((j) => j.lastStatus === 'failed').length;

  return (
    <div className="space-y-6">
      {header}

      {!data.redisOk || !data.workersEnabled ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {!data.redisOk
              ? t(
                  'platform.cron.redisDown',
                  'Redis is unreachable — run state is unknown and jobs cannot be started from here.',
                )
              : t(
                  'platform.cron.workersOff',
                  'Background workers are turned off on this server; jobs only run when started here.',
                )}
          </p>
        </div>
      ) : null}

      <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{data.jobs.length}</span>{' '}
          <span className="text-muted-foreground">{t('platform.cron.kpi.jobs', 'jobs')}</span>
        </p>
        <p>
          <span className="font-semibold text-sky-600 tabular-nums dark:text-sky-400">
            {running}
          </span>{' '}
          <span className="text-muted-foreground">{t('platform.cron.kpi.running', 'running')}</span>
        </p>
        {stuck > 0 ? (
          <p>
            <span className="font-semibold text-amber-600 tabular-nums dark:text-amber-400">
              {stuck}
            </span>{' '}
            <span className="text-muted-foreground">
              {t('platform.cron.kpi.stuck', 'stuck locks')}
            </span>
          </p>
        ) : null}
        <p>
          <span className="font-semibold text-rose-600 tabular-nums dark:text-rose-400">
            {failed}
          </span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cron.kpi.failed', 'failed last run')}
          </span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatCount(data.activeExpired)}</span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cron.kpi.activeExpired', 'expired but still active')}
          </span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatCount(data.inactiveConnected)}</span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cron.kpi.inactiveConn', 'inactive but connected')}
          </span>
        </p>
        <p>
          <span className="font-semibold tabular-nums">{formatCount(data.smsToday)}</span>{' '}
          <span className="text-muted-foreground">
            {t('platform.cron.kpi.smsToday', 'SMS today')}
          </span>
        </p>
        {data.serverTime ? (
          <p className="text-muted-foreground lg:ml-auto">
            {data.timezone
              ? t('platform.cron.asOfZone', 'As of {at} (server: {zone})', {
                  at: platformDateTime(data.serverTime),
                  zone: data.timezone,
                })
              : t('platform.cron.asOf', 'As of {at}', { at: platformDateTime(data.serverTime) })}
          </p>
        ) : null}
      </div>

      {data.jobs.length === 0 ? (
        <EmptyState
          title={t('platform.cron.empty', 'No cron jobs reported')}
          description={t(
            'platform.cron.emptyHint',
            'The scheduler has not registered any jobs yet.',
          )}
          actionLabel={t('common.retry', 'Retry')}
          onAction={() => refetch()}
        />
      ) : (
        <CronJobsTable
          jobs={data.jobs}
          disabled={!data.redisOk}
          runningJob={run.isPending ? (run.variables ?? null) : null}
          onRun={(job) => run.mutate(job)}
        />
      )}

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('platform.cron.resetTitle', 'Clear all cron locks?')}
        description={t(
          'platform.cron.resetDesc',
          'Clears locks a crashed job left behind so it can run again. Locks of jobs that are really still running are kept.',
        )}
        confirmLabel={t('platform.cron.resetConfirm', 'Clear locks')}
        destructive
        onConfirm={() => {
          setConfirmReset(false);
          reset.mutate({});
        }}
      />
    </div>
  );
}
