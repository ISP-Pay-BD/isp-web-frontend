'use client';

import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';

interface AuthBrandPanelProps {
  variant?: 'login' | 'forgot';
}

export function AuthBrandPanel({ variant = 'login' }: AuthBrandPanelProps) {
  const isLogin = variant === 'login';

  return (
    <div className="relative hidden overflow-hidden bg-[#0c0118] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
      <div className="bg-grid-ambient pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative z-10 flex items-center gap-3">
        <Image src={brandAssets.logo} alt="" width={40} height={40} />
        <div>
          <p className="font-landing-display text-lg font-semibold text-white">{siteConfig.name}</p>
          <p className="text-sm text-white/55">ISP billing & operations</p>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <h1 className="font-landing-display text-3xl font-semibold tracking-tight text-white">
          {isLogin ? 'Run your ISP from one console' : 'Reset access securely'}
        </h1>
        <p className="text-base leading-relaxed text-white/65">
          {isLogin
            ? 'Billing, PPPoE, bKash payments, and field ops — built for Bangladesh ISPs.'
            : 'We email a one-time reset link. Your current password stays active until you finish.'}
        </p>
        <ul className="space-y-2 text-sm text-white/55">
          <li className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
            MikroTik sync and auto-reconcile in one place
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
            Role-scoped portals for admin, POP, and subscribers
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-landing-cta" />
            Offline-ready mock demo accounts for evaluation
          </li>
        </ul>
      </div>

      <p className="relative z-10 text-xs text-white/40">
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </div>
  );
}
