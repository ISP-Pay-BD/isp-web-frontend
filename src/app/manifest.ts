import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/** Lets customers and collectors add the portal to their phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'ISP Pay BD',
    description: siteConfig.description,
    start_url: '/login',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0118',
    theme_color: '#f75803',
    icons: [
      { src: '/images/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/images/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/images/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/images/brand/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
