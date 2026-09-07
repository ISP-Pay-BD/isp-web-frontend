'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/features/marketing/shared';
import { useMarketingPricing } from '../hooks/use-marketing-pricing';

interface Plan {
  id: string;
  name: string;
  priceBdt: number;
  period: string;
  customers: string | number | null;
  features: string[];
  highlighted?: boolean;
}

export function PricingPage() {
  const t = useTranslations();
  const { data, isLoading, isError, refetch } = useMarketingPricing();
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
  const [isYearly, setIsYearly] = useState(false);
  const [paygSubscribers, setPaygSubscribers] = useState<number | null>(null);

  const payg = data?.payg;
  const tiers = data?.tiers;
  const plans: Plan[] = useMemo(() => {
    if (!tiers) return [];
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceBdt: tier.priceBdt,
      period: tier.period,
      customers: tier.customers ? `Up to ${tier.customers}` : 'Unlimited',
      features: [...tier.features],
      highlighted: tier.highlight,
    }));
  }, [tiers]);

  const subscriberCount = paygSubscribers ?? payg?.defaultCustomers ?? 500;

  const paygTotal = payg
    ? payg.baseFeeBdt + Math.max(subscriberCount, payg.minCustomers) * payg.pricePerCustomerBdt
    : 0;

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

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-white/50">Loading pricing…</div>
    );
  }

  if (isError || !payg) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-white/70">Failed to load pricing.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.pages.pricing.badge')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.pages.pricing.title')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t('marketing.pages.pricing.subtitle')}
          </p>
        </div>

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

        {model === 'fixed' && (
          <div className="mt-12">
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
              <span className="text-xs text-white/45">Save 20%</span>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan) => {
                const effectivePrice = isYearly ? Math.round(plan.priceBdt * 0.8) : plan.priceBdt;
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-xl border p-6 ${
                      plan.highlighted
                        ? 'border-landing-cta bg-landing-panel'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="mb-3 text-[11px] font-medium text-landing-cta">
                        Most popular
                      </span>
                    )}

                    <div>
                      <h3 className="font-landing-display text-xl font-semibold text-white">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/50">{plan.customers}</p>

                      <div className="mt-5 flex items-baseline">
                        <span className="font-landing-display text-3xl font-semibold tabular-nums text-white">
                          {formatBdtWithSymbol(effectivePrice)}
                        </span>
                        <span className="ml-1 text-sm text-white/45">/ month</span>
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
          <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-white/10 bg-landing-panel/60 p-6 md:p-8">
            <div>
              <p className="text-xs font-medium text-landing-cta">Pay as you grow</p>
              <h3 className="font-landing-display mt-2 text-xl font-semibold text-white">
                Calculate your exact monthly cost
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Base fee of {formatBdtWithSymbol(payg.baseFeeBdt)}/mo + {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">Active Subscriber Count:</span>
                <span className="font-mono text-xl font-bold text-landing-accent">
                  {subscriberCount.toLocaleString()} subscribers
                </span>
              </div>

              <input
                type="range"
                min={payg.minCustomers}
                max={payg.maxCustomers}
                step={payg.step}
                value={subscriberCount}
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
                {formatBdtWithSymbol(payg.baseFeeBdt)} base fee + {formatBdtWithSymbol(subscriberCount * payg.pricePerCustomerBdt)} ({subscriberCount} × ৳{payg.pricePerCustomerBdt})
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
                <p className="mt-2 text-sm text-white/70 leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl border border-landing-cta/30 bg-landing-panel/90 p-8 md:p-12 text-center shadow-xl">
          <h3 className="font-landing-display text-2xl md:text-3xl font-bold text-white">
            Need an enterprise plan for 10,000+ subscribers?
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl mx-auto">
            Custom dedicated database clusters, high-concurrency RouterOS multi-homing, and on-site training for your operations team.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/#contact">
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
