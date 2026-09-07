'use client';

import { ContactSection } from '@/features/marketing/landing';

/**
 * Dedicated `/contact` route — reuses the landing contact composition
 * so marketing keeps one contact surface, two entry points.
 */
export function ContactPage() {
  return (
    <main className="bg-landing-bg min-h-[70vh]">
      <ContactSection />
    </main>
  );
}
