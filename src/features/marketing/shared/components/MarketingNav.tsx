'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { marketingNavLinks } from '@/config/navigation/index';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { LocaleToggle } from './LocaleToggle';
import { useTranslations } from '../context/LocaleContext';

const navI18nKeys: Record<string, string> = {
  '/#auto-reconcile': 'marketing.nav.features',
  '/#how-it-works': 'marketing.nav.howItWorks',
  '/#pricing': 'marketing.nav.pricing',
  '/plugins': 'marketing.nav.plugins',
  '/#faq': 'marketing.nav.faq',
  '/contact': 'marketing.nav.contact',
};

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <header className="lp-nav bg-landing-bg/80 supports-[backdrop-filter]:bg-landing-bg/70 sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
          <Image src={brandAssets.logo} alt="" width={36} height={36} className="h-9 w-9" priority />
          <div className="hidden sm:block">
            <div className="font-landing-display text-sm font-bold text-white">{siteConfig.name}</div>
            <div className="text-landing-accent text-xs">{t('marketing.nav.tagline')}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {marketingNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              {t(navI18nKeys[link.href] ?? link.label)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              {t('marketing.nav.login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover text-white">
              {t('marketing.nav.startTrial')}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="bg-landing-panel border-white/10 text-white">
              <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile">
                {marketingNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-white/90"
                  >
                    {t(navI18nKeys[link.href] ?? link.label)}
                  </Link>
                ))}
                <Link href="/login" onClick={() => setOpen(false)} className="text-white/80">
                  {t('marketing.nav.login')}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="bg-landing-cta hover:bg-landing-cta-hover mt-2 w-full">
                    {t('marketing.nav.startTrial')}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
