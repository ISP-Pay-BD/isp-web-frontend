'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { landingMedia } from '../media';
import type { HowItWorksStep } from '../types';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

function cleanCopy(text: string) {
  return text.replace(/\s*[—–]\s*/g, ', ');
}

export function HowItWorks({ steps }: HowItWorksProps) {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-landing-display text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight text-white text-balance">
              Go live this week — with history intact
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              Self-serve trial in minutes, or a guided migration in 2–5 days with zero subscriber
              downtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 rounded-full px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98]">
                Start trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="ghost"
                className="h-11 rounded-full border border-white/15 px-4 text-sm text-white transition-colors hover:bg-white/6 active:scale-[0.98]"
              >
                Book migration
              </Button>
            </a>
          </div>
        </div>

        <div
          className="mt-16 hidden h-112 overflow-hidden rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl md:flex"
          onMouseLeave={() => setActive(0)}
        >
          <div className="flex h-full w-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-landing-panel shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {steps.map((item, i) => {
              const open = active === i;
              const image = landingMedia.howItWorks[i] ?? landingMedia.howItWorks[0];
              return (
                <button
                  key={item.step}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`relative flex h-full flex-col overflow-hidden border-r border-white/10 text-left last:border-r-0 transition-[flex] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    open ? 'flex-[3.2]' : 'flex-[0.85]'
                  }`}
                  aria-expanded={open}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out"
                    style={{
                      backgroundImage: `url('${image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'contrast(1.15) brightness(0.48)',
                      transform: open ? 'scale(1.05)' : 'scale(1)',
                    }}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-landing-bg via-landing-bg/50 to-transparent" />
                  <div className="relative mt-auto p-7">
                    <span className="mb-2 inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-landing-cta backdrop-blur-sm">
                      Step {i + 1}
                    </span>
                    <h3
                      className={`font-landing-display font-semibold text-white transition-all duration-300 ${
                        open ? 'text-2xl' : 'text-sm'
                      }`}
                      style={
                        open ? undefined : { writingMode: 'vertical-rl', transform: 'rotate(180deg)' }
                      }
                    >
                      {cleanCopy(item.title)}
                    </h3>
                    <p
                      className={`mt-3 max-w-sm text-sm leading-relaxed text-white/70 transition-opacity duration-300 ${
                        open ? 'opacity-100' : 'pointer-events-none h-0 opacity-0'
                      }`}
                    >
                      {cleanCopy(item.desc)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
          {steps.map((item, i) => {
            const image = landingMedia.howItWorks[i] ?? landingMedia.howItWorks[0];
            return (
              <article
                key={item.step}
                className="w-[82vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10"
              >
                <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] bg-landing-panel">
                  <div
                    className="aspect-16/10 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${image}')`,
                      filter: 'contrast(1.15) brightness(0.55)',
                    }}
                    aria-hidden
                  />
                  <div className="p-5">
                    <span className="mb-1 inline-block font-mono text-[10px] text-landing-cta uppercase">
                      Step {i + 1}
                    </span>
                    <h3 className="font-landing-display text-base font-semibold text-white">
                      {cleanCopy(item.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{cleanCopy(item.desc)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
