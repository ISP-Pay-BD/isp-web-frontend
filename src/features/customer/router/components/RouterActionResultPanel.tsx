'use client';

import { CheckCircle2, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toneClasses, type Tone } from '@/components/shared/status-tones';
import { useTranslations } from '@/i18n/locale-context';
import type { RouterActionResult } from '@/lib/api/adapters/customer.adapter';

/** Renders the backend's real outcome of a router action (status, message, manual steps). */
export function RouterActionResultPanel({ title, result }: { title: string; result: RouterActionResult }) {
  const t = useTranslations();
  const ok = result.status === 'success' || result.status === 'completed';
  const failed = result.status === 'failed' || result.status === 'error';
  const tone: Tone = ok ? 'success' : failed ? 'danger' : 'warning';
  const label = result.isCooldown
    ? t('customer.router.result.cooldown', 'Cooldown')
    : ok
      ? t('customer.router.result.done', 'Done')
      : failed
        ? t('customer.router.result.failed', 'Failed')
        : result.status === 'queued'
          ? t('customer.router.result.queued', 'Queued')
          : t('customer.router.result.actionNeeded', 'Action needed');
  const Icon = ok ? CheckCircle2 : failed ? AlertTriangle : Clock;

  return (
    <div role="status" className={cn('space-y-2 rounded-xl border p-4 text-sm', toneClasses[tone])}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-foreground">{title}</span>
        <span className="text-muted-foreground text-xs font-medium">· {label}</span>
      </div>
      {result.message && <p className="text-foreground/90 leading-relaxed">{result.message}</p>}
      {result.steps.length > 0 && (
        <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
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
          className="text-primary inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline"
        >
          {t('customer.router.result.adminLink', 'Open router admin page')} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
