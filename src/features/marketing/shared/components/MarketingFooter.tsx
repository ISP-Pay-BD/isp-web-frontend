import Link from 'next/link';
import Image from 'next/image';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Plugins', href: '/plugins' },
    { label: 'Register', href: '/register' },
  ],
  company: [
    { label: 'Contact', href: '/contact' },
    { label: 'Login', href: '/login' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-landing-bg text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <Image src={brandAssets.logo} alt="" width={40} height={40} />
            <span className="font-landing-display text-lg font-bold">{siteConfig.name}</span>
          </Link>
          <p className="text-sm text-white/70 max-w-md">
            Multi-tenant ISP billing, MikroTik sync, and bKash/Nagad reconciliation — built for
            Bangladesh ISPs.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Product</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {footerLinks.product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-landing-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {[...footerLinks.company, ...footerLinks.legal].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-landing-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
