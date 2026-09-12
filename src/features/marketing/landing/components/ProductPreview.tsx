'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Zap
} from 'lucide-react';
import { useMotionSafe, easeOutExpo } from '@/lib/animations';
import { Reveal, RevealItem } from '@/components/motion/Reveal';

interface ShowcaseItem {
  id: string;
  name: string;
  badge?: string;
  bullets: string[];
  kpis: { label: string; value: string }[];
  images: { url: string; caption: string }[];
}

const WEBSITE_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'billing',
    name: 'Billing & Cashbook',
    badge: 'Core Engine',
    bullets: [
      'Automated monthly invoice generation with instant SMS & WhatsApp alerts',
      'Instant bKash, Nagad & Rocket payment reconciliation matched to client TrxID',
      'Automated due disconnect at midnight & instant line reconnect upon payment',
    ],
    kpis: [
      { label: 'Reconciliation Speed', value: '< 1 sec' },
      { label: 'Auto-Match Rate', value: '99.8%' },
    ],
    images: [
      {
        url: '/images/product_images/desktop/1785437791_c9bf6c22e71339a59874.png',
        caption: '01 / 05 · Operator Executive Billing & Due Collection Dashboard',
      },
      {
        url: '/images/product_images/desktop/1785437785_22f6eaf877266663e2c8.png',
        caption: '02 / 05 · Real-time Payment Gateway Transactions & Auto-Match Ledger',
      },
      {
        url: '/images/product_images/desktop/1785437813_1848bd32502231c65628.png',
        caption: '03 / 05 · Printable Pos & A4 Invoices with QR & bKash Dynamic URL',
      },
    ],
  },
  {
    id: 'mikrotik',
    name: 'MikroTik Sync',
    badge: 'Unlimited Routers',
    bullets: [
      'Real-time PPPoE, Hotspot, and Static IP user provisioning via RouterOS API',
      'Live online/offline ping status, uptime monitoring, and active traffic graphs',
      'One-click secret push, CoA disconnect, and bandwidth queue management',
    ],
    kpis: [
      { label: 'Sync Latency', value: '0.04s' },
      { label: 'Multi-Router Limit', value: 'Unlimited' },
    ],
    images: [
      {
        url: '/images/product_images/desktop/1785437809_d7576503c5854fcab857.png',
        caption: '01 / 03 · Live MikroTik PPPoE & Hotspot User Session Manager',
      },
      {
        url: '/images/product_images/all/1784392406_d6b7a85f9f273a1b28fe.png',
        caption: '02 / 03 · Router Health, CPU Load, Temperature & Interface Queues',
      },
    ],
  },
  {
    id: 'olt',
    name: 'Fiber OLT Manager',
    badge: 'Huawei & ZTE',
    bullets: [
      'Monitor GPON/EPON PON ports, optical Tx/Rx power dBm, and fiber loss',
      'Batch ONU auto-find, profile configuration, and remote reboot from console',
      'Optical link failure alerts with zone mapping to isolate physical fiber cuts',
    ],
    kpis: [
      { label: 'Supported OLTs', value: 'Huawei / ZTE' },
      { label: 'ONU Diagnostics', value: 'Rx/Tx dBm' },
    ],
    images: [
      {
        url: '/images/product_images/desktop/1785437805_cc6e90fdedddc835ae80.png',
        caption: '01 / 02 · Huawei & ZTE Optical Power Diagnostic Spectrum',
      },
      {
        url: '/images/product_images/all/1784392421_2dfc4581ec01abfb385d.png',
        caption: '02 / 02 · Fiber Port ONU Optical Power Table & Alert Queue',
      },
    ],
  },
  {
    id: 'reports',
    name: 'BTRC & Accounting',
    badge: 'Regulatory Ready',
    bullets: [
      'One-click BTRC compliant subscriber demographic, tariff, and IP log exports',
      'Double-entry accounting, chart of accounts, expenses, and staff payroll ledger',
      'Multi-POP reseller commission settlement and automated profit distributions',
    ],
    kpis: [
      { label: 'BTRC Formats', value: 'Excel / CSV' },
      { label: 'Audit Trail', value: '100% Traceable' },
    ],
    images: [
      {
        url: '/images/product_images/customer/1784392526_b16dc17e3053b7fa16f6.png',
        caption: '01 / 02 · Multi-Branch Financial Statement & BTRC Tariff Reporting',
      },
      {
        url: '/images/product_images/all/1784392428_3472cb22979f6b1a999c.png',
        caption: '02 / 02 · Reseller Commission Ledger & Revenue Growth Analytics',
      },
    ],
  },
];

const MOBILE_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'customer_app',
    name: 'Customer Self-Care',
    badge: 'Android & iOS',
    bullets: [
      'Subscriber balance check, active plan speed details & expiry countdown',
      '1-click instant payment renewal via bKash, Nagad, or debit cards',
      'In-app network speed test, diagnostic ping & support ticket management',
    ],
    kpis: [
      { label: 'Language', value: 'Bangla + Eng' },
      { label: 'Renewal', value: '1-Click Instant' },
    ],
    images: [
      {
        url: '/images/app_images/client/WhatsApp Image 2026-04-23 at 11.40.35 PM.jpeg',
        caption: '01 / 02 · Subscriber Self-Care Mobile App — Bill Pay & Live Speed',
      },
      {
        url: '/images/product_images/abscn/1784393182_d021cb1c5b9b23b0b8c2.png',
        caption: '02 / 02 · Branded Mobile Recharge Screen with Native bKash Flow',
      },
    ],
  },
  {
    id: 'reseller_app',
    name: 'POP Reseller Pocket App',
    badge: 'Field Console',
    bullets: [
      'POP sub-reseller wallet balance tracking and customer list management',
      'Instant package renewal on behalf of clients with automated margin deduct',
      'Real-time cash collection logging and daily transaction receipts',
    ],
    kpis: [
      { label: 'Role', value: 'Sub-Reseller' },
      { label: 'Instant Topup', value: 'Real-Time' },
    ],
    images: [
      {
        url: '/images/product_images/abscn/1784393202_9edb13dff841c4be9fec.png',
        caption: '01 / 01 · POP Reseller Pocket Balance & Quick Recharge Module',
      },
    ],
  },
];

export function ProductPreview() {
  const { reduced } = useMotionSafe();
  const [model, setModel] = useState<'website' | 'mobile'>('website');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const currentList = model === 'website' ? WEBSITE_SHOWCASE : MOBILE_SHOWCASE;
  const currentCategory = currentList[categoryIndex] ?? currentList[0];
  const images = currentCategory.images;
  const currentImage = images[imageIndex] ?? images[0];

  const handleModelChange = (newModel: 'website' | 'mobile') => {
    setModel(newModel);
    setCategoryIndex(0);
    setImageIndex(0);
  };

  const handleCategoryChange = (idx: number) => {
    setCategoryIndex(idx);
    setImageIndex(0);
  };

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="product-preview" className="relative z-[1] border-t border-white/10 bg-landing-bg py-24 md:py-36 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-landing-cta/5 blur-[160px]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-cta/20 bg-landing-cta/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-landing-cta">
              <Sparkles className="h-3.5 w-3.5" />
              Live Interactive Product Tour
            </span>
            <h2 className="font-landing-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              See it in action
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-2xl leading-relaxed">
              Explore authentic high-resolution screenshots of the ISP Pay BD operator console,
              MikroTik sync engine, fiber OLT diagnostics, and subscriber self-care apps.
            </p>
          </div>
        </Reveal>

        {/* Platform Switcher (Website vs Mobile) */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-white/15 bg-white/[0.03] p-1.5 backdrop-blur-xl shadow-lg">
            <button
              type="button"
              onClick={() => handleModelChange('website')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                model === 'website'
                  ? 'bg-landing-cta text-white shadow-md shadow-landing-cta/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>Operator Web Portal</span>
              <span className="hidden sm:inline-block text-[11px] font-normal opacity-80">(Admin &amp; Reseller)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModelChange('mobile')}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                model === 'mobile'
                  ? 'bg-landing-cta text-white shadow-md shadow-landing-cta/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile Apps</span>
              <span className="hidden sm:inline-block text-[11px] font-normal opacity-80">(Client &amp; Field)</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {currentList.map((cat, idx) => {
            const active = idx === categoryIndex;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(idx)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  active
                    ? 'border-landing-cta/40 bg-landing-cta/15 text-white shadow-sm'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    active ? 'bg-landing-cta/30 text-white' : 'bg-white/5 text-white/40'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Showcase Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${model}-${currentCategory.id}`}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="mt-10 grid gap-8 lg:grid-cols-12 items-center"
          >
            {/* Left Detail Description & KPIs */}
            <div className="space-y-6 lg:col-span-4 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-landing-accent">
                  <Layers className="h-3.5 w-3.5" />
                  Module #{categoryIndex + 1}
                </div>
                <h3 className="font-landing-display mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentCategory.name}
                </h3>
              </div>

              {/* Bullets */}
              <ul className="space-y-3 pt-1">
                {currentCategory.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-white/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-landing-cta mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {currentCategory.kpis.map((k) => (
                  <div key={k.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-sm">
                    <p className="font-mono text-lg font-bold text-white tracking-tight">{k.value}</p>
                    <p className="mt-1 text-[11px] text-white/50">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Screen Device Preview Frame */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-landing-panel/90 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {/* Browser / Device Frame Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono text-white/50 max-w-[240px] sm:max-w-xs truncate">
                    <Shield className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{model === 'website' ? 'https://app.isppaybd.com' : 'ISP Pay BD Client Mobile Engine'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live 4K</span>
                  </div>
                </div>

                {/* Screenshot Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImage.url}
                      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={currentImage.url}
                        alt={currentImage.caption || currentCategory.name}
                        fill
                        className="object-contain object-center p-2 sm:p-4 transition-transform duration-500 group-hover:scale-[1.01]"
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows if multi images */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        aria-label="Previous screenshot"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-landing-cta hover:border-landing-cta hover:scale-110 shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        aria-label="Next screenshot"
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-landing-cta hover:border-landing-cta hover:scale-110 shadow-lg"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom Caption Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/50 px-4 py-3 text-xs">
                  <span className="font-mono text-white/70 truncate max-w-md">
                    {currentImage.caption}
                  </span>

                  {/* Image Thumb Dots / Index */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      {images.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setImageIndex(dotIdx)}
                          className={`h-2 rounded-full transition-all ${
                            dotIdx === imageIndex
                              ? 'w-6 bg-landing-cta'
                              : 'w-2 bg-white/30 hover:bg-white/50'
                          }`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

