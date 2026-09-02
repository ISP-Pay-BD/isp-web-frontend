'use client';

import { Network } from 'lucide-react';
import { useTranslations } from '@/features/marketing/shared';

interface PartnersLogosProps {
  partners: string[];
}

export function PartnersLogos({ partners }: PartnersLogosProps) {
  const t = useTranslations();
  const displayPartners = partners.length > 0 ? partners : [
    'FastNet BD', 'NetLink CTG', 'SkyConnect', 'CityNet Sylhet', 'LinkWave', 'FiberOne BD',
    'SpeedNet Khulna', 'WaveISP', 'ConnectBD', 'DhakaNet',
  ];

  return (
    <section id="partners" className="py-16 md:py-20 bg-[#0c0118] border-t border-white/10 relative">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-landing-cta">
            {t('marketing.sections.partners.badge')}
          </span>
          <h2 className="font-landing-display mt-2 text-2xl font-bold text-white">
            {t('marketing.sections.partners.title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayPartners.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center backdrop-blur-sm transition-all hover:border-landing-cta/40 hover:bg-white/[0.05]"
            >
              <Network className="h-4 w-4 text-landing-cta/70" />
              <span className="text-xs font-semibold text-white/80">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
