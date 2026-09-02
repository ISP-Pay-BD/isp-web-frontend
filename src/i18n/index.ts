export { locales, defaultLocale, localeLabels, isAppLocale, type AppLocale } from './config';

import en from './messages/en.json';
import bn from './messages/bn.json';
import type { AppLocale } from './config';

export const messages = { en, bn } as const;

export type Messages = typeof en;

/** Simple nested key lookup: `marketing.hero.title` */
export function getMessage(locale: AppLocale, path: string): string {
  const parts = path.split('.');
  let node: unknown = messages[locale];
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === 'string' ? node : path;
}
