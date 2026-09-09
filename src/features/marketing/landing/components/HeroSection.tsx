'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useMotionSafe, easeOutExpo } from '@/lib/animations';
import { landingMedia } from '../media';
import type { HeroData, StatsData } from '../types';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HeroSectionProps {
  data: HeroData;
  stats?: StatsData;
}

const LIVE_ROWS = [
  { time: '14:02:11', event: 'bKash TrxID', detail: 'CUST-4091 · ৳800 matched', tone: 'accent' as const },
  { time: '14:02:11', event: 'PPPoE', detail: 'Mirpur-GW-02 · secret active', tone: 'muted' as const },
  { time: '14:01:58', event: 'Expiry', detail: 'CUST-3882 · session cleared', tone: 'muted' as const },
  { time: '14:01:41', event: 'Nagad', detail: 'CUST-2104 · ৳1,200 matched', tone: 'muted' as const },
] as const;

const TRUST_CHIPS = ['Set up in minutes', 'No credit card', 'Cancel anytime'] as const;

const FEATURE_PILLS = [
  'Auto-reconciliation',
  'MikroTik sync',
  'Pay-as-you-go',
  'Bangla app',
] as const;

function cleanCopy(text: string) {
  return text.replace(/\s*[—–]\s*/g, ', ');
}

export function HeroSection({ data, stats }: HeroSectionProps) {
  const { reduced } = useMotionSafe();
  const rootRef = useRef<HTMLElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [activeRow, setActiveRow] = useState(0);
  const trustedCount = stats?.trustedIsps ?? 149;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setActiveRow((i) => (i + 1) % LIVE_ROWS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from('[data-hero-copy]', {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
        });

        if (planeRef.current) {
          gsap.fromTo(
            planeRef.current,
            { scale: 0.94, opacity: 0.45 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: planeRef.current,
                start: 'top 90%',
                end: 'top 42%',
                scrub: true,
              },
            },
          );
        }
      }, rootRef);

      return () => ctx.revert();
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <section id="hero" ref={rootRef} className="relative z-[1] min-h-[100dvh] overflow-hidden pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 50% at 18% 0%, color-mix(in srgb, var(--landing-cta) 16%, transparent), transparent 55%), url('${landingMedia.heroAtmosphere}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.22,
          filter: 'grayscale(1) contrast(1.15) brightness(0.48)',
          mixBlendMode: 'luminosity',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-14 md:grid-cols-12 md:gap-8 md:px-6 md:pt-16 md:pb-20">
        <div className="md:col-span-7 lg:col-span-8">
          <p data-hero-copy className="text-sm font-medium text-white/55">
            {data.badge ?? `Trusted by ${trustedCount}+ ISPs across Bangladesh`}
          </p>

          <p
            data-hero-copy
            className="font-landing-display mt-4 text-sm font-semibold tracking-tight text-white"
          >
            {siteConfig.name}
          </p>

          <h1
            data-hero-copy
            className="font-landing-display mt-4 w-full max-w-5xl text-[clamp(2.5rem,5vw,4.75rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-white text-balance"
          >
            Run your whole{' '}
            <motion.span
              className="mx-1.5 inline-block h-9 w-20 align-middle overflow-hidden rounded-full bg-cover bg-center sm:h-11 sm:w-28"
              style={{
                backgroundImage: `url('${landingMedia.heroInlineRack}')`,
                filter: 'grayscale(0.25) contrast(1.1)',
              }}
              aria-hidden
              animate={reduced ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />{' '}
            ISP from one console
          </h1>

          <p
            data-hero-copy
            className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            {cleanCopy(data.subtitleEn)}
          </p>

          <div data-hero-copy className="mt-9 flex flex-wrap items-center gap-3.5">
            <Button
              nativeButton={false}
              render={<Link href="/register" />}
              className="group bg-landing-cta hover:bg-landing-cta-hover relative h-13 overflow-hidden rounded-full pl-7 pr-2 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(247,88,3,0.35)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_0_40px_rgba(247,88,3,0.45)] active:scale-[0.98]"
            >
              <span className="mr-3">{data.ctaPrimary}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                ↗
              </span>
            </Button>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<a href="#auto-reconcile" />}
              className="h-13 rounded-full border border-white/15 bg-white/4 px-7 text-sm font-medium text-white backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:bg-white/8 active:scale-[0.98]"
            >
              {data.ctaSecondary}
            </Button>
          </div>

          <ul
            data-hero-copy
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45 sm:text-sm"
          >
            {TRUST_CHIPS.map((chip) => (
              <li key={chip} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-landing-cta" aria-hidden />
                {chip}
              </li>
            ))}
          </ul>

          <ul data-hero-copy className="mt-8 flex flex-wrap gap-2">
            {FEATURE_PILLS.map((pill, i) => (
              <motion.li
                key={pill}
                className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.4, ease: easeOutExpo }}
              >
                {pill}
              </motion.li>
            ))}
          </ul>
        </div>

        <div data-hero-copy className="relative hidden md:col-span-5 md:block lg:col-span-4">
          {/* Subtle Ambient Glow Behind Card */}
          <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-tr from-landing-cta/20 via-purple-500/10 to-transparent blur-2xl" />

          <motion.div
            className="group relative overflow-hidden rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 shadow-[0_24px_80px_rgba(12,1,24,0.7)] backdrop-blur-xl transition-all duration-700 hover:ring-white/20"
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-landing-panel shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url('${landingMedia.features[1]}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'contrast(1.15) brightness(0.72)',
                }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-landing-bg via-landing-bg/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="font-mono text-xs font-medium tracking-wide text-white/80">NOC · live fiber telemetry</p>
                </div>
                <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] text-white/60 backdrop-blur-sm">
                  10Gbps
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        ref={planeRef}
        className="relative mx-auto max-w-6xl px-4 md:px-6 will-change-transform"
      >
        <div className="overflow-hidden rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] bg-landing-panel/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-landing-display truncate text-sm font-semibold text-white">
                  Operator console
                </span>
                <span className="hidden font-mono text-[11px] text-white/35 sm:inline">
                  collections · live
                </span>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Online
              </span>
            </div>
            <div className="px-5">
              <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] tracking-wide text-white/35">
                <th className="py-3 pr-3 font-medium">Time</th>
                <th className="py-3 pr-3 font-medium">Event</th>
                <th className="hidden py-3 font-medium sm:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs sm:text-[13px]">
              {LIVE_ROWS.map((row, i) => {
                const hot = i === activeRow;
                return (
                  <tr
                    key={`${row.time}-${row.event}`}
                    className={`border-b border-white/6 last:border-0 transition-colors duration-500 ${
                      hot ? 'bg-landing-cta/8' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap py-3.5 pr-3 text-white/40">{row.time}</td>
                    <td
                      className={`whitespace-nowrap py-3.5 pr-3 transition-colors duration-500 ${
                        hot || row.tone === 'accent' ? 'text-landing-cta' : 'text-white/80'
                      }`}
                    >
                      {row.event}
                    </td>
                    <td className="hidden py-3.5 text-white/55 sm:table-cell">{row.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
