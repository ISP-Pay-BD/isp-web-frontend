/** Local static asset paths — no CDN */
export const brandAssets = {
  logo: '/images/brand/logo.svg',
  logoMark: '/images/brand/logo.svg',
  favicon: '/favicon.ico',
  ogImage: '/images/brand/og-image.png',
} as const;

export const landingAssets = {
  logos: {
    sslcommerz: '/images/landing/logos/sslcommerz.svg',
    telegram: '/images/landing/logos/telegram.svg',
    mikrotik: '/images/landing/logos/mikrotik.svg',
    bkash: '/images/landing/logos/bkash.svg',
    nagad: '/images/landing/logos/nagad.svg',
  },
  /** Real screenshots of the branded subscriber app. */
  appScreens: {
    home: '/images/app_images/client/WhatsApp Image 2026-04-23 at 11.40.35 PM.jpeg',
    payment: '/images/app_images/admin/img1.png',
  },
  methods: {
    paystation: '/images/methods/paystation.svg',
    shurjopay: '/images/methods/shurjopay.svg',
    eps: '/images/methods/eps.svg',
  },
} as const;
