'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { formatBdtWithSymbol } from '@/lib/format';
import { Reveal } from '@/components/motion/Reveal';
import { GlareSurface } from '@/components/motion/GlareSurface';
import { MagneticTabs, MagneticTabsPanel } from '@/components/motion/MagneticTabs';
import { MorphArrowButton } from '@/components/motion/MorphArrowButton';
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

        <Reveal className="mt-10">
          <MagneticTabs
            items={[
              { value: 'fixed', label: 'Fixed Monthly' },
              { value: 'payg', label: 'Pay-As-You-Go' },
            ]}
            value={model}
            onChange={(v) => setModel(v as 'fixed' | 'payg')}
            layoutId="pricing-model-tab"
          />
        </Reveal>

        <AnimatePresence mode="wait">
          {model === 'fixed' ? (
            <MagneticTabsPanel key="fixed" activeKey="fixed" className="mt-12">
              <div className="flex items-center justify-start gap-3 text-sm">
                <span className={!isYearly ? 'font-medium text-white' : 'text-white/50'}>Monthly</span>
                <button
                  type="button"
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isYearly ? 'bg-landing-cta' : 'bg-white/20'
                  }`}
                  aria-label="Toggle yearly discount"
                >
                  <span
                    className={`mt-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isYearly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={isYearly ? 'font-medium text-white' : 'text-white/50'}>Yearly</span>
                <span className="text-xs text-emerald-400/90">Save 20%</span>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                  return (
                    <GlareSurface
                      key={plan.id}
                      intensity={0.1}
                      className={`relative flex flex-col justify-between rounded-xl p-7 ${
                        plan.highlighted ? 'bg-white/[0.06] ring-1 ring-landing-cta/50' : 'bg-white/[0.03]'
                      }`}
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
                          className={`w-full h-10 text-sm font-semibold ${
                            plan.highlighted
                              ? 'bg-landing-cta hover:bg-landing-cta-hover text-white'
                              : 'bg-white/10 hover:bg-white/15 text-white'
                          }`}
                        >
                          Start Free Trial
                        </MorphArrowButton>
                      </div>
                    </GlareSurface>
                  );
                })}
              </div>
            </MagneticTabsPanel>
          ) : (
            <MagneticTabsPanel key="payg" activeKey="payg" className="mt-12 max-w-xl">
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
            </MagneticTabsPanel>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
