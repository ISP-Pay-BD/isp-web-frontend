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
  Router,
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

type NavTab = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const activePrimaryTabs: NavTab[] = [
  { label: 'Home', href: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'Pay', href: '/customer/payments/pay', icon: CreditCard },
  { label: 'Support', href: '/customer/support', icon: LifeBuoy },
  { label: 'Rewards', href: '/customer/rewards', icon: Gift },
];

const expiredPrimaryTabs: NavTab[] = [
  { label: 'Subscription', href: '/customer/subscription', icon: CalendarCheck },
  { label: 'Packages', href: '/customer/packages', icon: Package },
  { label: 'Pay Now', href: '/customer/payments/pay', icon: CreditCard },
  { label: 'Payments', href: '/customer/payments', icon: Banknote },
];

type MoreLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  desc: string;
};

const activeMoreLinks: MoreLink[] = [
  { label: 'My Subscription', href: '/customer/subscription', icon: CalendarCheck, desc: 'Plan details, expiry & data quota' },
  { label: 'Available Packages', href: '/customer/packages', icon: Package, desc: 'Explore broadband speeds & upgrades' },
  { label: 'Payment History', href: '/customer/payments', icon: CreditCard, desc: 'Past invoices & receipts' },
  { label: 'Router & WiFi', href: '/customer/router', icon: Router, desc: 'Tools, connected devices & passwords' },
  { label: 'News & Notices', href: '/customer/news', icon: Newspaper, desc: 'ISP maintenance & announcements' },
  { label: 'Customer Profile', href: '/customer/profile', icon: User, desc: 'Account details & contact information' },
  { label: 'Change Password', href: '/customer/change-password', icon: KeyRound, desc: 'Update portal password' },
];

const expiredMoreLinks: MoreLink[] = [
  { label: 'My Subscription', href: '/customer/subscription', icon: CalendarCheck, desc: 'Renew your broadband plan' },
  { label: 'Available Packages', href: '/customer/packages', icon: Package, desc: 'Choose a package to reconnect' },
  { label: 'Payment History', href: '/customer/payments', icon: CreditCard, desc: 'Past invoices & receipts' },
  { label: 'Pay Now', href: '/customer/payments/pay', icon: CreditCard, desc: 'Recharge via bKash or Nagad' },
];

export function CustomerBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isExpired = user?.status === 'inactive';

  const primaryTabs = isExpired ? expiredPrimaryTabs : activePrimaryTabs;
  const moreLinks = isExpired ? expiredMoreLinks : activeMoreLinks;

  const moreIsActive = useMemo(() => {
    const moreHrefs = moreLinks.map((l) => l.href);
    return moreHrefs.some((href) => pathname === href || pathname.startsWith(href + '/'));
  }, [moreLinks, pathname]);

  return (
    <>
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        className="fixed right-4 bottom-20 md:bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition-transform active:scale-95 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur-md px-2 py-1 md:hidden">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {!isExpired && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors',
                moreIsActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[11px] tracking-tight">More</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] p-4 pt-2">
              <SheetHeader className="text-left pb-3 border-b">
                <SheetTitle className="text-base font-bold flex items-center justify-between">
                  <span>Customer Menu</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ID: {user?.id ?? 'cust_001'}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-3 grid gap-1.5 overflow-y-auto max-h-[60vh] pb-4">
                {moreLinks.map((item) => {
                  const Icon = item.icon;
                  const isCur = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3.5 rounded-xl p-2.5 transition-colors',
                        isCur ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground',
                      )}
                    >
                      <div className={cn('rounded-lg p-2', isCur ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground px-2">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-3.5 w-3.5 text-primary" />
                    <span>NOC Helpline: 01700-000000</span>
                  </div>
                  <span>v2.1</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </>
  );
}
