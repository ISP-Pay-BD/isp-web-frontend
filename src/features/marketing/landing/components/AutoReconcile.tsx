'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  Server, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  RefreshCw 
} from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionSafe, easeOutExpo } from '@/lib/animations';
import type { ReconcileStep } from '../types';
import { landingMedia } from '../media';
import { SpotlightCard } from './SpotlightCard';
import { Button } from '@/components/ui/button';

interface AutoReconcileProps {
  steps: ReconcileStep[];
}

const SAMPLE_PAYMENTS = [
  {
    gateway: 'bKash',
    badgeClass: 'bg-[#D12053]/15 text-[#E2136E] border-[#E2136E]/30',
    sender: '01712-345678',
    trxId: '9A81BC249F',
    amount: '৳1,200',
    customer: 'Kamrul Hasan (CUST-4091)',
    package: '25 Mbps Premium Fiber',
    router: 'Mirpur-Core-GW-01',
    prevStatus: 'DUE / Expired',
    reconnectTime: '0.42s',
  },
  {
    gateway: 'Nagad',
    badgeClass: 'bg-[#F7931E]/15 text-[#F7931E] border-[#F7931E]/30',
    sender: '01988-990011',
    trxId: 'NG8821045X',
    amount: '৳800',
    customer: 'Farhana Akhter (CUST-2104)',
    package: '15 Mbps Home Standard',
    router: 'Uttara-POP-GW-03',
    prevStatus: 'DUE / Expired',
    reconnectTime: '0.38s',
  },
  {
    gateway: 'Rocket',
    badgeClass: 'bg-[#8C3494]/15 text-[#8C3494] border-[#8C3494]/30',
    sender: '01844-556677',
    trxId: 'RK9933017M',
    amount: '৳1,500',
    customer: 'Tanvir Ahmed (CUST-3301)',
    package: '35 Mbps Gaming Pro',
    router: 'Dhanmondi-GW-02',
    prevStatus: 'DUE / Expired',
    reconnectTime: '0.45s',
  },
];

export function AutoReconcile({ steps }: AutoReconcileProps) {
  const cards = steps.slice(0, 3);
  const { reduced } = useMotionSafe();
  const lineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(lineRef, { once: true, amount: 0.4 });

  // Interactive Match Simulator State
  const [selectedTxIdx, setSelectedTxIdx] = useState(0);
  const [matchingState, setMatchingState] = useState<'idle' | 'matching' | 'matched'>('idle');
  const activeTx = SAMPLE_PAYMENTS[selectedTxIdx];

  const handleSimulateMatch = () => {
    setMatchingState('matching');
    setTimeout(() => {
      setMatchingState('matched');
    }, 650);
  };

  const handleSelectSample = (idx: number) => {
    setSelectedTxIdx(idx);
    setMatchingState('idle');
  };

  return (
    <section id="auto-reconcile" className="relative z-[1] py-24 md:py-36 bg-landing-bg overflow-hidden">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-blue-500/5 blur-[160px]" />

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2E8BFF]/25 bg-[#2E8BFF]/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2E8BFF] backdrop-blur-md">
              <span className="h-1 w-1 rounded-full bg-[#2E8BFF]" aria-hidden />
              Flagship Auto-Match Workflow
            </span>
            <h2 className="font-landing-display mt-4 text-[clamp(2rem,4.2vw,3.5rem)] font-bold tracking-tight text-white text-balance">
              Every bKash &amp; Nagad payment, matched in under a second
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
              When a subscriber pays, ISP Pay BD matches the TrxID to the open invoice, clears dues,
              and restores the MikroTik line in real time without manual spreadsheet checks.
            </p>
          </div>
        </Reveal>

        {/* ═══ INTERACTIVE LIVE MATCH SIMULATOR ═══ */}
        <Reveal className="mt-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-landing-panel/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-landing-cta" />
                  <h3 className="font-landing-display text-lg font-bold text-white tracking-tight">
                    Interactive Auto-Reconcile Sandbox
                  </h3>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Click a sample incoming mobile transaction to test instantaneous invoice matching &amp; MikroTik reconnect.
                </p>
              </div>

              {/* Sample Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                {SAMPLE_PAYMENTS.map((s, i) => (
                  <button
                    key={s.gateway}
                    type="button"
                    onClick={() => handleSelectSample(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTxIdx === i
                        ? 'bg-landing-cta text-white shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.gateway}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Step Live Reconcile Pipeline Visual */}
            <div className="mt-8 grid gap-6 md:grid-cols-12 items-center">
              {/* Step 1: Ingest Transaction */}
              <div className="md:col-span-4 rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-white/40 border-b border-white/5 pb-2">
                  <span className="flex items-center gap-1.5 text-white/80 font-sans font-semibold">
                    <Smartphone className="h-3.5 w-3.5 text-blue-400" /> Incoming SMS / API
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${activeTx.badgeClass}`}>
                    {activeTx.gateway}
                  </span>
                </div>
                <div className="space-y-1.5 text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">TrxID:</span>
                    <span className="font-bold text-landing-accent">{activeTx.trxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">From:</span>
                    <span>{activeTx.sender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Amount:</span>
                    <span className="font-bold text-emerald-400">{activeTx.amount}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Auto Match Engine */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-landing-cta/40 bg-landing-cta/15 text-landing-cta shadow-lg shadow-landing-cta/20">
                  {matchingState === 'matching' ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : matchingState === 'matched' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Zap className="h-6 w-6" />
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-xs font-semibold text-white">
                    {matchingState === 'matching'
                      ? 'Reconciling against database...'
                      : matchingState === 'matched'
                        ? '100% Invoice Match Found!'
                        : 'Engine Idle · Ready to Match'}
                  </span>
                  <p className="font-mono text-[11px] text-white/40 mt-0.5">
                    Latency: {matchingState === 'matched' ? activeTx.reconnectTime : '0.00s'}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleSimulateMatch}
                  disabled={matchingState === 'matching'}
                  className="mt-4 bg-landing-cta hover:bg-landing-cta-hover text-white font-semibold text-xs h-9 px-4 shadow-md shadow-landing-cta/20"
                >
                  {matchingState === 'matched' ? 'Re-run Match Simulator' : 'Trigger Live Reconcile'}
                </Button>
              </div>

              {/* Step 3: MikroTik Line Restored */}
              <div className={`md:col-span-4 rounded-xl border p-4 space-y-3 font-mono text-xs transition-all duration-500 ${
                matchingState === 'matched'
                  ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_4px_25px_rgba(16,185,129,0.15)]'
                  : 'border-white/10 bg-black/40 opacity-70'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-white/40 border-b border-white/5 pb-2">
                  <span className="flex items-center gap-1.5 text-white/80 font-sans font-semibold">
                    <Server className="h-3.5 w-3.5 text-emerald-400" /> MikroTik PPPoE Sync
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    matchingState === 'matched'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {matchingState === 'matched' ? 'ONLINE / PAID' : activeTx.prevStatus}
                  </span>
                </div>
                <div className="space-y-1.5 text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">Customer:</span>
                    <span className="truncate max-w-[140px]">{activeTx.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Router:</span>
                    <span>{activeTx.router}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Action:</span>
                    <span className="font-bold text-emerald-400">
                      {matchingState === 'matched' ? 'Auto Reconnected' : 'Pending Payment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 3 Step Cards */}
        <div ref={lineRef} className="relative mt-14">
          {!reduced ? (
            <div className="pointer-events-none absolute top-0 right-[8%] left-[8%] hidden h-px md:block" aria-hidden>
              <motion.div
                className="h-px origin-left bg-linear-to-r from-transparent via-landing-cta/70 to-transparent"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.15 }}
              />
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {cards.map((step, index) => (
              <motion.div
                key={step.step}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: easeOutExpo }}
              >
                <SpotlightCard className="h-full">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${landingMedia.reconcile[index] ?? landingMedia.reconcile[0]}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'grayscale(0.8) contrast(1.15) brightness(0.5)',
                        mixBlendMode: 'luminosity',
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-landing-panel via-landing-panel/30 to-transparent" />
                    <span className="absolute top-4 left-4 rounded-full border border-white/15 bg-landing-bg/70 px-2.5 py-1 font-mono text-[10px] text-landing-cta backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')} ·{' '}
                      {(['ingest', 'match', 'reconnect'] as const)[index] ?? 'step'}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-landing-display text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
                    <p className="mt-4 font-mono text-xs text-white/40">
                      {step.metricHighlight ?? step.metric}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-10 font-mono text-xs text-white/40">
          Median match 780ms · False dispute rate &lt; 0.01% · bKash · Nagad · SSLCommerz · Rocket
        </p>
      </div>
    </section>
  );
}

