import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isppaybd.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/blog', '/templates', '/contact', '/help', '/status', '/privacy', '/terms'],
        disallow: ['/admin/', '/platform/', '/employee/', '/customer/', '/api/'],
      },
    ],
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
