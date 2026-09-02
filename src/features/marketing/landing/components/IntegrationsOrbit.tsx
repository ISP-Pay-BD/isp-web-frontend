'use client';

import { Server, CreditCard, MessageSquare, MessageCircle, Radio, ShieldCheck, Cpu } from 'lucide-react';
import type { IntegrationItem } from '../types';

interface IntegrationsOrbitProps {
  integrations: IntegrationItem[];
}

const iconMap: Record<string, React.ElementType> = {
  Server,
  CreditCard,
  MessageSquare,
  MessageCircle,
  Radio,
  ShieldCheck,
  Cpu,
};

export function IntegrationsOrbit({ integrations }: IntegrationsOrbitProps) {
  return (
    <section id="integrations" className="py-20 md:py-28 bg-landing-panel/60 border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-accent">
            Ecosystem Connectivity
          </span>
          <h2 className="font-landing-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Connects with the infrastructure you already run
          </h2>
          <p className="mt-4 text-base text-white/70">
            MikroTik, OLT hardware, WhatsApp API, and Bangladesh payment rails — native integration with zero friction.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {integrations.map((item, index) => {
            const Icon = iconMap[item.icon ?? 'Server'] ?? Server;
            return (
              <div
                key={index}
                className="group flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.05] hover:scale-105"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-landing-panel border border-white/10 text-landing-cta transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-landing-display text-sm font-bold text-white group-hover:text-landing-cta transition-colors">
                  {item.name}
                </h4>
                <span className="mt-1 text-[11px] font-mono text-white/40 uppercase">
                  {item.category}
                </span>
              </div>
            );
          })}
        </div>

        {/* Payment Gateways Banner */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Supported Bangladesh Payment Rails &amp; Wallets
          </span>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-sm text-white/80">
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-pink-400 font-bold">
              bKash Merchant / Personal
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-orange-400 font-bold">
              Nagad Direct Gateway
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-blue-400 font-bold">
              SSLCommerz (Visa / Mastercard)
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-purple-400 font-bold">
              Rocket &amp; Upay
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-emerald-400 font-bold">
              Manual Bank / Cash Entry
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
