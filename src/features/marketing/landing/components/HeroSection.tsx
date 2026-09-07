'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { easeOutExpo, useMotionSafe } from '@/lib/animations';
import type { HeroData } from '../types';

interface HeroSectionProps {
  data: HeroData;
}

const TRUST = ['Set up in minutes', 'No credit card', 'Cancel anytime'] as const;

const STACK = [
  { label: 'MikroTik', detail: 'PPPoE & hotspot sync' },
  { label: 'bKash / Nagad', detail: 'Auto-reconcile TrxID' },
  { label: 'OLT / ONU', detail: 'Fiber provisioning' },
  { label: 'RADIUS', detail: 'Auth & accounting' },
] as const;

export function HeroSection({ data }: HeroSectionProps) {
  const { reduced } = useMotionSafe();

  return (
    <section id="hero" className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="bg-grid-ambient absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: easeOutExpo }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-landing-cta" />
              {data.badge}
            </p>

            <h1 className="font-landing-display mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.25rem]">
              {data.titleEn}
            </h1>

            <p className="mt-4 max-w-xl text-lg font-medium leading-snug text-landing-cta sm:text-xl">
              {data.subtitleEn}
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
              Payments match to subscribers in under a second. PPPoE secrets provision
              instantly. Your team stops chasing TrxIDs across spreadsheets.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                render={<Link href="/register" />}
                className="h-11 rounded-xl bg-landing-cta px-6 text-sm font-semibold text-white hover:bg-landing-cta-hover"
              >
                {data.ctaPrimary}
              </Button>
              <Button
                variant="outline"
                render={<a href="#auto-reconcile" />}
                className="h-11 rounded-xl border-white/15 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/[0.06] hover:text-white"
              >
                {data.ctaSecondary}
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.08, ease: easeOutExpo }}
            className="relative"
            aria-hidden={false}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12061f]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="font-landing-display text-sm font-semibold text-white">ISP Pay BD</p>
                  <p className="font-mono text-[10px] text-white/40">operator-console · live</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                  ONLINE
                </span>
              </div>

              <div className="space-y-2 p-4 font-mono text-xs">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-white/70">
                  PPPoE sync · 4 MikroTik gateways · 0.04s
                </div>
                <div className="rounded-lg border border-landing-cta/20 bg-landing-cta/10 px-3 py-2.5 text-landing-cta">
                  bKash TrxID matched · CUST-4091 · ৳800
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-white/70">
                  RouterOS API · profile active · line unblocked
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
                {STACK.map((item) => (
                  <div key={item.label} className="bg-[#12061f] px-4 py-3">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-white/45">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
