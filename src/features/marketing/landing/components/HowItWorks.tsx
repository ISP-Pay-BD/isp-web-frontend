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
            <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Live this week — history intact.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Self-serve trial in minutes, or a guided migration in 2–5 days with zero subscriber downtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="h-11 rounded-lg bg-landing-cta px-5 text-sm font-semibold text-white hover:bg-landing-cta-hover">
                Start trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#contact">
              <Button
                variant="ghost"
                className="h-11 rounded-lg px-4 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                Book migration
              </Button>
            </a>
          </div>
        </Reveal>

        <Reveal stagger as="ol" className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <RevealItem key={item.step} as="li">
              <span className="font-mono text-xs text-white/35">0{item.step}</span>
              <h3 className="font-landing-display mt-2 text-base font-semibold text-white">
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
