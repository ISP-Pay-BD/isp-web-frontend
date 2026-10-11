'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { useLocale } from '@/features/marketing/shared';
import { cn } from '@/lib/utils';
import { PaymentMatchedCard } from './PaymentMatchedCard';
import { SectionTitle } from './SectionTitle';
import type { ReconcileStep, StagePayment } from '../types';

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
    <section id="how-it-works" className="relative z-[1] border-t border-white/10 py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle title={k('title')} description={k('desc')} />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <PaymentMatchedCard
                payment={payment}
                activeStep={active}
                className="mx-auto max-w-sm"
              />
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
                <p className="text-landing-cta font-mono text-xs">
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
                  <span className="text-white/45">
                    {bn && step.metricHighlightBn ? step.metricHighlightBn : step.metricHighlight}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
