/**
 * The language the portals format numbers and dates for. `LocaleProvider` keeps it in sync with the user's choice.
 * Digits stay Latin in both languages (`-u-nu-latn`): amounts, TrxIDs and phone numbers read the same everywhere,
 * while grouping (lakh/crore) and month names follow the language.
 */
export type FormatLocale = 'en' | 'bn';

let current: FormatLocale = 'en';

export function setFormatLocale(locale: FormatLocale) {
  current = locale;
}

/** Indian-style grouping (48,25,000), which is how Bangladeshi operators read money. */
export function numberLocale(): string {
  return current === 'bn' ? 'bn-BD-u-nu-latn' : 'en-IN';
}

export function dateLocale(): string {
  return current === 'bn' ? 'bn-BD-u-nu-latn' : 'en-GB';
}

export function isBangla(): boolean {
  return current === 'bn';
}
