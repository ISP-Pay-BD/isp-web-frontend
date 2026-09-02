'use client';

import Link from 'next/link';
import { Zap, ArrowLeftRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HowItWorksStep } from '../types';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-landing-panel/60 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Getting Started
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Go live this week — with subscribers, packages &amp; billing history intact.
          </h2>
          <p className="mt-4 text-base text-white/70">
            Start a self-serve trial in five minutes, or let us migrate you off your current panel in 2–5 days with zero customer downtime.
          </p>
        </div>

        {/* Two Tracks */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-landing-cta/30 bg-landing-panel/90 p-8 shadow-xl shadow-orange-500/5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-landing-cta/15 px-3 py-1 text-xs font-semibold text-landing-cta">
                <Zap className="h-3.5 w-3.5" />
                Track 01
              </div>
              <h3 className="font-landing-display mt-4 text-2xl font-bold text-white">
                Starting fresh with ISP Pay BD
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Spin up a fully functional account in 5 minutes. 14-day free trial, all router sync and bKash auto-reconcile modules unlocked, no credit card required.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/register">
                <Button className="w-full bg-landing-cta hover:bg-landing-cta-hover h-11 text-white font-medium">
                  Start Free Trial Instantly
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-landing-accent/15 px-3 py-1 text-xs font-semibold text-landing-accent">
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Track 02
              </div>
              <h3 className="font-landing-display mt-4 text-2xl font-bold text-white">
                Switching panels &amp; migrating
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                We import your subscribers, packages, MikroTik profiles and unpaid invoice dues. Transition takes 2–5 days with complete parity and zero subscriber downtime.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/contact">
                <Button variant="outline" className="w-full border-white/20 bg-white/5 h-11 text-white hover:bg-white/10">
                  Book a Zero-Downtime Migration Call
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Step Timeline */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-landing-cta">
                  0{item.step}
                </span>
                <CheckCircle2 className="h-5 w-5 text-white/30" />
              </div>
              <h4 className="font-landing-display mt-4 text-lg font-bold text-white">
                {item.title}
              </h4>
              <p className="mt-2 text-xs text-white/65 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
