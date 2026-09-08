'use client';

import Link from 'next/link';
import { Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Reveal } from '@/components/motion/Reveal';

/** Captive paywall — marketing dark surface; static mock session (no admin shell). */
export function CaptivePage() {
  const session = {
    username: 'user.rahim',
    packageName: 'Home 40 Mbps',
    dueBdt: 1200,
    expiredAt: '2026-09-07 00:01',
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-landing-bg px-4 text-white">
      <Reveal className="relative z-10 w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-landing-cta/20">
            <Wifi className="h-5 w-5 text-landing-cta" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Session expired</h1>
            <p className="font-mono text-sm text-white/60">{session.username}</p>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Package</span>
            <span>{session.packageName}</span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/50">
            <span>Expired</span>
            <span className="font-mono">{session.expiredAt}</span>
          </div>
          <div className="mt-3 flex justify-between font-semibold">
            <span className="text-white/60">Due</span>
            <span className="tabular-nums text-landing-cta">{session.dueBdt.toLocaleString()} ৳</span>
          </div>
        </div>
        <Button
          className="w-full bg-landing-cta text-white duration-200 ease-out hover:bg-landing-cta-hover"
          onClick={() => toast.success('Opening payment (mock)')}
        >
          Pay now
        </Button>
        <p className="text-center text-xs text-white/40">
          Already paid?{' '}
          <button
            type="button"
            className="text-landing-accent underline underline-offset-2"
            onClick={() => toast.success('Reconnecting… (mock)')}
          >
            Reconnect
          </button>
          {' · '}
          <Link href="/help" className="text-white/60 underline">
            Help
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
