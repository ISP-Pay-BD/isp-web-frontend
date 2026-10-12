'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBdtWithSymbol } from '@/lib/format';
import { useTranslations } from '@/features/marketing/shared';
import { Reveal } from '@/components/motion/Reveal';
import { useMarketingPricing } from '../hooks/use-marketing-pricing';

interface Plan {
  id: string;
  name: string;
  priceBdt: number;
  period: string;
  customers: string;
  features: string[];
}

/** Calculator slider range — a UI control, not pricing data. */
const PAYG_SLIDER = { min: 50, max: 5000, step: 50, initial: 500 } as const;

export function PricingPage() {
  const t = useTranslations();
  const { data, isLoading, isError, refetch } = useMarketingPricing();
  const [model, setModel] = useState<'fixed' | 'payg'>('fixed');
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
      customers: tier.customers ? `Up to ${tier.customers.toLocaleString()} subscribers` : 'Unlimited subscribers',
      features: [...tier.features],
    }));
  }, [tiers]);

  const subscriberCount = paygSubscribers ?? PAYG_SLIDER.initial;
  const paygTotal = payg ? payg.baseFeeBdt + subscriberCount * payg.pricePerCustomerBdt : 0;
  const trialDays = data?.trialDays ?? 0;

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
    ...(trialDays > 0
      ? [
          {
            q: `What happens when my ${trialDays}-day trial ends?`,
            a: 'Your network keeps running safely. You simply select a plan to continue automated billing.',
          },
        ]
      : []),
  ];

  if (isLoading) {
    return <div className="py-24 text-center text-sm text-white/50">Loading pricing…</div>;
  }

  if (isError || !data) {
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
        <Reveal className="max-w-2xl">
          <p className="text-landing-cta text-xs font-medium tracking-[0.08em]">
            {t('marketing.pages.pricing.badge')}
          </p>
          <h1 className="font-landing-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('marketing.pages.pricing.title')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {t('marketing.pages.pricing.subtitle')}
          </p>
        </Reveal>

        <Reveal className={`mt-12 justify-center ${payg ? 'flex' : 'hidden'}`} delay={0.05}>
          <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setModel('fixed')}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition duration-200 ease-out ${
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
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition duration-200 ease-out ${
                model === 'payg'
                  ? 'bg-landing-cta text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pay-As-You-Grow Wallet
            </button>
          </div>
        </Reveal>

        <Reveal className="mt-12" delay={0.08}>
          {model === 'fixed' && (
            <div>
              <div className="grid gap-8 md:grid-cols-3">
                {plans.length === 0 ? (
                  <p className="text-center text-sm text-white/60 md:col-span-3">
                    Plans are being updated. Please contact us for current pricing.
                  </p>
                ) : null}
                {plans.map((plan) => {
                  return (
                    <div
                      key={plan.id}
                      className="relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-6"
                    >

                      <div>
                        <h3 className="font-landing-display text-xl font-semibold text-white">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-xs text-white/50">{plan.customers}</p>

                        <div className="mt-5 flex items-baseline">
                          <span className="font-landing-display text-3xl font-semibold text-white tabular-nums">
                            {formatBdtWithSymbol(plan.priceBdt)}
                          </span>
                          <span className="ml-1 text-sm text-white/45">/ {plan.period}</span>
                        </div>

                        <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-6 text-sm text-white/80">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Check className="text-landing-cta mt-0.5 h-4 w-4 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4">
                        <Link href="/register">
                          <Button
                            className="bg-landing-cta hover:bg-landing-cta-hover h-10 w-full text-sm font-semibold text-white"
                          >
                            {trialDays > 0 ? 'Start Free Trial' : 'Get Started'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {model === 'payg' && payg && (
            <div className="bg-landing-panel/60 mx-auto max-w-2xl rounded-xl border border-white/10 p-6 md:p-8">
              <div>
                <p className="text-landing-cta text-xs font-medium">Pay as you grow</p>
                <h3 className="font-landing-display mt-2 text-xl font-semibold text-white">
                  Calculate your exact monthly cost
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  Base fee of {formatBdtWithSymbol(payg.baseFeeBdt)}/mo +{' '}
                  {formatBdtWithSymbol(payg.pricePerCustomerBdt)} per subscriber.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Active Subscriber Count:</span>
                  <span className="text-landing-accent font-mono text-xl font-bold">
                    {subscriberCount.toLocaleString()} subscribers
                  </span>
                </div>

                <input
                  type="range"
                  min={PAYG_SLIDER.min}
                  max={PAYG_SLIDER.max}
                  step={PAYG_SLIDER.step}
                  value={subscriberCount}
                  onChange={(e) => setPaygSubscribers(Number(e.target.value))}
                  className="accent-landing-cta w-full cursor-pointer"
                />

                <div className="flex justify-between font-mono text-[11px] text-white/40">
                  <span>{PAYG_SLIDER.min}</span>
                  <span>{((PAYG_SLIDER.min + PAYG_SLIDER.max) / 2).toLocaleString()}</span>
                  <span>{PAYG_SLIDER.max.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <span className="text-xs tracking-wide text-white/60">
                  Total Estimated Monthly Deduct
                </span>
                <div className="font-landing-display mt-2 text-4xl font-extrabold text-white sm:text-5xl">
                  {formatBdtWithSymbol(paygTotal)}
                  <span className="text-base font-normal text-white/50"> / month</span>
                </div>
                <p className="mt-2 font-mono text-xs text-emerald-400">
                  {formatBdtWithSymbol(payg.baseFeeBdt)} base fee +{' '}
                  {formatBdtWithSymbol(subscriberCount * payg.pricePerCustomerBdt)} (
                  {subscriberCount} × ৳{payg.pricePerCustomerBdt})
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
        </Reveal>

        <Reveal className="mt-24 border-t border-white/10 pt-16" delay={0.04}>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-landing-cta text-xs font-medium tracking-wide">
              Frequently Asked Questions
            </span>
            <h2 className="font-landing-display mt-2 text-3xl font-bold text-white">
              Pricing &amp; Billing Inquiries
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <h4 className="font-landing-display flex items-start gap-2.5 text-base font-bold text-white">
                  <HelpCircle className="text-landing-cta mt-0.5 h-5 w-5 shrink-0" />
                  {faq.q}
                </h4>
                <p className="mt-2 pl-7 text-sm leading-relaxed text-white/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="border-landing-cta/30 bg-landing-panel/90 mt-20 rounded-2xl border p-8 text-center shadow-[var(--shadow-md)] md:p-12">
          <h3 className="font-landing-display text-2xl font-bold text-white md:text-3xl">
            Need an enterprise plan for 10,000+ subscribers?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 md:text-base">
            Custom dedicated database clusters, high-concurrency RouterOS multi-homing, and on-site
            training for your operations team.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-7 font-semibold text-white">
                Speak with Enterprise Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
