'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Wallet, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatBdtWithSymbol } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '@/lib/animations';
import type { PricingPlan, PaygCalculatorData } from '../types';

interface PricingSectionProps {
  plans: PricingPlan[];
  payg: PaygCalculatorData;
  title?: string;
  subtitle?: string;
}

export function PricingSection({
  plans,
  payg,
  title = 'Clear pricing for ISP subscriber counts',
  subtitle,
}: PricingSectionProps) {
  const { reduced } = useMotionSafe();
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [isYearly, setIsYearly] = useState(false);
  const [paygSubscribers, setPaygSubscribers] = useState(payg.defaultCustomers);
  const paygTotal = payg.baseFeeBdt + paygSubscribers * payg.pricePerCustomerBdt;
  const panelTransition = reduced
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };
  const resolvedSubtitle =
    subtitle ??
    `Fixed monthly plans for predictability, or pay-as-you-go at ${formatBdtWithSymbol(payg.baseFeeBdt)} base plus ${formatBdtWithSymbol(payg.pricePerCustomerBdt)} per active subscriber. No admin seat fees. No per-router licenses.`;

  return (
    <section id="pricing" className="border-t border-white/[0.07] py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-3xl">
          <h2 className="font-landing-display text-[clamp(2rem,4.2vw,3.75rem)] font-semibold tracking-tight text-white text-balance">
            {title}
          </h2>
          <p className="mt-4 text-base text-white/60">{resolvedSubtitle}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                model === 'fixed' ? 'text-white' : 'text-white/45 hover:text-white/70',
              )}
            >
              {model === 'fixed' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="absolute inset-0 rounded-lg bg-landing-cta"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Calendar size={15} className="relative z-10" />
              <span className="relative z-10">Fixed Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setModel('payg')}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                model === 'payg' ? 'text-white' : 'text-white/45 hover:text-white/70',
              )}
            >
              {model === 'payg' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="absolute inset-0 rounded-lg bg-landing-cta"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Wallet size={15} className="relative z-10" />
              <span className="relative z-10">Pay-As-You-Go</span>
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
              <div className="mt-10 flex items-center gap-3">
                <span className={cn('text-sm', !isYearly ? 'font-medium text-white' : 'text-white/45')}>
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() => setIsYearly(!isYearly)}
                  className={cn(
                    'relative h-7 w-12 rounded-full p-0.5 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ring-1 ring-white/15',
                    isYearly ? 'bg-landing-cta' : 'bg-white/10',
                  )}
                  aria-label="Toggle yearly discount"
                >
                  <motion.span
                    className="block h-5 w-5 rounded-full bg-white shadow-md"
                    animate={{ x: isYearly ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={cn('text-sm', isYearly ? 'font-medium text-white' : 'text-white/45')}>
                  Yearly
                </span>
                <span className="rounded-full border border-landing-cta/30 bg-landing-cta/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-landing-cta uppercase">
                  Save 20%
                </span>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {plans.map((plan) => {
                  const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-[2rem] p-1.5 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                        plan.highlighted
                          ? 'bg-landing-cta/15 ring-2 ring-landing-cta/50 shadow-[0_0_30px_rgba(247,88,3,0.15)]'
                          : 'bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/20',
                      )}
                    >
                      <div className="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-landing-panel p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-landing-display text-xl font-semibold text-white">{plan.name}</h3>
                            {plan.highlighted && (
                              <span className="rounded-full border border-landing-cta/30 bg-landing-cta/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-landing-cta uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-white/45">{plan.customers}</p>
                          <div className="mt-6 flex items-baseline">
                            <span className="font-landing-display text-4xl font-semibold text-white">
                              {formatBdtWithSymbol(effectivePrice)}
                            </span>
                            <span className="ml-1.5 font-mono text-xs text-white/40">/ mo</span>
                          </div>
                          <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-5 text-sm text-white/65">
                            {plan.features.map((feat) => (
                              <li key={feat} className="flex items-start gap-2.5">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-landing-cta" />
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
                              'group/btn relative h-12 w-full overflow-hidden rounded-full pl-6 pr-2 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
                              plan.highlighted
                                ? 'bg-landing-cta text-white shadow-[0_0_24px_rgba(247,88,3,0.3)] hover:bg-landing-cta-hover hover:shadow-[0_0_36px_rgba(247,88,3,0.45)]'
                                : 'bg-white/10 text-white hover:bg-white/15',
                            )}
                          >
                            <span className="flex-1 text-center">Start Free Trial</span>
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
            </motion.div>
          ) : (
            <motion.div
              key="payg"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={panelTransition}
              className="mt-12 max-w-xl"
            >
              <div className="rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-landing-panel p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                  <h3 className="font-landing-display text-2xl font-semibold text-white">
                    Pay only for active subscribers
                  </h3>
                  <p className="mt-2 text-sm text-white/55">
                    {formatBdtWithSymbol(payg.baseFeeBdt)}/mo base +{' '}
                    {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Subscribers</span>
                      <span className="font-mono text-xl font-semibold text-white">
                        {paygSubscribers.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={payg.minCustomers}
                      max={payg.maxCustomers}
                      step={payg.step}
                      value={paygSubscribers}
                      onChange={(e) => setPaygSubscribers(Number(e.target.value))}
                      className="w-full cursor-pointer accent-landing-cta"
                    />
                  </div>
                  <div className="mt-8 border-t border-white/[0.08] pt-6">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-white/40">Estimated monthly</p>
                    <p className="font-landing-display mt-1 text-3xl font-semibold text-white">
                      {formatBdtWithSymbol(paygTotal)}
                      <span className="font-mono text-sm font-normal text-white/40"> / mo</span>
                    </p>
                  </div>
                  <div className="mt-7">
                    <Button
                      nativeButton={false}
                      render={<Link href="/register" />}
                      className="group/btn relative h-12 w-full overflow-hidden rounded-full bg-landing-cta pl-6 pr-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(247,88,3,0.3)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-landing-cta-hover hover:shadow-[0_0_36px_rgba(247,88,3,0.45)] active:scale-[0.98]"
                    >
                      <span className="flex-1 text-center">Get started with PAYG</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                        ↗
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
