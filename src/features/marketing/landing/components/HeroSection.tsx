'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Wifi, CreditCard, Users, Headphones, Radio, BarChart3, Globe, Smartphone } from 'lucide-react';
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
      transition: { duration: 0.6, ease },
    },
  };

  return (
    <section id="hero" className="relative overflow-x-hidden pt-16 pb-20 md:pt-24 md:pb-32">
      {/* Animated background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-landing-cta/[0.07] blur-[120px]"
          animate={reduced ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/4 h-[300px] w-[300px] rounded-full bg-landing-accent/[0.05] blur-[100px]"
          animate={reduced ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <FloatingDot delay={0} x="15%" y="20%" size={4} />
        <FloatingDot delay={1.2} x="80%" y="30%" size={3} />
        <FloatingDot delay={0.6} x="70%" y="65%" size={5} />
        <FloatingDot delay={2} x="25%" y="70%" size={3} />
        <FloatingDot delay={1.8} x="90%" y="55%" size={4} />
        <FloatingDot delay={0.3} x="10%" y="50%" size={3} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left — Text content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-landing-cta/20 bg-landing-cta/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-landing-cta">
                <Zap className="h-3 w-3" />
                ISP Pay BD
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-landing-display mt-6 text-[2.5rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]"
            >
              Billing,{' '}
              <span className="bg-gradient-to-r from-landing-cta to-amber-400 bg-clip-text text-transparent">
                MikroTik sync
              </span>{' '}
              &amp;{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                bKash
              </span>{' '}
              — one operator console.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60 lg:mx-0"
            >
              Payments match to subscribers in under a second. Lines reconnect automatically. Your team
              stops chasing TrxIDs.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <MorphArrowButton
                href="/register"
                className="h-12 rounded-xl bg-gradient-to-r from-landing-cta to-amber-500 px-7 text-sm font-bold text-white shadow-lg shadow-landing-cta/25 hover:shadow-landing-cta/40"
              >
                {data.ctaPrimary}
              </MorphArrowButton>
              <a href="#auto-reconcile">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
                >
                  {data.ctaSecondary}
                </Button>
              </a>
            </motion.div>

            {/* Trust bullets */}
            <motion.ul
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/50"
            >
              {['14-day full trial', 'No card required', 'Zero-downtime migration'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-landing-cta/80" />
                  {item}
                </li>
              ))}
            </motion.ul>

            {/* Stats strip */}
            <motion.div
              variants={itemVariants}
              className="mt-14 grid max-w-lg grid-cols-3 gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5 backdrop-blur-sm"
            >
              {[
                { value: 'p50 780ms', label: 'Reconcile speed' },
                { value: '99.9%', label: 'Match rate' },
                { value: '6 / 6', label: 'NAS online' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-mono text-sm font-bold text-white">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] text-white/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Orbital timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: easeOutExpo }}
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
