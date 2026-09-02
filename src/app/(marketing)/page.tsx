import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { landingData } from '@/data/marketing/landing.data';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(247,88,3,0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(46,139,255,0.12), transparent)',
        }}
      />
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:py-28">
        <p className="text-landing-accent text-sm font-semibold tracking-wide uppercase">
          {landingData.hero.badge}
        </p>
        <h1 className="font-landing-display max-w-4xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">
          {landingData.hero.titleEn}
        </h1>
        <p className="text-lg text-white/75 max-w-2xl">{landingData.hero.subtitleEn}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-11 px-6 text-base text-white">
              {landingData.hero.ctaPrimary}
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button
              variant="outline"
              className="h-11 border-white/20 bg-transparent px-6 text-base text-white hover:bg-white/10"
            >
              {landingData.hero.ctaSecondary}
            </Button>
          </Link>
        </div>
        <p className="text-sm text-white/50">
          P0 foundation ready — Phase 1 will add all 28 landing sections next.
        </p>
      </section>
    </div>
  );
}
