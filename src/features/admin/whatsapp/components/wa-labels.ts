import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** Meta / WAHA status codes (APPROVED, delivered, WORKING…) in the active language; unknown codes stay as sent. */
export function waStatusLabel(t: Translate, status: string): string {
  const key = slug(status);
  return t(`admin.whatsapp.status.${key}`, t(`status.${key}`, status));
}
