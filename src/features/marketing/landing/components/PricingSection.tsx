'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Wallet, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatBdtWithSymbol, formatCount } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';
import { useTranslations } from '@/features/marketing/shared';
import { useMarketingPricing } from '@/features/marketing/pricing/hooks/use-marketing-pricing';

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
}

/** Calculator slider range — a UI control, not pricing data. */
const PAYG_SLIDER = { min: 50, max: 5000, step: 50, initial: 500 } as const;

/** Plans and PAYG rates come from GET /api/v1/public/registration/plans. */
export function PricingSection({ title, subtitle }: PricingSectionProps) {
  const t = useTranslations();
  const { reduced } = useMotionSafe();
  const { data } = useMarketingPricing();
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [paygSubscribers, setPaygSubscribers] = useState<number>(PAYG_SLIDER.initial);
  const payg = data?.payg ?? null;
  const trialDays = data?.trialDays ?? 0;
  const periodLabel = (period: string) => {
    switch (period) {
      case 'month':
        return t('marketing.landing.pricing.periodMonth', 'mo');
      case 'year':
        return t('marketing.landing.pricing.periodYear', 'year');
      case 'week':
        return t('marketing.landing.pricing.periodWeek', 'week');
      default:
        return period;
    }
  };
  const plans = (data?.tiers ?? []).map((tier) => ({
    id: tier.id,
    name: tier.name,
    priceBdt: tier.priceBdt,
    period: periodLabel(tier.period),
    customers: tier.customers
      ? t('marketing.landing.pricing.upTo', 'Up to {count}', { count: formatCount(tier.customers) })
      : t('marketing.pricing.comparison.unlimited', 'Unlimited'),
    features: tier.features,
    highlighted: false,
  }));
  const paygTotal = payg ? payg.baseFeeBdt + paygSubscribers * payg.pricePerCustomerBdt : 0;
  const panelTransition = reduced
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };
  const resolvedTitle = title ?? t('marketing.pages.pricing.title');
  const resolvedSubtitle =
    subtitle ??
    (payg
      ? t(
          'marketing.landing.pricing.subtitlePayg',
          'Fixed monthly plans for predictability, or pay-as-you-go at {base} base plus {rate} per active subscriber. No admin seat fees. No per-router licenses.',
          {
            base: formatBdtWithSymbol(payg.baseFeeBdt),
            rate: formatBdtWithSymbol(payg.pricePerCustomerBdt),
          },
        )
      : t(
          'marketing.landing.pricing.subtitle',
          'Fixed monthly plans for predictability. No admin seat fees. No per-router licenses.',
        ));

  return (
    <section
      id="pricing"
      className="relative z-[1] border-t border-white/[0.07] pt-24 pb-12 md:pt-32"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-3xl">
          <h2 className="font-landing-display text-[clamp(2rem,4.2vw,3.75rem)] font-semibold tracking-tight text-balance text-white">
            {resolvedTitle}
          </h2>
          <p className="mt-4 text-base text-white/60">{resolvedSubtitle}</p>
        </Reveal>

        <Reveal className={payg ? 'mt-10' : 'hidden'}>
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                model === 'fixed' ? 'text-white' : 'text-white/60 hover:text-white/70',
              )}
            >
              {model === 'fixed' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="bg-landing-cta absolute inset-0 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Calendar size={15} className="relative z-10" />
              <span className="relative z-10">{t('marketing.landing.pricing.fixedTab', 'Fixed Monthly')}</span>
            </button>
            <button
              type="button"
              onClick={() => setModel('payg')}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                model === 'payg' ? 'text-white' : 'text-white/60 hover:text-white/70',
              )}
            >
              {model === 'payg' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="bg-landing-cta absolute inset-0 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Wallet size={15} className="relative z-10" />
              <span className="relative z-10">{t('marketing.landing.pricing.paygTab', 'Pay-As-You-Go')}</span>
            </button>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          {model === 'fixed' ? (
            <motion.div
              key="fixed"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={panelTransition}
            >
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-[2rem] p-1.5 backdrop-blur-xl transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                        plan.highlighted
                          ? 'bg-landing-cta/15 ring-landing-cta/50 shadow-[0_0_30px_rgba(247,88,3,0.15)] ring-2'
                          : 'bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/20',
                      )}
                    >
                      <div className="bg-landing-panel flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-landing-display text-xl font-semibold text-white">
                              {plan.name}
                            </h3>
                            {plan.highlighted && (
                              <span className="border-landing-cta/30 bg-landing-cta/15 text-landing-accent rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                                {t('marketing.landing.pricing.popular', 'Popular')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-white/60">{plan.customers}</p>
                          <div className="mt-6 flex items-baseline">
                            <span className="font-landing-display text-4xl font-semibold text-white">
                              {formatBdtWithSymbol(plan.priceBdt)}
                            </span>
                            <span className="ml-1.5 font-mono text-xs text-white/60">/ {plan.period}</span>
                          </div>
                          <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-5 text-sm text-white/65">
                            {plan.features.map((feat) => (
                              <li key={feat} className="flex items-start gap-2.5">
                                <Check className="text-landing-accent mt-0.5 h-4 w-4 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-8">
                          <Button
                            nativeButton={false}
                            render={<Link href="/register" />}
                            className={cn(
                              'group/btn relative h-12 w-full overflow-hidden rounded-full pr-2 pl-6 text-sm font-semibold transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
                              plan.highlighted
                                ? 'bg-landing-cta hover:bg-landing-cta-hover text-white shadow-[0_0_24px_rgba(247,88,3,0.3)] hover:shadow-[0_0_36px_rgba(247,88,3,0.45)]'
                                : 'bg-white/10 text-white hover:bg-white/15',
                            )}
                          >
                            <span className="flex-1 text-center">
                              {trialDays > 0
                                ? t('marketing.pricing.comparison.startFreeTrial', 'Start Free Trial')
                                : t('marketing.pricing.comparison.getStarted', 'Get Started')}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                              ↗
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Addons Strip */}
              <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h4 className="font-landing-display text-base font-semibold text-white">
                      {t('marketing.landing.pricing.addonsTitle', 'Need custom add-ons or burst capacity?')}
                    </h4>
                    <p className="mt-1 text-xs text-white/60">
                      {payg?.addons.length
                        ? t('marketing.landing.pricing.addonsEnable', 'Enable {list} on any plan.', {
                            list: payg.addons.map((a) => `${a.name} (${formatBdtWithSymbol(a.priceBdt)})`).join(', '),
                          })
                        : t(
                            'marketing.landing.pricing.addonsBrowseHint',
                            'Browse the add-on catalogue to extend any plan.',
                          )}
                    </p>
                  </div>
                  <Link
                    href="/plugins"
                    className="text-landing-accent inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline"
                  >
                    <span>{t('marketing.landing.pricing.addonsBrowse', 'Browse all add-ons')}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : payg ? (
            <motion.div
              key="payg"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={panelTransition}
              className="mt-12 max-w-xl"
            >
              <div className="rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10 backdrop-blur-xl transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="bg-landing-panel rounded-[calc(2rem-0.375rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                  <h3 className="font-landing-display text-2xl font-semibold text-white">
                    {t('marketing.landing.pricing.paygTitle', 'Pay only for active subscribers')}
                  </h3>
                  <p className="mt-2 text-sm text-white/55">
                    {t('marketing.landing.pricing.paygRates', '{base}/mo base + {rate} per subscriber.', {
                      base: formatBdtWithSymbol(payg.baseFeeBdt),
                      rate: formatBdtWithSymbol(payg.pricePerCustomerBdt),
                    })}
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{t('marketing.pricing.comparison.subscribers', 'Subscribers')}</span>
                      <span className="font-mono text-xl font-semibold text-white">
                        {formatCount(paygSubscribers)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={PAYG_SLIDER.min}
                      max={PAYG_SLIDER.max}
                      step={PAYG_SLIDER.step}
                      value={paygSubscribers}
                      onChange={(e) => setPaygSubscribers(Number(e.target.value))}
                      className="accent-landing-cta w-full cursor-pointer"
                    />
                  </div>
                  <div className="mt-8 border-t border-white/[0.08] pt-6">
                    <p className="font-mono text-xs tracking-wider text-white/60 uppercase">
                      {t('marketing.landing.pricing.estimated', 'Estimated monthly')}
                    </p>
                    <p className="font-landing-display mt-1 text-3xl font-semibold text-white">
                      {formatBdtWithSymbol(paygTotal)}
                      <span className="font-mono text-sm font-normal text-white/60">
                        {' '}
                        / {periodLabel('month')}
                      </span>
                    </p>
                  </div>
                  <div className="mt-7">
                    <Button
                      nativeButton={false}
                      render={<Link href="/register" />}
                      className="group/btn bg-landing-cta hover:bg-landing-cta-hover relative h-12 w-full overflow-hidden rounded-full pr-2 pl-6 text-sm font-semibold text-white shadow-[0_0_24px_rgba(247,88,3,0.3)] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_0_36px_rgba(247,88,3,0.45)] active:scale-[0.98]"
                    >
                      <span className="flex-1 text-center">
                        {t('marketing.landing.pricing.paygCta', 'Get started with PAYG')}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                        ↗
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
