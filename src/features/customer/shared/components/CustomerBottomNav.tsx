'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  LifeBuoy,
  Gift,
  MoreHorizontal,
  CalendarCheck,
  Wifi,
  User,
  KeyRound,
  Package,
  Newspaper,
  PhoneCall,
  MessageCircle,
  Banknote,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSupportContact } from '../hooks/use-customer-account';
import { whatsappHref } from '@/lib/api/adapters/customer.adapter';
import { useTranslations } from '@/i18n/locale-context';

type NavTab = {
  key: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const activePrimaryTabs: NavTab[] = [
  { key: 'home', label: 'Home', href: '/customer/dashboard', icon: LayoutDashboard },
  { key: 'pay', label: 'Pay', href: '/customer/payments/pay', icon: CreditCard },
  { key: 'router', label: 'Wi-Fi', href: '/customer/router', icon: Wifi },
  { key: 'support', label: 'Support', href: '/customer/support', icon: LifeBuoy },
];

const expiredPrimaryTabs: NavTab[] = [
  { key: 'subscription', label: 'Subscription', href: '/customer/subscription', icon: CalendarCheck },
  { key: 'packages', label: 'Packages', href: '/customer/packages', icon: Package },
  { key: 'pay', label: 'Pay now', href: '/customer/payments/pay', icon: CreditCard },
  { key: 'payments', label: 'Payments', href: '/customer/payments', icon: Banknote },
];

type MoreLink = {
  key: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  desc: string;
};

const activeMoreLinks: MoreLink[] = [
  { key: 'subscription', label: 'My subscription', href: '/customer/subscription', icon: CalendarCheck, desc: 'Plan details, expiry & renewal' },
  { key: 'packages', label: 'Available packages', href: '/customer/packages', icon: Package, desc: 'Explore broadband speeds & upgrades' },
  { key: 'payments', label: 'Payment history', href: '/customer/payments', icon: Banknote, desc: 'Past invoices & receipts' },
  { key: 'rewards', label: 'Rewards', href: '/customer/rewards', icon: Gift, desc: 'Points, referrals & redeem' },
  { key: 'news', label: 'News & notices', href: '/customer/news', icon: Newspaper, desc: 'ISP maintenance & announcements' },
  { key: 'profile', label: 'My profile', href: '/customer/profile', icon: User, desc: 'Account details & contact information' },
  { key: 'password', label: 'Change password', href: '/customer/change-password', icon: KeyRound, desc: 'Update portal password' },
];

const expiredMoreLinks: MoreLink[] = [
  { key: 'subscription', label: 'My subscription', href: '/customer/subscription', icon: CalendarCheck, desc: 'Renew your broadband plan' },
  { key: 'packages', label: 'Available packages', href: '/customer/packages', icon: Package, desc: 'Choose a package to reconnect' },
  { key: 'payments', label: 'Payment history', href: '/customer/payments', icon: Banknote, desc: 'Past invoices & receipts' },
];

export function CustomerBottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isExpired = user?.status === 'inactive';
  const { data: support } = useSupportContact();
  const whatsapp = support?.whatsapp ? whatsappHref(support.whatsapp) : '';

  const primaryTabs = isExpired ? expiredPrimaryTabs : activePrimaryTabs;
  const moreLinks = isExpired ? expiredMoreLinks : activeMoreLinks;

  const moreIsActive = useMemo(() => {
    const moreHrefs = moreLinks.map((l) => l.href);
    return moreHrefs.some((href) => pathname === href || pathname.startsWith(href + '/'));
  }, [moreLinks, pathname]);

  return (
    <>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('customer.nav.whatsapp', 'WhatsApp support')}
          className="bg-[#25D366] fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-[var(--shadow-md)] transition-transform hover:scale-[1.03] active:scale-95 md:bottom-6"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      <nav
        aria-label={t('customer.nav.label', 'Main')}
        className="bg-background/95 border-border/70 fixed right-0 bottom-0 left-0 z-30 flex min-h-16 items-stretch justify-around border-t px-1 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-sm)] backdrop-blur-md md:hidden"
      >
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.25]')} />
              <span className="text-xs tracking-tight">{t(`customer.nav.tab.${tab.key}`, tab.label)}</span>
            </Link>
          );
        })}

        {!isExpired && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              className={cn(
                'flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 transition-colors',
                moreIsActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs tracking-tight">{t('customer.nav.more', 'More')}</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl p-4 pt-2">
              <SheetHeader className="border-border/60 border-b pb-3 text-left">
                <SheetTitle className="flex items-center justify-between text-base font-semibold">
                  <span>{t('customer.nav.menu', 'Menu')}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {t('customer.nav.id', 'ID')}: {user?.id ?? '—'}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-3 grid gap-1.5 overflow-y-auto max-h-[60vh] pb-4">
                {moreLinks.map((item) => {
                  const Icon = item.icon;
                  const isCur = pathname === item.href;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex min-h-14 items-center gap-3.5 rounded-xl p-2.5 transition-colors',
                        isCur ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground',
                      )}
                    >
                      <div className={cn('rounded-lg p-2', isCur ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{t(`customer.nav.more_${item.key}`, item.label)}</div>
                        <div className="text-xs text-muted-foreground truncate">{t(`customer.nav.more_${item.key}_desc`, item.desc)}</div>
                      </div>
                    </Link>
                  );
                })}

                {support?.mobile && (
                  <a
                    href={`tel:${support.mobile}`}
                    className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground px-2"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-primary" />
                    <span>{t('customer.nav.helpline', 'Helpline')}: {support.mobile}</span>
                  </a>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </>
  );
}
