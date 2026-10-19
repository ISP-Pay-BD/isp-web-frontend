'use client';

import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/locale-context';

/** EN | বাং switch. `portal` follows the app theme tokens; `marketing` is for the dark landing nav. */
export function LocaleToggle({ variant = 'marketing', className }: { variant?: 'marketing' | 'portal'; className?: string }) {
  const { locale, setLocale } = useLocale();
  const portal = variant === 'portal';
  const item = (active: boolean) =>
    cn(
      'rounded-full px-2.5 py-1 font-medium transition-colors',
      active
        ? portal
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-landing-cta text-white shadow-sm'
        : portal
          ? 'text-muted-foreground hover:text-foreground'
          : 'text-white/70 hover:text-white',
    );

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center rounded-full border p-0.5 text-xs',
        portal ? 'border-border bg-muted/40' : 'border-white/15 bg-white/5',
        className,
      )}
    >
      <button type="button" onClick={() => setLocale('en')} aria-pressed={locale === 'en'} className={item(locale === 'en')} aria-label="Switch to English">
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('bn')}
        aria-pressed={locale === 'bn'}
        className={cn(item(locale === 'bn'), 'font-bengali')}
        aria-label="বাংলায় পরিবর্তন করুন"
      >
        বাং
      </button>
    </div>
  );
}
