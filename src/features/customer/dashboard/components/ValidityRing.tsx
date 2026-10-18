'use client';

import { useEffect, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { numberLocale } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';

const SIZE = 148;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ValidityRingProps {
  /** Whole days until the subscription ends; negative or 0 means it has ended. null when unknown. */
  daysLeft: number | null;
  /** Length of the billing cycle the ring is measured against. */
  cycleDays?: number;
  className?: string;
}

/**
 * How long the connection stays on, as the first thing on the dashboard: a ring that fills once on load (CSS
 * transition, off under reduced motion) with the day count in the middle. It turns amber under 3 days and rose once
 * ended; the words next to it say the same thing, so colour is never the only signal.
 */
export function ValidityRing({ daysLeft, cycleDays = 30, className }: ValidityRingProps) {
  const t = useTranslations();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const ended = daysLeft !== null && daysLeft <= 0;
  const fraction = daysLeft === null ? 0 : Math.min(1, Math.max(0, daysLeft / cycleDays));
  const offset = CIRCUMFERENCE * (1 - (drawn ? fraction : 0));
  const tone = ended ? 'text-rose-500' : daysLeft !== null && daysLeft <= 3 ? 'text-amber-500' : 'text-primary';
  const label =
    daysLeft === null
      ? t('customer.dashboard.validityUnknown', 'Validity unknown')
      : ended
        ? t('customer.dashboard.ended', 'Ended')
        : t('customer.dashboard.daysLeftOf', '{n} days left of {cycle}', { n: daysLeft, cycle: cycleDays });

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: SIZE, height: SIZE }} role="img" aria-label={label}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-muted" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn('stroke-current transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none', tone)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden>
        {daysLeft === null ? (
          <span className="text-muted-foreground text-2xl font-semibold">—</span>
        ) : ended ? (
          <span className="text-xl font-semibold text-rose-600 dark:text-rose-400">{t('customer.dashboard.ended', 'Ended')}</span>
        ) : (
          <>
            <span className={cn('font-mono text-4xl leading-none font-bold tabular-nums', daysLeft <= 3 && 'text-amber-600 dark:text-amber-400')}>
              <NumberFlow locales={numberLocale()} value={daysLeft} />
            </span>
            <span className="text-muted-foreground mt-1 text-sm">{t('customer.dashboard.daysLeft', 'days left')}</span>
          </>
        )}
      </div>
    </div>
  );
}
