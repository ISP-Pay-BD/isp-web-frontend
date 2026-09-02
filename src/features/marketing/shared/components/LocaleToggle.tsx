'use client';

import { useLocale } from '../context/LocaleContext';

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-full px-2.5 py-1 font-medium transition-all ${
          locale === 'en'
            ? 'bg-landing-cta text-white shadow-sm'
            : 'text-white/70 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('bn')}
        className={`rounded-full px-2.5 py-1 font-medium font-bengali transition-all ${
          locale === 'bn'
            ? 'bg-landing-cta text-white shadow-sm'
            : 'text-white/70 hover:text-white'
        }`}
        aria-label="বাংলায় পরিবর্তন করুন"
      >
        বাং
      </button>
    </div>
  );
}
