'use client';

import Link from 'next/link';
import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { ShieldCheck, Zap, Server, ArrowUpRight } from 'lucide-react';

interface AuthBrandPanelProps {
  variant?: 'login' | 'forgot';
}

export function AuthBrandPanel({ variant = 'login' }: AuthBrandPanelProps) {
  const isLogin = variant === 'login';

  return (
    <div className="relative hidden overflow-hidden bg-landing-bg lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-14 border-r border-white/[0.08]">
      {/* Atmosphere glow & mesh backdrop */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full opacity-35 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, var(--landing-cta) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-[450px] w-[450px] rounded-full opacity-20 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #2E8BFF 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div className="bg-grid-ambient pointer-events-none absolute inset-0 opacity-20" aria-hidden />

      {/* Brand Header — Links to Home '/' */}
      <Link
        href="/"
        className="group relative z-10 inline-flex items-center gap-3.5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] w-fit"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/15 backdrop-blur-md transition-all group-hover:ring-landing-cta/50 group-hover:bg-white/[0.1]">
          <Image src={brandAssets.logo} alt={`${siteConfig.name} logo`} width={28} height={28} priority />
        </div>
        <div>
          <p className="font-landing-display text-lg font-semibold tracking-tight text-white group-hover:text-landing-cta transition-colors">
            {siteConfig.name}
          </p>
          <p className="text-xs font-medium text-white/50">ISP Billing &amp; Operations Cloud</p>
        </div>
      </Link>

      {/* Main Narrative & Value Statement */}
      <div className="relative z-10 max-w-lg space-y-8 my-auto">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-landing-cta/30 bg-landing-cta/10 px-3 py-1 text-xs font-medium text-landing-cta backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-landing-cta animate-pulse" />
            <span>Enterprise ISP Operating Suite</span>
          </div>

          <h1 className="font-landing-display text-3xl xl:text-4xl font-semibold tracking-tight text-white leading-[1.2] text-balance">
            {isLogin ? (
              <>
                Run your ISP from <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">one unified console</span>
              </>
            ) : (
              'Reset access securely'
            )}
          </h1>
          <p className="text-sm xl:text-base leading-relaxed text-white/65">
            {isLogin
              ? 'Real-time MikroTik sync, bKash & Nagad automated reconciliation, OLT telemetry, and field staff ledgers built for Bangladesh operators.'
              : 'We will send a one-time cryptographic reset link. Your current credentials stay active until you finish.'}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid gap-3 pt-2">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05] hover:border-white/20">
            <div className="rounded-xl bg-landing-cta/15 p-2 text-landing-cta shrink-0 mt-0.5">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-landing-display text-xs font-semibold text-white">Sub-second Auto Reconciliation</h4>
              <p className="mt-0.5 text-xs text-white/50 leading-relaxed">
                Every bKash/Nagad payment auto-matched to invoices in ~0.8s without manual SMS verification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05] hover:border-white/20">
            <div className="rounded-xl bg-blue-500/15 p-2 text-blue-400 shrink-0 mt-0.5">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-landing-display text-xs font-semibold text-white">Automated MikroTik Sync</h4>
              <p className="mt-0.5 text-xs text-white/50 leading-relaxed">
                PPPoE and hotspot lines disconnect on expiry and reconnect instantly on payment settlement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/45">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> 99.98% SLA
          </span>
          <a href="/status" className="flex items-center gap-0.5 hover:text-white transition-colors">
            Status <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
