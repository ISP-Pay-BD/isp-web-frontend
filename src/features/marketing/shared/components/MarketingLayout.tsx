import type { ReactNode } from 'react';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { MobileStickyCta } from './MobileStickyCta';

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="font-landing-body bg-landing-bg text-white min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <MarketingNav />
      <main id="main-content" className="pb-20 md:pb-0">
        {children}
      </main>
      <MarketingFooter />
      <MobileStickyCta />
    </div>
  );
}

export { MarketingNav, MarketingFooter, MobileStickyCta };
