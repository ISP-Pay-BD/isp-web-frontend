'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import type { PricingPlan, PaygCalculatorData } from '../types';

interface PricingSectionProps {
  plans: PricingPlan[];
  payg: PaygCalculatorData;
}

export function PricingSection({ plans, payg }: PricingSectionProps) {
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [isYearly, setIsYearly] = useState(false);
  const [paygSubscribers, setPaygSubscribers] = useState(payg.defaultCustomers);

  // PAYG calculation
  const paygTotal = payg.baseFeeBdt + paygSubscribers * payg.pricePerCustomerBdt;

  return (
    <section id="pricing" className="border-t border-white/[0.07] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Pricing
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Priced per subscriber, not per promise.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Fixed monthly plans, or Pay-As-You-Go at ৳1.5/subscriber — no tier traps.
          </p>
        </div>

        {/* Pricing Model Tabs */}
        <div className="mt-10 flex justify-start">
          <div className="inline-flex rounded-lg bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                model === 'fixed'
                  ? 'bg-white text-[#0a0114]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Fixed Monthly
            </button>
            <button
              type="button"
              onClick={() => setModel('payg')}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                model === 'payg'
                  ? 'bg-white text-[#0a0114]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Pay-As-You-Go
            </button>
          </div>
        </div>

        {/* Fixed Plans Panel */}
        {model === 'fixed' && (
          <div className="mt-12">
            {/* Monthly / Yearly Switch */}
            <div className="flex items-center justify-start gap-3 text-sm">
              <span className={!isYearly ? 'font-medium text-white' : 'text-white/50'}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isYearly ? 'bg-landing-cta' : 'bg-white/20'
                }`}
                aria-label="Toggle yearly discount"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </button>
              <span className={isYearly ? 'font-medium text-white' : 'text-white/50'}>
                Yearly
              </span>
              <span className="text-xs text-emerald-400/90">Save 20%</span>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-xl p-7 ${
                      plan.highlighted
                        ? 'bg-white/[0.06] ring-1 ring-landing-cta/50'
                        : 'bg-white/[0.03]'
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-landing-cta">
                        Popular
                      </span>
                    )}

                    <div>
                      <h3 className="font-landing-display text-lg font-semibold text-white">
                        {plan.name}
                      </h3>
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
                            <Check className="h-4 w-4 text-landing-cta shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-7">
                      <Link href="/register">
                        <Button
                          className={`w-full h-10 text-sm font-semibold ${
                            plan.highlighted
                              ? 'bg-landing-cta hover:bg-landing-cta-hover text-white'
                              : 'bg-white/10 hover:bg-white/15 text-white'
                          }`}
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {model === 'payg' && (
          <div className="mt-12 max-w-xl rounded-xl bg-white/[0.04] p-8">
            <h3 className="font-landing-display text-xl font-semibold text-white">
              Pay only for active subscribers
            </h3>
            <p className="mt-2 text-sm text-white/55">
              {formatBdtWithSymbol(payg.baseFeeBdt)}/mo base + {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
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
                className="w-full accent-landing-cta cursor-pointer"
              />
            </div>

            <div className="mt-8 border-t border-white/[0.07] pt-6">
              <p className="text-xs text-white/40 uppercase tracking-wider">Estimated monthly</p>
              <p className="font-landing-display mt-1 text-3xl font-semibold text-white">
                {formatBdtWithSymbol(paygTotal)}
                <span className="text-base font-normal text-white/40"> / mo</span>
              </p>
            </div>

            <div className="mt-6">
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-10 px-6 text-sm font-semibold text-white">
                  Get started with PAYG
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
