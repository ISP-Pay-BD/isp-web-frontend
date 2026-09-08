'use client';

import Link from 'next/link';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useMotionSafe } from '@/lib/animations';
import type { HeroData } from '../types';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
  const rootRef = useRef<HTMLElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

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
            { scale: 0.88, opacity: 0.45 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: planeRef.current,
                start: 'top 85%',
                end: 'top 35%',
                scrub: true,
              },
            },
          );

          gsap.to(planeRef.current, {
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: planeRef.current,
              start: 'bottom 55%',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      }, rootRef);

      return () => ctx.revert();
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <section id="hero" ref={rootRef} className="relative overflow-hidden pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% -5%, color-mix(in srgb, var(--landing-cta) 18%, transparent), transparent 58%), url('https://picsum.photos/seed/isp-fiber-night/1920/1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.22,
          filter: 'grayscale(1) contrast(1.15) brightness(0.55)',
          mixBlendMode: 'luminosity',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--landing-cta) 12%, transparent), transparent 60%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-16 text-center md:px-6 md:pt-24 md:pb-20">
        <p
          data-hero-copy
          className="font-landing-display text-sm font-semibold tracking-wide text-white sm:text-base"
        >
          {siteConfig.name}
        </p>

        <h1
          data-hero-copy
          className="font-landing-display mt-5 w-full max-w-6xl text-[clamp(2.75rem,5.2vw,5.25rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-white text-balance"
        >
          Run your whole{' '}
          <span
            className="mx-2 inline-block h-9 w-20 align-middle rounded-full bg-cover bg-center sm:h-11 sm:w-28"
            style={{
              backgroundImage: "url('https://picsum.photos/seed/mikrotik-rack/320/160')",
              filter: 'grayscale(0.35) contrast(1.1)',
            }}
            aria-hidden
          />{' '}
          ISP from one console
        </h1>

        <p
          data-hero-copy
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          {data.subtitleEn}
        </p>

        <div data-hero-copy className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/register" />}
            className="bg-landing-cta hover:bg-landing-cta-hover h-12 rounded-full px-7 text-sm font-semibold text-white"
          >
            {data.ctaPrimary}
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<a href="#auto-reconcile" />}
            className="h-12 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-white hover:bg-white/[0.08]"
          >
            {data.ctaSecondary}
          </Button>
        </div>
      </div>

      <div
        ref={planeRef}
        className="relative origin-center border-y border-white/10 bg-landing-panel will-change-transform"
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
            <div className="border-b border-white/10 py-5 lg:col-span-4 lg:border-r lg:border-b-0 lg:border-white/10 lg:py-6 lg:pr-8">
              <p className="text-xs text-white/40">Today collected</p>
              <p className="font-landing-display mt-1 text-3xl font-semibold tracking-tight text-white">
                ৳1,84,600
              </p>
              <p className="mt-2 font-mono text-xs text-white/45">142 payments · 98% auto-matched</p>
            </div>

            <div className="lg:col-span-8 lg:pl-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] tracking-wide text-white/35">
                    <th className="py-3 pr-3 font-medium">Time</th>
                    <th className="py-3 pr-3 font-medium">Event</th>
                    <th className="hidden py-3 font-medium sm:table-cell">Detail</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs sm:text-[13px]">
                  {LIVE_ROWS.map((row) => (
                    <tr
                      key={`${row.time}-${row.event}`}
                      className="border-b border-white/[0.06] last:border-0"
                    >
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
      </div>
    </section>
  );
}
