'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Sliders, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { mockFetch } from '@/lib/mock-api/client';
import { useTranslations } from '@/features/marketing/shared';

interface Plan {
  id: string;
  name: string;
  priceBdt: number;
  period: string;
  customers: string | number | null;
  features: string[];
  highlighted?: boolean;
}

interface Payg {
  labelEn: string;
  minCustomers: number;
  maxCustomers: number;
  step: number;
  defaultCustomers: number;
  pricePerCustomerBdt: number;
  baseFeeBdt: number;
}

export function PricingPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [isYearly, setIsYearly] = useState(false);
  const [paygSubscribers, setPaygSubscribers] = useState(500);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payg, setPayg] = useState<Payg>({
    labelEn: 'Pay as you grow',
    minCustomers: 50,
    maxCustomers: 5000,
    step: 50,
    defaultCustomers: 500,
    pricePerCustomerBdt: 12,
    baseFeeBdt: 999,
  });

  useEffect(() => {
    mockFetch('marketing.pricing')
      .then((res) => {
        if (res.plans) {
          setPlans(
            res.plans.map((p) => ({
              ...p,
              customers: typeof p.customers === 'number' ? `Up to ${p.customers}` : p.customers,
            }))
          );
        }
        if (res.payg) {
          setPayg(res.payg);
          setPaygSubscribers(res.payg.defaultCustomers);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paygTotal = payg.baseFeeBdt + Math.max(paygSubscribers, payg.minCustomers) * payg.pricePerCustomerBdt;

  const faqs = [
    {
      q: 'Can I switch between Fixed Plans and PAYG later?',
      a: 'Yes, seamlessly from your admin billing settings with zero service interruption.',
    },
    {
      q: 'Are there router limits or per-seat charges?',
      a: 'Never. All plans include unlimited MikroTik router connections and unlimited staff seats.',
    },
    {
      q: 'How does payment collection work for my fee?',
      a: 'Auto-deduct from your prepaid platform wallet or automated monthly bKash/Nagad invoice.',
    },
    {
      q: 'What happens when my 14-day trial ends?',
      a: 'Your network keeps running safely. You simply select a plan to continue automated billing.',
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 space-y-8 animate-pulse">
        <div className="h-40 rounded-3xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
          <div className="rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.pages.pricing.badge')}
          </span>
          <h1 className="font-landing-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('marketing.pages.pricing.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
            {t('marketing.pages.pricing.subtitle')}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
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
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
                model === 'payg'
                  ? 'bg-landing-cta text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pay-As-You-Grow Wallet
            </button>
          </div>
        </div>

        {/* Fixed Model Content */}
        {model === 'fixed' && (
          <div className="mt-12">
            {/* Monthly/Yearly toggle */}
            <div className="flex items-center justify-center gap-3 text-sm mb-10">
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

            <div className="grid gap-8 md:grid-cols-3">
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

        {/* PAYG Model Content */}
        {model === 'payg' && (
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-landing-cta/40 bg-landing-panel p-8 shadow-xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-landing-cta">
                <Sliders className="h-4 w-4" />
                Dynamic Slider
              </span>
              <h3 className="font-landing-display mt-2 text-2xl font-bold text-white">
                Calculate your exact monthly cost
              </h3>
              <p className="mt-2 text-xs text-white/70">
                Base fee of {formatBdtWithSymbol(payg.baseFeeBdt)}/mo + {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber. No fixed contracts.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">Active Subscriber Count:</span>
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
                {formatBdtWithSymbol(payg.baseFeeBdt)} base fee + {formatBdtWithSymbol(paygSubscribers * payg.pricePerCustomerBdt)} ({paygSubscribers} × ৳{payg.pricePerCustomerBdt})
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-8 text-base font-semibold text-white">
                  Get Started on PAYG
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pricing FAQ */}
        <div className="mt-24 border-t border-white/10 pt-16">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
              Frequently Asked Questions
            </span>
            <h2 className="font-landing-display mt-2 text-3xl font-bold text-white">
              Pricing &amp; Billing Inquiries
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <h4 className="flex items-start gap-2.5 font-landing-display text-base font-bold text-white">
                  <HelpCircle className="h-5 w-5 text-landing-cta shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="mt-2 text-sm text-white/70 leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 rounded-2xl border border-landing-cta/30 bg-landing-panel/90 p-8 md:p-12 text-center shadow-xl">
          <h3 className="font-landing-display text-2xl md:text-3xl font-bold text-white">
            Need an enterprise plan for 10,000+ subscribers?
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl mx-auto">
            Custom dedicated database clusters, high-concurrency RouterOS multi-homing, and on-site training for your operations team.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-7 text-white font-semibold">
                Speak with Enterprise Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
