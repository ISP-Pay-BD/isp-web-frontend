'use client';

import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';
import { landingAssets } from '@/config/assets';
import { useTranslations } from '@/features/marketing/shared';
import { PluginsHighlight } from './PluginsHighlight';
import { SectionTitle } from './SectionTitle';
import type { IntegrationItem, PluginItem } from '../types';

interface IntegrationsOrbitProps {
  integrations: IntegrationItem[];
  plugins: PluginItem[];
}

const CORE_RAILS = [
  { name: 'MikroTik', key: 'mikrotik', logo: landingAssets.logos.mikrotik },
  { name: 'bKash', key: 'bkash', logo: landingAssets.logos.bkash },
  { name: 'Nagad', key: 'nagad', logo: landingAssets.logos.nagad },
] as const;

/** Everything ISP Pay BD connects to: the three core rails, the wider stack, then paid add-ons. */
export function IntegrationsOrbit({ integrations, plugins }: IntegrationsOrbitProps) {
  const t = useTranslations();
  const k = (key: string) => t(`marketing.landing.integrations.${key}`);

  return (
    <section id="integrations" className="relative z-[1] border-t border-white/10 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <SectionTitle title={k('title')} description={k('desc')} />
        </Reveal>

        <Reveal delay={0.06} className="mt-12 grid gap-4 md:grid-cols-3">
          {CORE_RAILS.map((rail) => (
            <article
              key={rail.name}
              className="group bg-landing-panel/80 hover:border-landing-cta/30 relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-colors duration-200"
            >
              {/* The partner's own logo on a white tile, as brand marks are shown on dark pages. */}
              <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-white p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:-translate-y-0.5">
                <Image
                  src={rail.logo}
                  alt=""
                  width={96}
                  height={40}
                  className="h-full w-auto object-contain"
                />
              </div>
              <p className="mt-5 text-[11px] font-medium tracking-wide text-white/45">
                {k('coreRail')}
              </p>
              <h3 className="font-landing-display mt-1.5 text-xl font-semibold text-white">
                {rail.name}
              </h3>
              <p className="mt-2 text-sm text-white/55">{k(rail.key)}</p>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-10">
          <p className="text-sm text-white/45">{k('also')}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {integrations.map((item) => (
              <li
                key={item.name}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/60"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </Reveal>

        <PluginsHighlight plugins={plugins} />
      </div>
    </section>
  );
}
