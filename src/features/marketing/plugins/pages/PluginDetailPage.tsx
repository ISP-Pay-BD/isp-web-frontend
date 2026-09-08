'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Puzzle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Reveal } from '@/components/motion/Reveal';

const catalog: Record<string, { name: string; blurb: string; price: string }> = {
  whatsapp: {
    name: 'WhatsApp Business',
    blurb: 'Opt-in messaging, templates, and payment reminders on WhatsApp.',
    price: '৳2,500 / mo',
  },
  ai: {
    name: 'AI Support Assist',
    blurb: 'Draft ticket replies and suggest root-cause from session history.',
    price: '৳1,800 / mo',
  },
  default: {
    name: 'ISP Plugin',
    blurb: 'Extend billing, network, or customer experience with modular addons.',
    price: 'Contact sales',
  },
};

export function PluginDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? 'default';
  const plugin = catalog[slug] ?? { ...catalog.default, name: slug.replace(/-/g, ' ') };

  return (
    <div className="min-h-dvh bg-landing-bg text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Reveal>
          <Link href="/plugins" className="text-sm text-white/50 underline hover:text-white">
            ← All plugins
          </Link>
          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-landing-cta/20">
              <Puzzle className="h-7 w-7 text-landing-cta" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight capitalize">{plugin.name}</h1>
              <p className="mt-2 max-w-xl text-white/60">{plugin.blurb}</p>
              <p className="mt-4 text-lg font-medium text-landing-cta">{plugin.price}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="bg-landing-cta duration-200 ease-out hover:bg-landing-cta-hover"
                  onClick={() => toast.success('Addon requested (mock)')}
                >
                  Request enable
                </Button>
                <Link href="/register" className={cn(buttonVariants({ variant: 'outline' }), 'border-white/20 text-white')}>
                  Start trial
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
