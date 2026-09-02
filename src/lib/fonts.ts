import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/noto-sans-bengali/400.css';
import '@fontsource/noto-sans-bengali/500.css';
import '@fontsource/noto-sans-bengali/600.css';
import '@fontsource/noto-sans-bengali/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

/** Font family CSS variables — applied on `<html>` in root layout */
export const fontVariables = {
  landingDisplay: 'var(--font-landing-display)',
  landingBody: 'var(--font-landing-body)',
  portalSans: 'var(--font-portal-sans)',
  portalMono: 'var(--font-portal-mono)',
  bengali: 'var(--font-bengali)',
} as const;
