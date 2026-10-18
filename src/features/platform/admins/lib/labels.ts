import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

export function statusLabel(t: Translate, value: string): string {
  return t(`status.${value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`, value);
}

export function planTypeLabel(t: Translate, value: string, long = false): string {
  switch (value) {
    case 'fixed':
      return long ? t('platform.admins.plan.fixedLong', 'Fixed (prepaid period)') : t('platform.admins.plan.fixed', 'Fixed');
    case 'payg':
      return long ? t('platform.admins.plan.paygLong', 'Pay-As-You-Go (wallet)') : t('platform.admins.plan.payg', 'PAYG');
    case 'custom':
      return long ? t('platform.admins.plan.customLong', 'Custom (one tenant)') : t('platform.admins.plan.custom', 'Custom');
    default:
      return value;
  }
}

export function intervalLabel(t: Translate, value: string): string {
  switch (value) {
    case 'weekly':
      return t('platform.admins.interval.weekly', 'Weekly');
    case 'monthly':
      return t('platform.admins.interval.monthly', 'Monthly');
    case 'yearly':
      return t('platform.admins.interval.yearly', 'Yearly');
    default:
      return value;
  }
}

export function intervalUnit(t: Translate, value: string): string {
  switch (value) {
    case 'weekly':
      return t('platform.admins.unit.weekly', 'week');
    case 'monthly':
      return t('platform.admins.unit.monthly', 'month');
    case 'yearly':
      return t('platform.admins.unit.yearly', 'year');
    default:
      return value;
  }
}
