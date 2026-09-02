export const locales = ['en', 'bn'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

export const localeLabels: Record<AppLocale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
