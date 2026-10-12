'use client';

import { CheckCircle2, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

/** Renders the backend's real outcome of a router action (status, message, manual steps). */
export function RouterActionResultPanel({ title, result }: { title: string; result: RouterActionResult }) {
  const ok = result.status === 'success' || result.status === 'completed';
  const failed = result.status === 'failed' || result.status === 'error';
  const label = result.isCooldown ? 'Cooldown' : ok ? 'Done' : failed ? 'Failed' : result.status === 'queued' ? 'Queued' : 'Action needed';
  const Icon = ok ? CheckCircle2 : failed ? AlertTriangle : Clock;

  return (
    <div
      role="status"
      className={cn(
        'rounded-xl border p-4 text-sm space-y-2',
        ok
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : failed
            ? 'border-rose-500/30 bg-rose-500/5'
            : 'border-amber-500/30 bg-amber-500/5',
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <Icon
          className={cn(
            'h-4 w-4',
            ok ? 'text-emerald-600' : failed ? 'text-rose-600' : 'text-amber-600',
          )}
        />
        <span>{title}</span>
        <span className="text-xs font-medium text-muted-foreground">· {label}</span>
      </div>
      {result.message && <p className="text-foreground/90 leading-relaxed">{result.message}</p>}
      {result.steps.length > 0 && (
        <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">
          {result.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
      {result.webAdminUrl && (
        <a
          href={result.webAdminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open router admin page <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
