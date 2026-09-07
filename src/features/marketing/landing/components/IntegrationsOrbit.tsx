'use client';

import type { IntegrationItem } from '../types';

interface IntegrationsOrbitProps {
  integrations: IntegrationItem[];
}

const PAYMENT_RAILS = [
  'bKash Merchant / Personal',
  'Nagad Direct Gateway',
  'SSLCommerz (Visa / Mastercard)',
  'Rocket & Upay',
  'Manual Bank / Cash Entry',
] as const;

export function IntegrationsOrbit({ integrations }: IntegrationsOrbitProps) {
  return (
    <section id="integrations" className="border-t border-white/10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-landing-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Connects with the infrastructure you already run
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            MikroTik, OLT hardware, WhatsApp API, and Bangladesh payment rails — native, not bolted
            on.
          </p>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item, index) => (
            <li
              key={index}
              className="border-t border-white/10 py-5"
            >
              <h3 className="font-landing-display text-sm font-semibold text-white">{item.name}</h3>
              <p className="mt-1 text-xs text-white/45">{item.category}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs text-white/45">Bangladesh payment rails</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75">
            {PAYMENT_RAILS.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
