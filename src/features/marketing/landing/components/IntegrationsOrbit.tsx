'use client';

import { Server, CreditCard, MessageSquare, Radio, ShieldCheck, Cpu } from 'lucide-react';
import type { IntegrationItem } from '../types';

interface IntegrationsOrbitProps {
  integrations: IntegrationItem[];
}

const iconMap: Record<string, React.ElementType> = {
  Server,
  CreditCard,
  MessageSquare,
  Radio,
  ShieldCheck,
  Cpu,
};

const PAYMENT_RAILS = [
  'bKash Merchant / Personal',
  'Nagad Direct Gateway',
  'SSLCommerz (Visa / Mastercard)',
  'Rocket & Upay',
  'Manual Bank / Cash Entry',
] as const;

export function IntegrationsOrbit({ integrations }: IntegrationsOrbitProps) {
  return (
    <section id="integrations" className="relative border-t border-white/10 bg-landing-panel/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            Integrations
          </p>
          <h2 className="font-landing-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Connects with the infrastructure you already run
          </h2>
          <p className="mt-4 text-base text-white/60">
            MikroTik, OLT hardware, WhatsApp API, and Bangladesh payment rails — native, not bolted on.
          </p>
        </div>

        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10 sm:grid sm:grid-cols-2 sm:divide-y-0 sm:border-0 sm:gap-x-10 sm:gap-y-0 lg:grid-cols-3">
          {integrations.map((item, index) => {
            const Icon = iconMap[item.icon ?? 'Server'] ?? Server;
            return (
              <li
                key={index}
                className="flex items-start gap-3 py-4 sm:border-t sm:border-white/10 sm:py-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-landing-panel text-landing-cta">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h3 className="font-landing-display text-sm font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/45">{item.category}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs font-medium text-white/45">Bangladesh payment rails</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
            {PAYMENT_RAILS.map((rail) => (
              <li key={rail} className="before:mr-2 before:text-landing-cta before:content-['·'] first:before:content-none first:before:mr-0">
                {rail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
