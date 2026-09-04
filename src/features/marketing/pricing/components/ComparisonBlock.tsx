'use client';

import Link from 'next/link';
import { Check, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  comparisonGroups,
  comparisonPlans,
  type FeatureValue,
} from '@/data/marketing/pricing.data';
import { cn } from '@/lib/utils';

/* ── Cell renderer ────────────────────────────────────────────────────── */

function FeatureCell({ value, highlighted }: { value: FeatureValue; highlighted?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/15">
        <Check className="size-3.5 text-emerald-400" />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/5">
        <Minus className="size-3.5 text-white/25" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-sm font-medium',
        highlighted ? 'text-white' : 'text-white/80'
      )}
    >
      {value}
    </span>
  );
}

/* ── Mobile Card Layout ───────────────────────────────────────────────── */

function MobilePlanCard({ planIndex }: { planIndex: number }) {
  const plan = comparisonPlans[planIndex];

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border p-5',
        plan.highlighted
          ? 'border-landing-cta/40 bg-landing-panel shadow-xl shadow-orange-500/5'
          : 'border-white/10 bg-white/[0.02]'
      )}
    >
      {/* Plan header */}
      <div className="text-center">
        {plan.highlighted && (
          <span className="mb-2 inline-block rounded-full bg-landing-cta px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Most Popular
          </span>
        )}
        <h3 className="font-landing-display text-xl font-bold text-white">{plan.name}</h3>
        <p className="mt-0.5 text-xs text-white/50">{plan.subtitle}</p>
        <div className="mt-3 flex items-baseline justify-center gap-1">
          {plan.priceBdt !== null ? (
            <>
              <span className="text-3xl font-extrabold text-white">
                ৳{plan.priceBdt.toLocaleString()}
              </span>
              <span className="text-xs text-white/40">{plan.period}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-white">Custom</span>
          )}
        </div>
      </div>

      {/* Feature groups */}
      <div className="mt-6 space-y-5">
        {comparisonGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-landing-cta">
              {group.title}
            </div>
            <div className="space-y-2.5">
              {group.features.map((feature) => (
                <div key={feature.label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">{feature.label}</span>
                  <FeatureCell value={feature.values[planIndex]} highlighted={plan.highlighted} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link href="/register" className="block">
          <Button
            className={cn(
              'h-11 w-full text-sm font-semibold',
              plan.highlighted
                ? 'bg-landing-cta hover:bg-landing-cta-hover text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white'
            )}
          >
            {plan.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ── Desktop Table Layout ─────────────────────────────────────────────── */

function DesktopTable() {
  return (
    <>
      <div className="mt-14 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 w-[260px] bg-[#0c0118] pb-4 pt-2 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Features
                </span>
              </th>
              {comparisonPlans.map((plan) => (
                <th
                  key={plan.id}
                  className={cn(
                    'relative w-[180px] px-4 pb-4 pt-2 text-center',
                    plan.highlighted && 'z-10'
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-x-0 -top-2 bottom-0 rounded-t-2xl',
                      plan.highlighted
                        ? 'bg-landing-panel border border-b-0 border-landing-cta/40 shadow-xl shadow-orange-500/5'
                        : 'bg-transparent'
                    )}
                  />
                  <div className="relative">
                    {plan.highlighted && (
                      <span className="mb-2 inline-block rounded-full bg-landing-cta px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-landing-display text-lg font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/50">{plan.subtitle}</p>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      {plan.priceBdt !== null ? (
                        <>
                          <span className="text-2xl font-extrabold text-white">
                            ৳{plan.priceBdt.toLocaleString()}
                          </span>
                          <span className="text-xs text-white/40">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-white">Custom</span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonGroups.map((group) => (
              <ComparisonGroup key={group.title} group={group} />
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA row */}
      <div className="mt-10 grid min-w-[640px] grid-cols-4 gap-4">
        <div />
        {comparisonPlans.map((plan) => (
          <div key={plan.id} className="flex justify-center px-4">
            <Link href="/register" className="w-full">
              <Button
                className={cn(
                  'h-11 w-full text-sm font-semibold',
                  plan.highlighted
                    ? 'bg-landing-cta hover:bg-landing-cta-hover text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */

export default function ComparisonBlock() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            Feature Comparison
          </span>
          <h2 className="font-landing-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Compare plans side by side
          </h2>
          <p className="mt-4 text-base text-white/60 leading-relaxed">
            Every ISP Pay BD plan scales with you. Compare features and upgrade the moment you need more.
          </p>
        </div>

        {/* Mobile: Stacked cards */}
        <div className="mt-14 grid gap-6 md:hidden">
          {[1, 0, 2].map((i) => (
            <MobilePlanCard key={comparisonPlans[i].id} planIndex={i} />
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <DesktopTable />
        </div>
      </div>
    </section>
  );
}

/* ── Group Sub-component (Desktop) ────────────────────────────────────── */

function ComparisonGroup({ group }: { group: (typeof comparisonGroups)[number] }) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold uppercase tracking-wider text-landing-cta"
        >
          {group.title}
        </td>
      </tr>
      {group.features.map((feature) => (
        <tr key={feature.label} className="group/row transition-colors hover:bg-white/[0.015]">
          <td className="sticky left-0 z-10 bg-[#0c0118] px-4 py-3 text-sm text-white/70 group-hover/row:bg-[#0c0118]">
            {feature.label}
          </td>
          {feature.values.map((value, i) => (
            <td
              key={i}
              className={cn(
                'px-4 py-3 text-center',
                comparisonPlans[i].highlighted && 'bg-landing-panel/60'
              )}
            >
              <div className="flex items-center justify-center">
                <FeatureCell value={value} highlighted={comparisonPlans[i].highlighted} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
