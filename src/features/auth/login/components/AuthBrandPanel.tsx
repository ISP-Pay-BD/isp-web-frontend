'use client';

import Image from 'next/image';
import { Shield, Clock, Mail, Lock } from 'lucide-react';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';

interface AuthBrandPanelProps {
  variant?: 'login' | 'forgot';
}

export function AuthBrandPanel({ variant = 'login' }: AuthBrandPanelProps) {
  const isLogin = variant === 'login';

  return (
    <div className="relative hidden overflow-hidden bg-[#0c0118] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(247,88,3,0.15),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(46,139,255,0.12),transparent_50%)]" />

      <div className="relative z-10 flex items-center gap-3">
        <Image src={brandAssets.logo} alt="" width={40} height={40} />
        <div>
          <p className="text-lg font-semibold text-white">{siteConfig.name}</p>
          <p className="text-sm text-white/60">ISP billing & operations</p>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f75803]/15 text-[#f75803]">
          <Shield className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isLogin ? 'Run your ISP with confidence' : 'Secure password recovery'}
          </h1>
          <p className="text-base leading-relaxed text-white/70">
            {isLogin
              ? 'Billing, PPPoE, bKash payments, and field ops — unified for Bangladesh ISPs.'
              : 'We send a one-time reset link to the email registered on your account. Your current password stays active until you complete the reset.'}
          </p>
        </div>

        <ul className="space-y-3 text-sm text-white/75">
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#2e8bff]" />
            <span>Reset links expire after 24 hours for your security</span>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2e8bff]" />
            <span>Check inbox and spam if you do not see the email</span>
          </li>
          <li className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#2e8bff]" />
            <span>Only the account owner can request a password reset</span>
          </li>
        </ul>

        <div className="flex gap-6 pt-2">
          <div>
            <p className="text-xl font-semibold text-white">24h</p>
            <p className="text-xs text-white/50">Link validity</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">SSL</p>
            <p className="text-xs text-white/50">Encrypted</p>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} {siteConfig.name}</p>
    </div>
  );
}
