'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultLocale, isAppLocale, type AppLocale } from '@/i18n/config';
import { getMessage } from '@/i18n';

interface LocaleContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback ?? key,
});

const STORAGE_KEY = 'ipb_locale';

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return defaultLocale;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isAppLocale(saved)) return saved;
  } catch {
    // ignore
  }
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: AppLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    const msg = getMessage(locale, key);
    if (msg === key && fallback) {
      return fallback;
    }
    return msg;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      <div className={locale === 'bn' ? 'font-bengali' : ''}>{children}</div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslations() {
  const { t } = useContext(LocaleContext);
  return t;
}
