/**
 * Font registry — where each font is loaded and how to use it in UI.
 * Load order: `@/styles/fonts/index.css` via `src/lib/fonts.ts`
 *
 * Full guide: docs/FONTS.md
 */
export const fonts = {
  /** Marketing hero, section titles, pricing headlines */
  landingDisplay: {
    family: 'Plus Jakarta Sans Variable',
    cssVar: '--font-landing-display',
    className: 'font-landing-display',
    load: 'src/styles/fonts/plus-jakarta-sans.css',
    files: 'public/fonts/plus-jakarta-sans/plus-jakarta-sans-latin.woff2',
    surfaces: ['marketing'],
    routes: ['/', '/pricing', '/plugins', '/about', '/contact'],
  },
  /** Marketing paragraphs, nav links, footer, FAQ body */
  landingBody: {
    family: 'Inter Variable',
    cssVar: '--font-landing-body',
    className: 'font-landing-body',
    load: 'src/styles/fonts/inter.css',
    files: 'public/fonts/inter/inter-latin.woff2',
    surfaces: ['marketing'],
    routes: ['/', '/pricing', '/plugins', '/about', '/contact'],
  },
  /** Admin, customer, platform, employee — all portal UI */
  portalSans: {
    family: 'Satoshi',
    cssVar: '--font-portal-sans',
    className: 'font-portal',
    load: 'src/styles/fonts/satoshi.css',
    files: 'public/fonts/satoshi/*.woff2',
    surfaces: ['admin', 'customer', 'platform', 'employee', 'auth'],
    routes: ['/admin/*', '/customer/*', '/platform/*', '/employee/*', '/login'],
  },
  /** Bengali copy when locale is `bn` */
  bengali: {
    family: 'Noto Sans Bengali',
    cssVar: '--font-bengali',
    className: 'font-bengali',
    load: 'src/styles/fonts/noto-sans-bengali.css',
    files: 'public/fonts/noto-sans-bengali/*.woff2',
    surfaces: ['all'],
    routes: ['* when locale=bn'],
  },
  /** Invoice no, TrxID, IP, MAC, code snippets */
  mono: {
    family: 'IBM Plex Mono',
    cssVar: '--font-portal-mono',
    className: 'font-mono',
    load: 'src/styles/fonts/ibm-plex-mono.css',
    files: 'public/fonts/ibm-plex-mono/*.woff2',
    surfaces: ['all'],
    routes: ['tables, invoices, network ops, payment receipts'],
  },
} as const;

/** Font family CSS variables — applied on `<html>` in root layout */
export const fontVariables = {
  landingDisplay: 'var(--font-landing-display)',
  landingBody: 'var(--font-landing-body)',
  portalSans: 'var(--font-portal-sans)',
  portalMono: 'var(--font-portal-mono)',
  bengali: 'var(--font-bengali)',
} as const;

/** Do NOT use these fonts */
export const fontsForbidden = ['Roboto', 'Open Sans', 'Geist Sans', 'DM Sans'] as const;
