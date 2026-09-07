'use client';

import { useTranslations } from '@/features/marketing/shared';

interface PartnersLogosProps {
  partners: string[];
}

export function PartnersLogos({ partners }: PartnersLogosProps) {
  const t = useTranslations();
  const displayPartners =
    partners.length > 0
      ? partners
      : [
          'FastNet BD',
          'NetLink CTG',
          'SkyConnect',
          'CityNet Sylhet',
          'LinkWave',
          'FiberOne BD',
          'SpeedNet Khulna',
          'WaveISP',
          'ConnectBD',
          'DhakaNet',
        ];

  return (
    <section id="partners" className="relative border-t border-white/10 bg-[#0c0118] py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-landing-cta">
            {t('marketing.sections.partners.badge')}
          </p>
          <h2 className="font-landing-display mt-2 text-2xl font-semibold text-white">
            {t('marketing.sections.partners.title')}
          </h2>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
          {displayPartners.map((p) => (
            <li
              key={p}
              className="before:mr-2 before:text-landing-cta before:content-['·'] first:before:mr-0 first:before:content-none"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
