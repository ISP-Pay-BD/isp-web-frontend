'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultLocale, isAppLocale, type AppLocale } from './config';
import { getMessage, interpolate, type TranslateVars } from './index';
import { setFormatLocale } from '@/lib/format';

interface LocaleContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  /**
   * `t('customer.pay.title', 'Pay your bill')` returns the Bangla message when the language is Bangla and the key
   * exists, otherwise the English fallback. `{name}` placeholders are filled from `vars`:
   * `t('customer.dash.left', '{n} days left', { n: 3 })`.
   */
  t: (key: string, fallbackOrVars?: string | TranslateVars, vars?: TranslateVars) => string;
  /**
   * Translates a validation message that comes from a zod schema (English text). The Bangla is looked up under
   * `validation.<slug>` where slug is the message lower-cased with non-alphanumerics replaced by `_`
   * ("Amount is required" -> `validation.amount_is_required`); unknown messages are returned as they are.
   */
  te: (message: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key, fallbackOrVars, vars) =>
    typeof fallbackOrVars === 'string' ? interpolate(fallbackOrVars, vars) : key,
  te: (message) => message,
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
  // Start from the default so server and first client render match; the saved choice applies after mount.
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);
  // Formatters (money, dates) read the active language from a module value; set it before children render.
  setFormatLocale(locale);

  useEffect(() => {
    const saved = readStoredLocale();
    if (saved !== defaultLocale) setLocaleState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.classList.toggle('font-bengali', locale === 'bn');
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback<LocaleContextType['t']>(
    (key, fallbackOrVars, vars) => {
      const message = getMessage(locale, key);
      if (message !== key) return interpolate(message, typeof fallbackOrVars === 'object' ? fallbackOrVars : vars);
      if (typeof fallbackOrVars === 'string') return interpolate(fallbackOrVars, vars);
      return key;
    },
    [locale],
  );

  const te = useCallback<LocaleContextType['te']>(
    (message) => {
      const key = `validation.${message.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
      const translated = getMessage(locale, key);
      return translated === key ? message : translated;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, te }), [locale, setLocale, t, te]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslations() {
  return useContext(LocaleContext).t;
}
