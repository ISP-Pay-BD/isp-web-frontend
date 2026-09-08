'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HowItWorksStep } from '../types';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

const PANEL_SEEDS = ['connect-mt', 'import-csv', 'bkash-desk', 'live-ops'] as const;

export function HowItWorks({ steps }: HowItWorksProps) {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-landing-display text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight text-white text-balance">
              Live this week — history intact
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              Self-serve trial in minutes, or a guided migration in 2–5 days with zero subscriber
              downtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 rounded-full px-5 text-sm font-semibold text-white">
                Start trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="ghost"
                className="h-11 rounded-full border border-white/15 px-4 text-sm text-white hover:bg-white/[0.06]"
              >
                Book migration
              </Button>
            </a>
          </div>
        </div>

        <div
          className="mt-16 hidden h-[28rem] overflow-hidden rounded-2xl border border-white/10 md:flex"
          onMouseLeave={() => setActive(0)}
        >
          {steps.map((item, i) => {
            const open = active === i;
            return (
              <button
                key={item.step}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`relative flex h-full flex-col overflow-hidden border-r border-white/10 text-left last:border-r-0 transition-[flex] duration-500 ease-out ${
                  open ? 'flex-[3.2]' : 'flex-[0.85]'
                }`}
                aria-expanded={open}
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage: `url('https://picsum.photos/seed/${PANEL_SEEDS[i] ?? 'isp-step'}/900/1200')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(1) contrast(1.15) brightness(0.4)',
                    transform: open ? 'scale(1.05)' : 'scale(1)',
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-landing-bg via-landing-bg/50 to-transparent" />
                <div className="relative mt-auto p-6">
                  <h3
                    className={`font-landing-display font-semibold text-white transition-all duration-300 ${
                      open ? 'text-2xl' : 'text-sm'
                    }`}
                    style={
                      open
                        ? undefined
                        : { writingMode: 'vertical-rl', transform: 'rotate(180deg)' }
                    }
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-sm text-sm leading-relaxed text-white/65 transition-opacity duration-300 ${
                      open ? 'opacity-100' : 'pointer-events-none h-0 opacity-0'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <ul className="mt-10 space-y-4 md:hidden">
          {steps.map((item) => (
            <li
              key={item.step}
              className="overflow-hidden rounded-xl border border-white/10 bg-landing-panel p-5"
            >
              <h3 className="font-landing-display text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
