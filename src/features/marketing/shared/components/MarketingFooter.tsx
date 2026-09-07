'use client';

import Link from 'next/link';
import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { useTranslations } from '../context/LocaleContext';

const footerLinks = {
  product: [
    { labelKey: 'marketing.nav.features', href: '/#auto-reconcile' },
    { labelKey: 'marketing.nav.pricing', href: '/#pricing' },
    { labelKey: 'marketing.nav.faq', href: '/#faq' },
    { labelKey: 'marketing.nav.startTrial', href: '/register' },
  ],
  company: [
    { labelKey: 'marketing.nav.contact', href: '/contact' },
    { labelKey: 'marketing.nav.login', href: '/login' },
    { labelKey: 'marketing.footer.privacy', href: '/privacy' },
    { labelKey: 'marketing.footer.terms', href: '/terms' },
  ],
};

export function MarketingFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-white/10 bg-landing-bg text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <Image src={brandAssets.logo} alt="" width={40} height={40} />
            <span className="font-landing-display text-lg font-bold">{siteConfig.name}</span>
          </Link>
          <p className="text-sm text-white/70 max-w-md">{t('marketing.footer.description')}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">{t('marketing.footer.product')}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {footerLinks.product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-landing-accent transition-colors">
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">{t('marketing.footer.company')}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {footerLinks.company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-landing-accent transition-colors">
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {siteConfig.name}. {t('marketing.footer.rights')}
      </div>
    </footer>
  );
}
