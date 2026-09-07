'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Puzzle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-[#0c0118] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/plugins" className="text-sm text-white/50 underline hover:text-white">
          ← All plugins
        </Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f75803]/20">
            <Puzzle className="h-7 w-7 text-[#f75803]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight capitalize">{plugin.name}</h1>
            <p className="mt-2 max-w-xl text-white/60">{plugin.blurb}</p>
            <p className="mt-4 text-lg font-medium text-[#f75803]">{plugin.price}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-[#f75803] hover:bg-[#f75803]/90" onClick={() => toast.success('Addon requested (mock)')}>
                Request enable
              </Button>
              <Link href="/contact" className={cn(buttonVariants({ variant: 'outline' }), 'border-white/20 bg-transparent text-white hover:bg-white/10')}>
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
