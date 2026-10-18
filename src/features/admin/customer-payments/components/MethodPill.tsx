'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { paymentMethodLabel } from '../lib/labels';
import type { MethodKey } from '../types';

const STYLES: Record<MethodKey, { pill: string; dot: string }> = {
  bkash: { pill: 'bg-[#e2136e]/10 text-[#e2136e] border-[#e2136e]/20', dot: 'bg-[#e2136e]' },
  nagad: { pill: 'bg-[#f7941d]/10 text-[#f7941d] border-[#f7941d]/20', dot: 'bg-[#f7941d]' },
  rocket: { pill: 'bg-purple-500/10 text-purple-500 border-purple-500/20', dot: 'bg-purple-500' },
  cash: { pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  bank: { pill: 'bg-blue-500/10 text-blue-500 border-blue-500/20', dot: 'bg-blue-500' },
  sslcommerz: { pill: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', dot: 'bg-indigo-500' },
  card: { pill: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', dot: 'bg-indigo-500' },
  other: { pill: 'bg-muted/40 text-muted-foreground border-border/60', dot: 'bg-muted-foreground' },
};

/** Gateway / method chip for a payment row. */
export function MethodPill({ method, methodRaw, className }: { method: MethodKey; methodRaw: string; className?: string }) {
  const t = useTranslations();
  const s = STYLES[method];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs border shadow-2xs',
        s.pill,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {paymentMethodLabel(t, { method, methodRaw })}
    </span>
  );
}
