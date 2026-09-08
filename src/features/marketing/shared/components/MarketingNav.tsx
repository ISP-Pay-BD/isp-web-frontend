'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { marketingNavLinks } from '@/config/navigation/index';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { useTranslations } from '../context/LocaleContext';

const navI18nKeys: Record<string, string> = {
  '/#auto-reconcile': 'marketing.nav.features',
  '/#how-it-works': 'marketing.nav.howItWorks',
  '/#pricing': 'marketing.nav.pricing',
  '/#faq': 'marketing.nav.faq',
  '/contact': 'marketing.nav.contact',
};

function isHashLink(href: string): boolean {
  return href.startsWith('/#') || href.startsWith('#');
}

function scrollToSection(href: string) {
  const id = href.replace(/^\/?#/, '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isHashLink(href)) {
      e.preventDefault();
      scrollToSection(href);
      setOpen(false);
    }
  }, []);

  return (
    <header className="lp-nav pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-4 md:px-6 md:pt-5">
      <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/12 bg-landing-bg/55 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-landing-bg/45">
        <Link href="/" className="flex items-center gap-2.5 pl-1" aria-label={`${siteConfig.name} home`}>
          <Image src={brandAssets.logo} alt="" width={32} height={32} className="h-8 w-8" priority />
          <span className="font-landing-display hidden text-sm font-semibold tracking-tight text-white sm:inline">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {marketingNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
            >
              {t(navI18nKeys[link.href] ?? link.label)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login">
            <Button
              variant="ghost"
              className="h-9 rounded-full px-4 text-white/80 hover:bg-white/10 hover:text-white"
            >
              {t('marketing.nav.login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-landing-cta hover:bg-landing-cta-hover h-9 rounded-full px-4 font-semibold text-white">
              {t('marketing.nav.startTrial')}
            </Button>
          </Link>
        </div>

        <div className="flex items-center lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-landing-panel text-white">
              <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile">
                {marketingNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="font-landing-display text-lg font-medium text-white/90"
                  >
                    {t(navI18nKeys[link.href] ?? link.label)}
                  </a>
                ))}
                <Link href="/login" onClick={() => setOpen(false)} className="text-white/80">
                  {t('marketing.nav.login')}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="bg-landing-cta hover:bg-landing-cta-hover mt-2 w-full rounded-full">
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
