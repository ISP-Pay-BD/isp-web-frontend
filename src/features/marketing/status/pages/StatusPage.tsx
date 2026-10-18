'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
import { useTranslations } from '@/i18n/locale-context';
import { formatCount, formatDateTime } from '@/lib/format';
import type { PublicStatus, ServiceHealth } from '../types';

function toHealth(value: unknown): ServiceHealth {
  const s = str(value);
  return s === 'operational' || s === 'degraded' || s === 'outage' ? s : 'degraded';
}

function toPublicStatus(value: unknown): PublicStatus {
  const r = camelizeKeys<Record<string, unknown>>(value) ?? {};
  const components = Array.isArray(r.components) ? (r.components as Record<string, unknown>[]) : [];
  return {
    overall: toHealth(r.overall),
    message: str(r.message),
    components: components.map((c) => ({
      key: str(c.key),
      name: str(c.name),
      status: toHealth(c.status),
      latencyMs: c.latencyMs === null || c.latencyMs === undefined ? null : num(c.latencyMs),
    })),
    checkedAt: str(r.checkedAt),
  };
}

const HEALTH: Record<ServiceHealth, { tone: string; banner: string; Icon: typeof CheckCircle2 }> = {
  operational: {
    tone: 'text-emerald-400',
    banner: 'border-emerald-500/30 bg-emerald-500/10',
    Icon: CheckCircle2,
  },
  degraded: {
    tone: 'text-amber-400',
    banner: 'border-amber-500/30 bg-amber-500/10',
    Icon: AlertTriangle,
  },
  outage: {
    tone: 'text-red-400',
    banner: 'border-red-500/30 bg-red-500/10',
    Icon: XCircle,
  },
};

function formatCheckedAt(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : formatDateTime(d);
}

export function StatusPage() {
  const t = useTranslations();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['marketing', 'status'],
    queryFn: async ({ signal }) => toPublicStatus(await http.get<unknown>('/v1/public/status', undefined, signal)),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-landing-bg px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <PageSkeleton variant="table" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-dvh bg-landing-bg px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title={t('marketing.status.unavailableTitle', 'Status unavailable')}
            description={t(
              'marketing.status.unavailableDesc',
              "We couldn't reach the status service. Try again in a moment.",
            )}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const overall = HEALTH[data.overall];
  const overallLabel = {
    operational: t('marketing.status.overallOperational', 'All systems operational'),
    degraded: t('marketing.status.overallDegraded', 'Degraded performance'),
    outage: t('marketing.status.overallOutage', 'Service outage'),
  }[data.overall];
  const componentLabel = {
    operational: t('marketing.status.componentOperational', 'Operational'),
    degraded: t('marketing.status.componentDegraded', 'Degraded'),
    outage: t('marketing.status.componentOutage', 'Outage'),
  };

  return (
    <div className="min-h-dvh bg-landing-bg text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Reveal>
          <p className="text-sm font-medium text-landing-accent">ISP Pay BD</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {t('marketing.status.title', 'System status')}
          </h1>
          <p className="mt-2 text-white/60">
            {t('marketing.status.subtitle', 'Public network and portal availability')}
          </p>

          <div className={`mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 ${overall.banner}`}>
            <overall.Icon className={`h-5 w-5 ${overall.tone}`} />
            <div>
              <div className="font-medium">{overallLabel}</div>
              {data.message ? <div className="text-xs text-white/50">{data.message}</div> : null}
            </div>
          </div>
        </Reveal>

        {data.components.length > 0 ? (
          <Reveal className="mt-8 space-y-3" delay={0.05} as="ul">
            {data.components.map((c) => {
              const health = HEALTH[c.status];
              return (
                <li
                  key={c.key || c.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <health.Icon className={`h-4 w-4 ${health.tone}`} />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono tabular-nums text-white/50">
                      {c.latencyMs === null ? '—' : `${formatCount(c.latencyMs)} ms`}
                    </span>
                    <span className={health.tone}>{componentLabel[c.status]}</span>
                  </div>
                </li>
              );
            })}
          </Reveal>
        ) : null}

        {data.checkedAt ? (
          <p className="mt-6 text-center text-xs text-white/60">
            {t('marketing.status.lastChecked', 'Last checked {when} · refreshes every minute', {
              when: formatCheckedAt(data.checkedAt),
            })}
          </p>
        ) : null}

        <p className="mt-10 text-center text-sm text-white/60">
          <Link href="/" className="underline hover:text-white">
            {t('marketing.status.backHome', 'Back to home')}
          </Link>
        </p>
      </div>
    </div>
  );
}
