'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { http } from '@/lib/api/client';
import { camelizeKeys, num, str } from '@/lib/api/case';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
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

const HEALTH: Record<ServiceHealth, { label: string; tone: string; banner: string; Icon: typeof CheckCircle2 }> = {
  operational: {
    label: 'All systems operational',
    tone: 'text-emerald-400',
    banner: 'border-emerald-500/30 bg-emerald-500/10',
    Icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded performance',
    tone: 'text-amber-400',
    banner: 'border-amber-500/30 bg-amber-500/10',
    Icon: AlertTriangle,
  },
  outage: {
    label: 'Service outage',
    tone: 'text-red-400',
    banner: 'border-red-500/30 bg-red-500/10',
    Icon: XCircle,
  },
};

const COMPONENT_LABEL: Record<ServiceHealth, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
};

function formatCheckedAt(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export function StatusPage() {
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
            title="Status unavailable"
            description="We couldn't reach the status service. Try again in a moment."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const overall = HEALTH[data.overall];

  return (
    <div className="min-h-dvh bg-landing-bg text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Reveal>
          <p className="text-sm font-medium text-landing-cta">ISP Pay BD</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">System status</h1>
          <p className="mt-2 text-white/60">Public network and portal availability</p>

          <div className={`mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 ${overall.banner}`}>
            <overall.Icon className={`h-5 w-5 ${overall.tone}`} />
            <div>
              <div className="font-medium">{overall.label}</div>
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
                      {c.latencyMs === null ? '—' : `${c.latencyMs} ms`}
                    </span>
                    <span className={health.tone}>{COMPONENT_LABEL[c.status]}</span>
                  </div>
                </li>
              );
            })}
          </Reveal>
        ) : null}

        {data.checkedAt ? (
          <p className="mt-6 text-center text-xs text-white/40">
            Last checked {formatCheckedAt(data.checkedAt)} · refreshes every minute
          </p>
        ) : null}

        <p className="mt-10 text-center text-sm text-white/40">
          <Link href="/" className="underline hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
