'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-landing-panel/95 p-3 backdrop-blur-md md:hidden">
      <Link href="/register">
        <Button className="bg-landing-cta hover:bg-landing-cta-hover h-12 w-full text-base font-semibold text-white">
          Start free trial — no card required
        </Button>
      </Link>
    </div>
  );
}
