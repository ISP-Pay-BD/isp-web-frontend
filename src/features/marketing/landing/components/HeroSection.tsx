'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, PlayCircle, CheckCircle2, Server, ShieldCheck, CreditCard, Wifi, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HeroData } from '../types';

interface HeroSectionProps {
  data: HeroData;
}

const orbitNodes = [
  { icon: Server, label: 'MikroTik', desc: 'Real-time PPPoE sync', ring: 2, angle: 0 },
  { icon: ShieldCheck, label: 'RADIUS', desc: 'AAA auth & CoA', ring: 2, angle: 72 },
  { icon: Globe, label: 'IPv6 / BGP', desc: 'Dual-stack routing', ring: 2, angle: 144 },
  { icon: Wifi, label: 'OLT / GPON', desc: 'Optical power & ONU', ring: 2, angle: 216 },
  { icon: CreditCard, label: 'bKash / Nagad', desc: 'Auto reconciliation', ring: 2, angle: 288 },
  { icon: Smartphone, label: 'Bangla App', desc: 'Subscriber self-care', ring: 1, angle: 45 },
  { icon: CreditCard, label: 'Instant Pay', desc: 'Reconnect on payment', ring: 1, angle: 135 },
  { icon: Server, label: 'Auto Cutoff', desc: 'Disconnect on expiry', ring: 1, angle: 225 },
  { icon: Globe, label: 'REST API', desc: 'Platform webhooks', ring: 1, angle: 315 },
];

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] md:h-[700px] md:w-[700px] rounded-full bg-[#f75803]/15 blur-[120px]" />
        <div className="absolute top-1/3 right-10 h-[350px] w-[350px] rounded-full bg-[#2e8bff]/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Content Column */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs md:text-sm font-medium text-white/90 shadow-inner backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-landing-cta animate-pulse" />
              <span>{data.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-landing-display mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-5xl lg:leading-[1.15]"
            >
              Run your whole ISP from{' '}
              <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                one operator&apos;s console
              </span>
              <span className="block mt-2 text-landing-accent text-2xl sm:text-3xl md:text-4xl font-bold">
                Billing, MikroTik sync &amp; bKash matched automatically.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base md:text-lg leading-relaxed text-white/70 max-w-xl"
            >
              Auto-reconciles every bKash and Nagad payment to the subscriber in ~0.8s, syncs MikroTik PPPoE in real time, disconnects at midnight expiry, and empowers your users with a branded Bangla customer portal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link href="/register">
                <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 px-7 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40">
                  <Rocket className="mr-2 h-5 w-5" />
                  {data.ctaPrimary}
                </Button>
              </Link>
              <a href="#auto-reconcile">
                <Button
                  variant="outline"
                  className="h-12 border-white/20 bg-white/5 px-6 text-base font-medium text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30"
                >
                  <PlayCircle className="mr-2 h-5 w-5 text-landing-accent" />
                  {data.ctaSecondary}
                </Button>
              </a>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 sm:text-sm lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>14-day full trial</span>
              </div>
            </motion.div>

            {/* Feature tags */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
              {['Auto-Reconciliation', 'MikroTik Realtime Sync', 'Pay-As-You-Go Wallet', 'Bangla App', 'BTRC Compliance'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Orbital Interactive Visualization */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative flex h-[340px] w-[340px] sm:h-[420px] sm:w-[420px] items-center justify-center">
              {/* Center Core */}
              <div className="relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full border border-landing-cta/40 bg-landing-panel/90 shadow-[0_0_50px_rgba(247,88,3,0.3)] backdrop-blur-xl">
                <span className="font-landing-display text-xl sm:text-2xl font-black text-white">50+</span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-landing-cta">
                  Integrations
                </span>
              </div>

              {/* Inner Orbit Ring (130px radius) */}
              <div className="absolute h-[210px] w-[210px] sm:h-[260px] sm:w-[260px] rounded-full border border-white/10 border-dashed animate-[spin_40s_linear_infinite]" />

              {/* Outer Orbit Ring (190px radius) */}
              <div className="absolute h-[310px] w-[310px] sm:h-[390px] sm:w-[390px] rounded-full border border-white/10 animate-[spin_60s_linear_infinite_reverse]" />

              {/* Orbit Nodes */}
              {orbitNodes.map((node, i) => {
                const isOuter = node.ring === 2;
                const radius = isOuter ? 155 : 105;
                const rad = (node.angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                const Icon = node.icon;

                return (
                  <div
                    key={i}
                    className="absolute flex items-center justify-center"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <div
                      title={`${node.label}: ${node.desc}`}
                      className="group flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-landing-panel/85 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-125 hover:border-landing-cta hover:bg-landing-cta/20"
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 group-hover:text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
