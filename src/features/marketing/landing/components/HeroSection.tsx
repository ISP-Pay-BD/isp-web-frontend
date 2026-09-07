'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { easeOutExpo, useMotionSafe } from '@/lib/animations';
import type { HeroData } from '../types';

interface HeroSectionProps {
  data: HeroData;
}

const LIVE_ROWS = [
  { time: '14:02:11', event: 'bKash TrxID', detail: 'CUST-4091 · ৳800 matched', tone: 'accent' as const },
  { time: '14:02:11', event: 'PPPoE', detail: 'Mirpur-GW-02 · secret active', tone: 'muted' as const },
  { time: '14:01:58', event: 'Expiry', detail: 'CUST-3882 · session cleared', tone: 'muted' as const },
  { time: '14:01:41', event: 'Nagad', detail: 'CUST-2104 · ৳1,200 matched', tone: 'muted' as const },
] as const;

export function HeroSection({ data }: HeroSectionProps) {
  const { reduced } = useMotionSafe();

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Atmosphere — soft brand wash only, no orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--landing-cta) 14%, transparent), transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-10 md:px-6 md:pt-32 md:pb-14">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.35, ease: easeOutExpo }}
          className="max-w-3xl"
        >
          <p className="font-landing-display text-sm font-semibold tracking-wide text-white/90 sm:text-base">
            {siteConfig.name}
          </p>

          <h1 className="font-landing-display mt-5 text-[2.125rem] font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.5rem]">
            {data.titleEn}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            {data.subtitleEn}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              render={<Link href="/register" />}
              className="h-12 rounded-lg bg-landing-cta px-6 text-sm font-semibold text-white hover:bg-landing-cta-hover"
            >
              {data.ctaPrimary}
            </Button>
            <Button
              variant="ghost"
              render={<a href="#auto-reconcile" />}
              className="h-12 rounded-lg px-4 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              {data.ctaSecondary}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Full-bleed product plane — signature visual */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.06, ease: easeOutExpo }}
        className="relative border-y border-white/10 bg-[#10061c]"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-landing-display truncate text-sm font-semibold text-white">
                Operator console
              </span>
              <span className="hidden font-mono text-[11px] text-white/35 sm:inline">
                collections · live
              </span>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Online
            </span>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="border-b border-white/10 py-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-white/10 lg:pr-8 lg:py-6">
              <p className="text-xs text-white/40">Today collected</p>
              <p className="font-landing-display mt-1 text-3xl font-semibold tracking-tight text-white">
                ৳1,84,600
              </p>
              <p className="mt-2 font-mono text-xs text-white/45">142 payments · 98% auto-matched</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-white/40">Active lines</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-white">4,218</dd>
                </div>
                <div>
                  <dt className="text-white/40">Expired today</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-white">37</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-8 lg:pl-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/35">
                    <th className="py-3 pr-3 font-medium">Time</th>
                    <th className="py-3 pr-3 font-medium">Event</th>
                    <th className="hidden py-3 font-medium sm:table-cell">Detail</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs sm:text-[13px]">
                  {LIVE_ROWS.map((row) => (
                    <tr key={`${row.time}-${row.event}`} className="border-b border-white/[0.06] last:border-0">
                      <td className="whitespace-nowrap py-3.5 pr-3 text-white/40">{row.time}</td>
                      <td
                        className={`whitespace-nowrap py-3.5 pr-3 ${
                          row.tone === 'accent' ? 'text-landing-cta' : 'text-white/80'
                        }`}
                      >
                        {row.event}
                      </td>
                      <td className="hidden py-3.5 text-white/55 sm:table-cell">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
