'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sliders } from 'lucide-react';
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
    <section id="pricing" className="py-20 md:py-28 bg-landing-panel/60 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Simple, Transparent Pricing
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Priced per subscriber, not per promise.
          </h2>
          <p className="mt-4 text-base text-white/70">
            Lock a predictable fixed monthly plan, or go Pay-As-You-Go with our prepaid wallet: ৳1.5/subscriber without tier traps.
          </p>
        </div>

        {/* Pricing Model Tabs */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
                model === 'fixed'
                  ? 'bg-landing-cta text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Fixed Monthly Plans
            </button>
            <button
              type="button"
              onClick={() => setModel('payg')}
              className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
                model === 'payg'
                  ? 'bg-landing-cta text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pay-As-You-Go Wallet
            </button>
          </div>
        </div>

        {/* Fixed Plans Panel */}
        {model === 'fixed' && (
          <div className="mt-12">
            {/* Monthly / Yearly Switch */}
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className={!isYearly ? 'font-semibold text-white' : 'text-white/60'}>
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
              <span className={isYearly ? 'font-semibold text-white' : 'text-white/60'}>
                Yearly
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </div>

            {/* Plans Grid */}
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {plans.map((plan) => {
                const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-xl transition-all ${
                      plan.highlighted
                        ? 'border-landing-cta bg-landing-panel shadow-2xl shadow-orange-500/10 scale-105'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-landing-cta px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h3 className="font-landing-display text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/60 font-medium">
                        {plan.customers}
                      </p>

                      <div className="mt-6 flex items-baseline">
                        <span className="font-landing-display text-4xl font-black text-white">
                          {formatBdtWithSymbol(effectivePrice)}
                        </span>
                        <span className="ml-1 text-sm text-white/50">/ month</span>
                      </div>

                      <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-6 text-sm text-white/80">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-landing-cta shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4">
                      <Link href="/register">
                        <Button
                          className={`w-full h-11 text-base font-semibold ${
                            plan.highlighted
                              ? 'bg-landing-cta hover:bg-landing-cta-hover text-white shadow-lg shadow-orange-500/20'
                              : 'bg-white/10 hover:bg-white/20 text-white'
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

        {/* PAYG Wallet Panel */}
        {model === 'payg' && (
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-landing-cta/40 bg-landing-panel p-8 shadow-xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-landing-cta">
                <Sliders className="h-4 w-4" />
                Live Calculator
              </span>
              <h3 className="font-landing-display mt-2 text-2xl font-bold text-white">
                Pay only for subscribers you actively manage
              </h3>
              <p className="mt-2 text-xs text-white/70">
                Base fee of {formatBdtWithSymbol(payg.baseFeeBdt)}/mo + {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber. No monthly lock-in.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">Your subscriber count:</span>
                <span className="font-mono text-xl font-bold text-landing-accent">
                  {paygSubscribers.toLocaleString()} subscribers
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

              <div className="flex justify-between text-[11px] font-mono text-white/40">
                <span>{payg.minCustomers}</span>
                <span>2,500</span>
                <span>{payg.maxCustomers.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <span className="text-xs text-white/60 uppercase tracking-wider">
                Total Estimated Monthly Deduct
              </span>
              <div className="font-landing-display mt-2 text-4xl sm:text-5xl font-extrabold text-white">
                {formatBdtWithSymbol(paygTotal)}
                <span className="text-base font-normal text-white/50"> / month</span>
              </div>
              <p className="mt-2 text-xs text-emerald-400 font-mono">
                {formatBdtWithSymbol(payg.baseFeeBdt)} platform fee + {formatBdtWithSymbol(paygSubscribers * payg.pricePerCustomerBdt)} ({paygSubscribers} × ৳{payg.pricePerCustomerBdt})
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-8 text-base font-semibold text-white">
                  Get Started with PAYG Wallet
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
