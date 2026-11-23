'use client';

import { Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Tone } from '@/components/shared/status-tones';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { platformDateTime } from '@/features/platform/shared';
import { useTranslations } from '@/i18n/locale-context';
import type { CronJob } from '../api/cron.api';

interface Props {
  jobs: CronJob[];
  runningJob: string | null;
  disabled: boolean;
  onRun: (job: string) => void;
}

const TONES: Record<string, Tone> = {
  ok: 'success',
  failed: 'danger',
  skipped: 'warning',
  running: 'info',
  never: 'neutral',
};

function seconds(ms: number | null): string {
  if (ms === null) return '—';
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function JobStatus({ job }: { job: CronJob }) {
  const t = useTranslations();
  const status = job.running ? 'running' : job.lastStatus;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge
        status={status}
        tone={TONES[status] ?? 'neutral'}
        label={t(`platform.cron.status.${status}`, status)}
      />
      {/* `running` = lock held by a live run; `locked` alone = a stale lock a crashed run left behind. */}
      {job.locked ? (
        <span
          className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
          title={t('platform.cron.lockTtl', 'Lock expires in {ttl}', {
            ttl: seconds(job.lockTtlMs),
          })}
        >
          <Lock className="h-3 w-3" aria-hidden />
          {job.running
            ? t('platform.cron.locked', 'Locked')
            : t('platform.cron.stuckLock', 'Stuck lock')}
        </span>
      ) : null}
    </div>
  );
}

function RunButton({ job, runningJob, disabled, onRun }: Omit<Props, 'jobs'> & { job: CronJob }) {
  const t = useTranslations();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || !job.canRun || job.running || job.locked || runningJob !== null}
      onClick={() => onRun(job.name)}
      aria-label={t('platform.cron.runAria', 'Run {job} now', { job: job.label })}
    >
      <Play className="mr-1 h-3.5 w-3.5" />
      {runningJob === job.name
        ? t('platform.cron.starting', 'Starting…')
        : t('platform.cron.runNow', 'Run now')}
    </Button>
  );
}

function Counts({ job }: { job: CronJob }) {
  const t = useTranslations();
  return (
    <span className="text-muted-foreground text-xs tabular-nums">
      {t('platform.cron.counts', '{runs} runs · {fails} failed', {
        runs: job.runCount,
        fails: job.failCount,
      })}
    </span>
  );
}

export function CronJobsTable({ jobs, runningJob, disabled, onRun }: Props) {
  const t = useTranslations();
  const action = (job: CronJob) => (
    <RunButton job={job} runningJob={runningJob} disabled={disabled} onRun={onRun} />
  );
  return (
    <>
      {/* Phone: one card per job */}
      <div className="space-y-3 md:hidden">
        {jobs.map((job) => (
          <Card key={job.name} className="border-border/60">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{job.label}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {job.schedule ?? job.name}
                  </p>
                </div>
                <JobStatus job={job} />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <dt className="text-muted-foreground">
                  {t('platform.cron.col.lastRun', 'Last run')}
                </dt>
                <dd className="text-right tabular-nums">{platformDateTime(job.lastStartedAt)}</dd>
                <dt className="text-muted-foreground">
                  {t('platform.cron.col.duration', 'Duration')}
                </dt>
                <dd className="text-right tabular-nums">{seconds(job.lastDurationMs)}</dd>
              </dl>
              <Counts job={job} />
              {job.lastError ? (
                <p className="bg-destructive/5 text-destructive rounded-md p-2 font-mono text-xs break-words">
                  {job.lastError}
                </p>
              ) : null}
              {action(job)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tablet and up */}
      <Card className="border-border/60 hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('platform.cron.col.job', 'Job')}</TableHead>
              <TableHead>{t('platform.cron.col.lastRun', 'Last run')}</TableHead>
              <TableHead>{t('platform.cron.col.status', 'Status')}</TableHead>
              <TableHead>{t('platform.cron.col.duration', 'Duration')}</TableHead>
              <TableHead>{t('platform.cron.col.lastError', 'Last error')}</TableHead>
              <TableHead className="text-right">
                {t('platform.cron.col.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.name}>
                <TableCell>
                  <p className="text-sm font-medium">{job.label}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {job.schedule ?? job.name}
                  </p>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap tabular-nums">
                  {platformDateTime(job.lastStartedAt)}
                  {job.lastTrigger ? (
                    <p className="text-muted-foreground text-xs">
                      {t(`platform.cron.trigger.${job.lastTrigger}`, job.lastTrigger)}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <JobStatus job={job} />
                  <Counts job={job} />
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {seconds(job.lastDurationMs)}
                </TableCell>
                <TableCell className="max-w-xs">
                  {job.lastError ? (
                    <p
                      className="text-destructive line-clamp-2 font-mono text-xs break-words"
                      title={job.lastError}
                    >
                      {job.lastError}
                    </p>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{action(job)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
