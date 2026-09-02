import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
