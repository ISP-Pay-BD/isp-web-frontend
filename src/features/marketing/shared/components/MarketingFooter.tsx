'use client';

import Link from 'next/link';
import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { useTranslations } from '../context/LocaleContext';
import { ShieldCheck, Phone, Mail, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';

const footerColumns = {
  product: [
    { label: 'Auto Reconciliation', href: '/#how-it-works' },
    { label: 'MikroTik Sync', href: '/#product-preview' },
    { label: 'POP Reseller Hub', href: '/#reseller' },
    { label: 'Fiber OLT Manager', href: '/#product-preview' },
    { label: 'Granular Permissions', href: '/#reseller' },
    { label: 'Pricing & PAYG', href: '/#pricing' },
  ],
  solutions: [
    { label: 'Broadband ISPs', href: '/#roi' },
    { label: 'POP / Sub-Resellers', href: '/#try-it' },
    { label: 'Fiber Cable Operators', href: '/#product-preview' },
    { label: 'BTRC Compliance Reports', href: '/#faq' },
    { label: 'Customer Mobile App', href: '/#mobile-app' },
    { label: 'Integrations & Plugins', href: '/#integrations' },
  ],
  company: [
    { label: 'About Us', href: '/contact' },
    { label: 'Live Sandbox Demos', href: '/#try-it' },
    { label: 'Contact Support', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function MarketingFooter() {
  const t = useTranslations();

  return (
    <footer className="bg-landing-bg relative z-[1] overflow-hidden border-t border-white/10 text-white">
      {/* Ambient gradient */}
      <div className="bg-landing-cta/5 pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Col */}
          <div className="space-y-5 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="bg-landing-panel shadow-landing-cta/10 group-hover:border-landing-cta/40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 p-1.5 shadow-md transition-colors">
                <Image
                  src={brandAssets.logo}
                  alt="ISP Pay BD"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-landing-display group-hover:text-landing-accent text-xl font-bold tracking-tight text-white transition-colors">
                {siteConfig.name}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              {t('marketing.footer.description')}
            </p>

            {/* Quick Contact Badges */}
            <div className="space-y-2 pt-1 font-mono text-xs text-white/60">
              <div className="flex items-center gap-2.5">
                <Phone className="text-landing-cta h-3.5 w-3.5 shrink-0" />
                <span>+880 1800-000000 (24/7 Hotline)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="text-landing-cta h-3.5 w-3.5 shrink-0" />
                <span>support@isppaybd.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="text-landing-cta h-3.5 w-3.5 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All Systems Operational · 99.9% Uptime
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 text-xs font-bold tracking-wider text-white uppercase">
              Platform Features
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              {footerColumns.product.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-landing-accent group inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{l.label}</span>
                    <ArrowUpRight className="text-landing-accent h-3 w-3 translate-x-0.5 -translate-y-0.5 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 text-xs font-bold tracking-wider text-white uppercase">
              Solutions &amp; Modules
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              {footerColumns.solutions.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-landing-accent group inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{l.label}</span>
                    <ArrowUpRight className="text-landing-accent h-3 w-3 translate-x-0.5 -translate-y-0.5 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-bold tracking-wider text-white uppercase">Company</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              {footerColumns.company.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-landing-accent group inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-white/10 pt-5">
              <Link
                href="/register"
                className="bg-landing-cta/15 border-landing-cta/30 text-landing-cta hover:bg-landing-cta inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:text-white"
              >
                <Sparkles className="h-3 w-3" />
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Compliance & Copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Bank-grade 256-bit SSL · BTRC Compliant Logging · ISO Standard</span>
          </div>
          <div>
            © {new Date().getFullYear()} {siteConfig.name}. {t('marketing.footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}
