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
  },
  methods: {
    paystation: '/images/methods/paystation.svg',
    shurjopay: '/images/methods/shurjopay.svg',
    eps: '/images/methods/eps.svg',
  },
} as const;
