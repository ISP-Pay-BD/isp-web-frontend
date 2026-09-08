/**
 * Tenant / brand theme tokens for multi-tenant SaaS.
 * Defaults match ISP Pay BD. Override per tenant when platform sets branding.
 */

export interface TenantTheme {
  /** Primary CTA / buttons — ISP vermilion */
  primary: string;
  primaryHover: string;
  /** Marketing page background */
  landingBg: string;
  landingPanel: string;
  /** Accent / links — same family as primary (single accent system) */
  accent: string;
  /** Admin sidebar */
  sidebar: string;
  /** Optional logo override (URL path under /public or CDN later) */
  logoUrl?: string;
  /** Display name override */
  brandName?: string;
}

/** Default ISP Pay BD brand — deep ink + restrained orange (no purple/blue dual accent) */
export const defaultTenantTheme: TenantTheme = {
  primary: '#e85a1a',
  primaryHover: '#d14e14',
  landingBg: '#0a0c10',
  landingPanel: '#12161d',
  accent: '#e85a1a',
  sidebar: '#10141a',
  logoUrl: '/images/brand/logo.svg',
  brandName: 'ISP Pay BD',
};

/**
 * CSS variables to inject on `:root` or a tenant wrapper.
 * Use with inline style or a small effect that sets documentElement styles.
 */
export function themeToCssVars(theme: TenantTheme): Record<string, string> {
  return {
    '--landing-bg': theme.landingBg,
    '--landing-panel': theme.landingPanel,
    '--landing-cta': theme.primary,
    '--landing-cta-hover': theme.primaryHover,
    '--landing-accent': theme.accent,
    '--tenant-primary': theme.primary,
    '--tenant-sidebar': theme.sidebar,
  };
}

/** Merge tenant branding over defaults (nullish fields keep default) */
export function resolveTenantTheme(partial?: Partial<TenantTheme> | null): TenantTheme {
  return { ...defaultTenantTheme, ...partial };
}
