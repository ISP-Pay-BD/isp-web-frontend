'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import type { HowItWorksStep } from '../types';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="border-t border-white/[0.07] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
              Getting started
            </p>
            <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Live this week — history intact.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Self-serve trial in minutes, or a guided migration in 2–5 days with zero subscriber downtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="bg-landing-cta hover:bg-landing-cta-hover h-10 px-5 text-sm font-semibold text-white group transition-transform active:scale-[0.98]">
                Start trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="outline"
                className="h-10 border-white/15 bg-transparent px-5 text-sm text-white/90 hover:bg-white/5 transition-transform active:scale-[0.98]"
              >
                Book migration
              </Button>
            </a>
          </div>
        </Reveal>

        <Reveal stagger as="ol" className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <RevealItem key={item.step} as="li" className="group transition-transform duration-200 hover:-translate-y-1">
              <span className="font-mono text-xs text-white/35">0{item.step}</span>
              <h3 className="font-landing-display mt-2 text-base font-semibold text-white group-hover:text-landing-cta transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{item.desc}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
