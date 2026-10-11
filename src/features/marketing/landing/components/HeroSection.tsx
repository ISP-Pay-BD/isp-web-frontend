'use client';

import Link from 'next/link';
import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/features/marketing/shared';
import { OperatorConsole } from './OperatorConsole';
import { PaymentMatchedCard } from './PaymentMatchedCard';
import { SubscriberPhone } from './SubscriberPhone';
import type { HeroStageData, StatsData } from '../types';

interface HeroSectionProps {
  stats: StatsData;
  stage: HeroStageData;
}

const FACT_KEYS = ['fact1', 'fact2', 'fact3', 'fact4'] as const;

/** `--d` staggers the CSS entrance (`.lp-rise`), which plays on first paint, before hydration. */
const delay = (ms: number) => ({ ['--d' as string]: `${ms}ms` });

/**
 * One promise, one action, then the product itself: the operator console in a browser, the
 * subscriber app in a phone, and the signature payment card, all telling the same payment's story.
 */
export function HeroSection({ stats, stage }: HeroSectionProps) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.hero.${key}`);
  const payment = stage.payments[0];

  return (
    <section id="hero" className="relative z-[1] overflow-hidden pt-28 pb-8 md:pt-36">
      <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
        <a
          href="#proof"
          className="lp-rise group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-3.5 pl-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
        >
          <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
          {k('badge').replace('{count}', String(stats.trustedIsps))}
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>

        <h1
          className="lp-rise font-landing-display mx-auto mt-7 max-w-4xl text-[clamp(2.75rem,1.4rem+5.6vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-white"
          style={delay(80)}
        >
          {k('titleLead')} <span className="text-landing-cta">{k('titleAccent')}</span>
        </h1>

        <p
          className="lp-rise mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
          style={delay(200)}
        >
          {k('subtitle')}
        </p>

        <div
          className="lp-rise mt-9 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
          style={delay(300)}
        >
          <Button
            nativeButton={false}
            render={<Link href="/register" />}
            className="bg-landing-cta hover:bg-landing-cta-hover h-13 w-full rounded-full px-8 text-base font-semibold text-white active:scale-[0.98] sm:w-auto"
          >
            {t('marketing.cta.primary')}
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Button>
          <a
            href="#try-it"
            className="group inline-flex h-13 items-center gap-1.5 rounded-full px-5 text-base font-medium text-white/85 transition-colors duration-200 hover:text-white"
          >
            {k('demo')}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </div>

        <ul
          className="lp-rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/50"
          style={delay(380)}
        >
          {FACT_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span className="bg-landing-cta size-1 rounded-full" aria-hidden />
              {k(key)}
            </li>
          ))}
        </ul>
      </div>

      {/* The stage: the console behind, the subscriber app in front, the payment card in the corner. */}
      <div className="mx-auto mt-14 max-w-6xl px-4 md:px-6 lg:mt-20">
        <div
          className="lp-rise bg-landing-panel/60 relative h-[460px] overflow-hidden rounded-[2rem] border border-white/10 sm:h-[540px] lg:h-[600px]"
          style={delay(460)}
        >
          <div className="bg-grid-ambient absolute inset-0" aria-hidden />

          <p className="bg-landing-bg/80 absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium whitespace-nowrap text-white/80 backdrop-blur sm:top-5 sm:text-sm">
            <Monitor className="text-landing-cta size-4" aria-hidden />
            {k('stageConsole')}
            <span className="text-white/30">·</span>
            <Smartphone className="text-landing-cta size-4" aria-hidden />
            {k('stageApp')}
            <span className="hidden text-white/40 sm:inline">· {k('sample')}</span>
          </p>

          <div aria-hidden>
            <div className="absolute top-20 left-[5%] hidden w-[68%] lg:block">
              <OperatorConsole stage={stage} />
            </div>

            <div className="absolute top-16 left-1/2 z-20 -translate-x-1/2 lg:top-28 lg:right-[5%] lg:left-auto lg:translate-x-0">
              <SubscriberPhone subscriber={stage.subscriber} />
            </div>

            {payment ? (
              <div
                className="lp-rise absolute bottom-8 left-[2%] z-20 hidden w-[270px] xl:block"
                style={delay(900)}
              >
                <PaymentMatchedCard payment={payment} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
