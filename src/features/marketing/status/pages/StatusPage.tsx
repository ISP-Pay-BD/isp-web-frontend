'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { mockFetch } from '@/lib/mock-api/client';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

type StatusPayload = {
  overall: 'operational' | 'degraded' | 'outage';
  message: string;
  incidents: {
    id: string;
    title: string;
    status: string;
    updatedLabel: string;
    impact: string;
  }[];
};

export function StatusPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['marketing', 'status'],
    queryFn: () => mockFetch('marketing.status') as Promise<StatusPayload>,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0118] px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <PageSkeleton variant="dashboard" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0c0118] px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl">
          <EmptyState title="Status unavailable" actionLabel="Retry" onAction={() => refetch()} />
        </div>
      </div>
    );
  }

  const ok = data.overall === 'operational';

  return (
    <div className="min-h-screen bg-[#0c0118] text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-sm font-medium text-[#f75803]">ISP Pay BD</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">System status</h1>
        <p className="mt-2 text-white/60">Public network and portal availability</p>

        <div
          className={`mt-8 flex items-center gap-3 rounded-xl border px-4 py-3 ${
            ok ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'
          }`}
        >
          {ok ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          )}
          <div>
            <div className="font-medium">{ok ? 'All systems operational' : 'Service disruption'}</div>
            <div className="text-xs text-white/50">{data.message}</div>
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {data.incidents.map((i) => (
            <li key={i.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-start gap-3">
                {i.status === 'resolved' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
                )}
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs capitalize text-white/50">
                    {i.status} · {i.updatedLabel}
                  </div>
                  <div className="mt-1 text-xs text-white/40">{i.impact}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-white/40">
          <Link href="/" className="underline hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
