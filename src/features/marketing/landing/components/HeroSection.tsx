'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Wifi, CreditCard, Users, Headphones, Radio, BarChart3, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MorphArrowButton } from '@/components/motion/MorphArrowButton';
import { easeOutExpo, useMotionSafe } from '@/lib/animations';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import type { TimelineItem } from '@/components/ui/radial-orbital-timeline';
import type { HeroData } from '../types';

interface HeroSectionProps {
  data: HeroData;
}

const heroTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'MikroTik Sync',
    subtitle: 'RouterOS Integration',
    content: 'Real-time PPPoE, Hotspot & DHCP sync across all MikroTik routers. Auto-provision users in under 800ms.',
    icon: Wifi,
    relatedIds: [2, 6],
    status: 'completed',
    energy: 98,
    color: '#f75803',
  },
  {
    id: 2,
    title: 'bKash / Nagad',
    subtitle: 'Payment Gateway',
    content: 'Automated payment reconciliation. TrxID matched to subscriber accounts instantly — zero manual entry.',
    icon: CreditCard,
    relatedIds: [1, 3],
    status: 'completed',
    energy: 95,
    color: '#10b981',
  },
  {
    id: 3,
    title: 'Customer Portal',
    subtitle: 'Self-Service App',
    content: 'Customers check balance, pay bills, and raise tickets from a branded web portal or Android app.',
    icon: Smartphone,
    relatedIds: [2, 4],
    status: 'completed',
    energy: 88,
    color: '#2e8bff',
  },
  {
    id: 4,
    title: 'Multi-POP',
    subtitle: 'Reseller Network',
    content: 'Hierarchical reseller management with territory assignments, commission tracking, and bulk operations.',
    icon: Users,
    relatedIds: [3, 5],
    status: 'in-progress',
    energy: 72,
    color: '#a855f7',
  },
  {
    id: 5,
    title: 'OLT Tools',
    subtitle: 'Fiber Management',
    content: 'GPON OLT inventory, port mapping, and ONT provisioning — all from a single network dashboard.',
    icon: Radio,
    relatedIds: [4, 7],
    status: 'in-progress',
    energy: 55,
    color: '#06b6d4',
  },
  {
    id: 6,
    title: 'SMS & WhatsApp',
    subtitle: 'Communication Hub',
    content: 'Automated due-date alerts, expiry warnings, and bulk campaign broadcasts via SMS and WhatsApp Business.',
    icon: Headphones,
    relatedIds: [1, 8],
    status: 'completed',
    energy: 82,
    color: '#f59e0b',
  },
  {
    id: 7,
    title: 'Accounting',
    subtitle: 'Finance Suite',
    content: 'Full double-entry ledger, journal entries, balance sheet, P&L — no external accounting tool needed.',
    icon: BarChart3,
    relatedIds: [5, 8],
    status: 'pending',
    energy: 30,
    color: '#ec4899',
  },
  {
    id: 8,
    title: 'Network Map',
    subtitle: 'Topology Viewer',
    content: 'Live topology diagram of your entire network — routers, OLTs, fiber paths, and subscriber density.',
    icon: Globe,
    relatedIds: [6, 7],
    status: 'pending',
    energy: 20,
    color: '#8b5cf6',
  },
];

function FloatingDot({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-landing-cta/20"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -12, 0],
        opacity: [0.15, 0.4, 0.15],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function HeroSection({ data }: HeroSectionProps) {
  const { reduced } = useMotionSafe();
  const ease = easeOutExpo;

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease },
    },
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
      {/* $100k Atmospheric Lighting & Precision Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Ambient Top Light Beam (Brand Vermilion) */}
        <motion.div
          className="absolute -top-40 left-1/2 h-[550px] w-[650px] -translate-x-1/2 rounded-full bg-landing-cta/[0.12] blur-[140px]"
          animate={reduced ? {} : { scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Ambient Side Light Beam (Electric Azure) */}
        <motion.div
          className="absolute top-1/3 -right-24 h-[400px] w-[400px] rounded-full bg-landing-accent/[0.08] blur-[130px]"
          animate={reduced ? {} : { scale: [1, 1.18, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 9, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/[0.06] blur-[120px]"
          animate={reduced ? {} : { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 11, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Precision Ambient Grid Overlay with Elliptical Radial Mask */}
        <div className="bg-grid-ambient absolute inset-0" />

        {/* Atmospheric Floating Energy Sparkles */}
        <FloatingDot delay={0} x="12%" y="22%" size={4} />
        <FloatingDot delay={1.4} x="82%" y="28%" size={3} />
        <FloatingDot delay={0.7} x="72%" y="62%" size={5} />
        <FloatingDot delay={2.2} x="22%" y="68%" size={3} />
        <FloatingDot delay={1.9} x="92%" y="52%" size={4} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left — Text content & Telemetry */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Live Operational Status Eyebrow Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-[#180a30]/80 px-4 py-1.5 shadow-[0_4px_20px_rgba(247,88,3,0.12)] backdrop-blur-xl transition-all hover:border-landing-cta/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-white/90">
                  ROUTEROS v7 &amp; BKASH REST v2 · READY
                </span>
                <span className="rounded bg-landing-cta/20 px-1.5 py-0.5 text-[9px] font-bold text-landing-cta uppercase">
                  LIVE
                </span>
              </div>
            </motion.div>

            {/* Editorial Headline with Tight Negative Tracking */}
            <motion.h1
              variants={itemVariants}
              className="font-landing-display mt-6 text-[2.65rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl lg:text-[3.65rem]"
            >
              Billing,{' '}
              <span className="bg-gradient-to-r from-landing-cta via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(247,88,3,0.3)]">
                MikroTik sync
              </span>{' '}
              &amp;{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(16,185,129,0.25)]">
                bKash
              </span>{' '}
              <span className="text-gradient-silver">— one operator console.</span>
            </motion.h1>

            {/* Subheading with refined high-contrast opacity */}
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 font-normal"
            >
              Payments match to subscribers in under a second. PPPoE secrets provision instantly.
              Your operations team stops chasing TrxIDs across spreadsheets.
            </motion.p>

            {/* Interactive Tactile CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <MorphArrowButton
                href="/register"
                className="h-12 rounded-xl bg-gradient-to-r from-landing-cta via-[#f75803] to-amber-500 px-7 text-sm font-bold text-white shadow-[0_8px_25px_rgba(247,88,3,0.35)] transition-transform hover:shadow-[0_12px_32px_rgba(247,88,3,0.5)] active:scale-[0.98]"
              >
                {data.ctaPrimary}
              </MorphArrowButton>
              <a href="#auto-reconcile">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                >
                  {data.ctaSecondary}
                </Button>
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.ul
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60 font-medium"
            >
              {['14-day full trial', 'No card required', 'Zero-downtime migration'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>

            {/* Luxury Glass Stats & Telemetry Strip */}
            <motion.div
              variants={itemVariants}
              className="glass-panel-luxury mt-12 grid max-w-xl grid-cols-3 gap-6 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              {[
                { value: '780ms', label: 'p50 Reconcile Speed', sub: 'Sub-second auto-match' },
                { value: '99.98%', label: 'Gateway Match Rate', sub: 'Zero manual entry' },
                { value: '6 / 6', label: 'CCR / Cloud NAS', sub: 'Real-time RouterOS sync' },
              ].map((stat) => (
                <div key={stat.label} className="border-r border-white/[0.08] last:border-0 pr-3 last:pr-0">
                  <div className="font-mono text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>{stat.value}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-white/80">{stat.label}</div>
                  <div className="text-[10px] text-white/40 hidden sm:block">{stat.sub}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Orbital timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: easeOutExpo }}
            className="relative hidden overflow-visible lg:block"
          >
            <RadialOrbitalTimeline
              timelineData={heroTimelineData}
              radius={140}
              hubLabel="ISP Pay BD"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
