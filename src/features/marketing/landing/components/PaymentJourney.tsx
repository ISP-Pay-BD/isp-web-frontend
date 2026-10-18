'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { useLocale } from '@/features/marketing/shared';
import { cn } from '@/lib/utils';
import { PhonePayIllustration, RouterIllustration, ShieldIllustration } from './illustrations';
import { PaymentMatchedCard } from './PaymentMatchedCard';
import { SectionTitle } from './SectionTitle';
import { TiltCard } from './TiltCard';
import type { ReconcileStep, StagePayment } from '../types';

/** One isometric scene per chapter: the payment arrives, it is matched, the router comes back. */
function ChapterArt({ index, lit }: { index: number; lit: boolean }) {
  const className = 'hidden size-24 shrink-0 sm:block lg:size-28';
  if (index === 0) return <PhonePayIllustration className={className} />;
  if (index === 1) return <ShieldIllustration className={className} />;
  return <RouterIllustration className={className} lit={lit} />;
}

interface PaymentJourneyProps {
  steps: ReconcileStep[];
  payment: StagePayment;
}

/**
 * "Follow one payment": the reconciliation steps as chapters beside the signature card, which lights
 * the matching step as each chapter reaches the middle of the screen (desktop, where the card is
 * sticky). Without JS, or on a phone, the card simply shows the finished payment.
 */
export function PaymentJourney({ steps, payment }: PaymentJourneyProps) {
  const { locale, t } = useLocale();
  const bn = locale === 'bn';
  const k = (key: string) => t(`marketing.landing.journey.${key}`);
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(steps.length - 1);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-step]');
    if (!items?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="bg-landing-panel/40 relative z-[1] overflow-clip border-y border-white/10 py-24 md:py-36"
    >
      {/* The band: a fiber-circuit motif and a lit top edge mark the page's main story. */}
      <div className="lp-circuit text-white opacity-[0.07]" aria-hidden />
      <div
        className="via-landing-cta/60 absolute inset-x-[15%] top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle title={k('title')} description={k('desc')} />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <TiltCard className="mx-auto max-w-sm rounded-2xl">
                <PaymentMatchedCard payment={payment} activeStep={active} />
              </TiltCard>
            </div>
          </div>

          <ol ref={listRef} className="lg:col-span-7">
            {steps.map((step, i) => (
              <li
                key={step.title}
                data-step={i}
                className={cn(
                  'border-t border-white/10 py-8 transition-opacity duration-300 lg:py-20',
                  i > active && 'lg:opacity-40',
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-landing-accent font-mono text-xs">
                      {k('step').replace('{n}', String(i + 1))}
                    </p>
                    <h3 className="font-landing-display mt-3 text-2xl font-semibold tracking-tight text-white">
                      {bn && step.titleBn ? step.titleBn : step.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-base leading-relaxed text-white/60">
                      {bn && step.descBn ? step.descBn : step.desc}
                    </p>
                    <p className="mt-5 flex items-baseline gap-2 text-sm">
                      <span className="font-landing-display text-xl font-semibold text-white">
                        {step.metric}
                      </span>
                      <span className="text-white/60">
                        {bn && step.metricHighlightBn
                          ? step.metricHighlightBn
                          : step.metricHighlight}
                      </span>
                    </p>
                  </div>
                  <ChapterArt index={i} lit={active >= i} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
