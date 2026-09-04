'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HeroData } from '../types';

interface HeroSectionProps {
  data: HeroData;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section id="hero" className="relative overflow-hidden pt-10 pb-16 md:pt-14 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="font-landing-display text-sm font-semibold tracking-[0.18em] uppercase text-landing-cta"
            >
              ISP Pay BD
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className="font-landing-display mt-4 text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
            >
              Billing, MikroTik sync &amp; bKash — one operator console.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease }}
              className="mt-5 max-w-md text-base leading-relaxed text-white/65"
            >
              Payments match to subscribers in under a second. Lines reconnect automatically. Your team stops chasing TrxIDs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-6 text-sm font-semibold text-white">
                  {data.ctaPrimary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#auto-reconcile">
                <Button
                  variant="outline"
                  className="h-11 border-white/15 bg-transparent px-5 text-sm font-medium text-white/90 hover:bg-white/5 hover:border-white/25"
                >
                  {data.ctaSecondary}
                </Button>
              </a>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              className="mt-8 space-y-2 text-sm text-white/55"
            >
              {['14-day full trial', 'No card required', 'Zero-downtime migration'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-landing-cta" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Product console — signature visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease }}
            className="lg:col-span-7"
          >
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12061f]">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-3 font-mono text-[11px] text-white/40">
                    console.isppaybd.com / collections
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-wide text-emerald-400/90">LIVE</span>
              </div>

              <div className="grid gap-0 md:grid-cols-12">
                <div className="hidden border-r border-white/8 p-4 md:col-span-3 md:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Today</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Collected', value: '৳1.84L' },
                      { label: 'Matched', value: '214' },
                      { label: 'Due', value: '45' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between">
                        <span className="text-xs text-white/45">{row.label}</span>
                        <span className="font-mono text-sm font-medium text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 md:col-span-9 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-white/50">Auto-reconcile feed</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">bKash → invoice → MikroTik</p>
                    </div>
                    <span className="font-mono text-[11px] text-landing-accent">p50 780ms</span>
                  </div>

                  <div className="mt-4 space-y-2 font-mono text-[11px] sm:text-xs">
                    <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-emerald-300/90">
                      14:02:18 · TrxID 9K42X1 matched CUST-4091 · ৳800
                    </div>
                    <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-sky-300/90">
                      14:02:19 · RouterOS CoA · PPPoE session restored
                    </div>
                    <div className="rounded-lg bg-white/[0.04] px-3 py-2.5 text-white/55">
                      14:02:20 · SMS sent · +880 1711-XXXXXX
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Online sessions', value: '2,132' },
                      { label: 'NAS online', value: '6 / 6' },
                      { label: 'Match rate', value: '99.9%' },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-white/[0.03] px-3 py-2.5">
                        <p className="text-[10px] text-white/40">{m.label}</p>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
