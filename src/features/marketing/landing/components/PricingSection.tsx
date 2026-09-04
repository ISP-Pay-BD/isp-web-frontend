'use client';

import { useState } from 'react';
import { Check, Wallet, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatBdtWithSymbol } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';
import { GlareSurface } from '@/components/motion/GlareSurface';
import { MorphArrowButton } from '@/components/motion/MorphArrowButton';
import { cn } from '@/lib/utils';
import type { PricingPlan, PaygCalculatorData } from '../types';

interface PricingSectionProps {
  plans: PricingPlan[];
  payg: PaygCalculatorData;
}

export function PricingSection({ plans, payg }: PricingSectionProps) {
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [isYearly, setIsYearly] = useState(false);
  const [paygSubscribers, setPaygSubscribers] = useState(payg.defaultCustomers);
  const paygTotal = payg.baseFeeBdt + paygSubscribers * payg.pricePerCustomerBdt;

  return (
    <section id="pricing" className="border-t border-white/[0.07] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">Pricing</p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Priced per subscriber, not per promise.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Fixed monthly plans, or Pay-As-You-Go at ৳1.5/subscriber — no tier traps.
          </p>
        </Reveal>

        {/* Model Toggle — Premium segmented control */}
        <Reveal className="mt-10">
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300',
                model === 'fixed'
                  ? 'text-white'
                  : 'text-white/45 hover:text-white/70',
              )}
            >
              {model === 'fixed' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="absolute inset-0 rounded-lg bg-landing-cta shadow-[0_0_20px_rgba(247,88,3,0.25)]"
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
                'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300',
                model === 'payg'
                  ? 'text-white'
                  : 'text-white/45 hover:text-white/70',
              )}
            >
              {model === 'payg' && (
                <motion.span
                  layoutId="pricing-model-bg"
                  className="absolute inset-0 rounded-lg bg-landing-cta shadow-[0_0_20px_rgba(247,88,3,0.25)]"
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Monthly/Yearly toggle */}
              <div className="mt-10 flex items-center gap-3">
                <span className={cn('text-sm', !isYearly ? 'font-medium text-white' : 'text-white/45')}>
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() => setIsYearly(!isYearly)}
                  className={cn(
                    'relative h-7 w-12 rounded-full transition-all duration-300',
                    isYearly
                      ? 'bg-gradient-to-r from-landing-cta to-amber-500 shadow-[0_0_16px_rgba(247,88,3,0.3)]'
                      : 'bg-white/15',
                  )}
                  aria-label="Toggle yearly discount"
                >
                  <motion.span
                    className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-md"
                    animate={{ left: isYearly ? '25px' : '3px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={cn('text-sm', isYearly ? 'font-medium text-white' : 'text-white/45')}>
                  Yearly
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                  Save 20%
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                  return (
                    <GlareSurface
                      key={plan.id}
                      intensity={0.1}
                      className={cn(
                        'relative flex flex-col justify-between rounded-xl p-7',
                        plan.highlighted
                          ? 'bg-white/[0.06] ring-1 ring-landing-cta/50'
                          : 'bg-white/[0.03]',
                      )}
                    >
                      {plan.highlighted && (
                        <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-landing-cta">
                          Popular
                        </span>
                      )}
                      <div>
                        <h3 className="font-landing-display text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="mt-1 text-xs text-white/45">{plan.customers}</p>
                        <div className="mt-5 flex items-baseline">
                          <span className="font-landing-display text-3xl font-semibold text-white">
                            {formatBdtWithSymbol(effectivePrice)}
                          </span>
                          <span className="ml-1 text-sm text-white/40">/ mo</span>
                        </div>
                        <ul className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5 text-sm text-white/60">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-landing-cta" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-7">
                        <MorphArrowButton
                          href="/register"
                          magnetic={plan.highlighted}
                          className={cn(
                            'h-10 w-full text-sm font-semibold',
                            plan.highlighted
                              ? 'bg-landing-cta hover:bg-landing-cta-hover text-white'
                              : 'bg-white/10 hover:bg-white/15 text-white',
                          )}
                        >
                          Start Free Trial
                        </MorphArrowButton>
                      </div>
                    </GlareSurface>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 max-w-xl"
            >
              <div className="rounded-xl bg-white/[0.04] p-8">
                <h3 className="font-landing-display text-xl font-semibold text-white">
                  Pay only for active subscribers
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  {formatBdtWithSymbol(payg.baseFeeBdt)}/mo base +{' '}
                  {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Subscribers</span>
                    <span className="font-mono text-lg font-semibold text-white">
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
                <div className="mt-8 border-t border-white/[0.07] pt-6">
                  <p className="text-xs uppercase tracking-wider text-white/40">Estimated monthly</p>
                  <p className="font-landing-display mt-1 text-3xl font-semibold text-white">
                    {formatBdtWithSymbol(paygTotal)}
                    <span className="text-base font-normal text-white/40"> / mo</span>
                  </p>
                </div>
                <div className="mt-6">
                  <MorphArrowButton
                    href="/register"
                    className="bg-landing-cta hover:bg-landing-cta-hover h-10 px-6 text-sm font-semibold text-white"
                  >
                    Get started with PAYG
                  </MorphArrowButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
