import type { ReactNode } from 'react';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { MobileStickyCta } from './MobileStickyCta';
import { LocaleProvider } from '../context/LocaleContext';
import { LocaleToggle } from './LocaleToggle';

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <LocaleProvider>
      <div className="font-landing-body bg-landing-bg relative min-h-dvh w-full max-w-full overflow-x-hidden text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <MarketingNav />
        <main id="main-content" className="w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
          {children}
        </main>
        <MarketingFooter />
        <MobileStickyCta />
      </div>
    </LocaleProvider>
  );
}

export { MarketingNav, MarketingFooter, MobileStickyCta, LocaleToggle };
