'use client';

import { Check } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';
import { formatBdtWithSymbol } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StagePayment } from '../types';

const STEP_KEYS = ['stepReceived', 'stepMatched', 'stepReconnected'] as const;
const STATUS_KEYS = ['statusReceived', 'statusMatched', 'statusReconnected'] as const;

interface PaymentMatchedCardProps {
  payment: StagePayment;
  /** 0 received, 1 matched, 2 reconnected. Defaults to the finished payment. */
  activeStep?: number;
  className?: string;
}

/**
 * The page's signature: one payment's path from the gateway to a live line. It answers the question
 * every operator has ("will it really match my bKash payments?") and recurs in the hero and the
 * journey, where `activeStep` lights the steps as the reader scrolls.
 */
export function PaymentMatchedCard({
  payment,
  activeStep = 2,
  className,
}: PaymentMatchedCardProps) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.payment.${key}`);
  const step = Math.max(0, Math.min(activeStep, STEP_KEYS.length - 1));
  const done = step === STEP_KEYS.length - 1;

  return (
    <div
      className={cn(
        'bg-landing-panel/95 rounded-2xl border border-white/10 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
            done ? 'bg-emerald-400/15 text-emerald-400' : 'bg-landing-cta/15 text-landing-cta',
          )}
        >
          <Check className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline justify-between gap-2 text-xs text-white/50">
            <span className="truncate">{k('title').replace('{gateway}', payment.gateway)}</span>
            <span className="shrink-0 font-mono">{payment.time}</span>
          </p>
          <p className="font-landing-display mt-0.5 text-2xl font-semibold tracking-tight text-white tabular-nums">
            {formatBdtWithSymbol(payment.amountBdt)}
          </p>
          <p className="mt-1 truncate text-xs text-white/65">
            {k(STATUS_KEYS[step]).replace('{customer}', payment.customer ?? '')}
          </p>
        </div>
      </div>

      <p className="mt-3 truncate font-mono text-[11px] text-white/40">
        TrxID {payment.trxId} → {payment.customer}
      </p>

      <ol className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
        {STEP_KEYS.map((key, i) => (
          <li
            key={key}
            className={cn(
              'flex flex-col gap-1.5 text-xs transition-colors duration-300',
              i <= step ? 'text-white/80' : 'text-white/35',
            )}
          >
            <span
              className={cn(
                'h-1 rounded-full transition-colors duration-300',
                i <= step ? 'bg-landing-cta' : 'bg-white/10',
              )}
              aria-hidden
            />
            {k(key)}
          </li>
        ))}
      </ol>
    </div>
  );
}
