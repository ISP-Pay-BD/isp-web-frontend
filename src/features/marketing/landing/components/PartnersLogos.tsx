'use client';

interface PartnersLogosProps {
  partners: string[];
}

export function PartnersLogos({ partners }: PartnersLogosProps) {
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

  const loop = [...displayPartners, ...displayPartners];

  return (
    <section id="partners" className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-landing-display text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Trusted across Bangladesh fiber
        </h2>
      </div>

      <div className="relative mt-12">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-landing-bg to-transparent md:w-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-landing-bg to-transparent md:w-28"
          aria-hidden
        />

        <div className="flex w-max animate-[lp-marquee_42s_linear_infinite] gap-10 pr-10 motion-reduce:animate-none">
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="font-landing-display shrink-0 text-2xl font-semibold tracking-tight text-white/35 md:text-3xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
