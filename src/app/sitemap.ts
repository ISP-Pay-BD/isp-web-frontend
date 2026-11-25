import type { MetadataRoute } from 'next';

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/blog',
  '/templates',
  '/contact',
  '/help',
  '/status',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isppaybd.com').replace(/\/$/, '');
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '/' || route === '/blog' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route === '/pricing' ? 0.9 : 0.7,
  }));
}
