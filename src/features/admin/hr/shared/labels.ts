import type { useTranslations } from '@/i18n/locale-context';
import { titleCase } from './format';

type Translate = ReturnType<typeof useTranslations>;

/** Backend month names are English (`January`); the value stays English, only the label is localised. */
export function monthLabel(t: Translate, month: string): string {
  switch (month.toLowerCase()) {
    case 'january':
      return t('admin.hr.month.january', 'January');
    case 'february':
      return t('admin.hr.month.february', 'February');
    case 'march':
      return t('admin.hr.month.march', 'March');
    case 'april':
      return t('admin.hr.month.april', 'April');
    case 'may':
      return t('admin.hr.month.may', 'May');
    case 'june':
      return t('admin.hr.month.june', 'June');
    case 'july':
      return t('admin.hr.month.july', 'July');
    case 'august':
      return t('admin.hr.month.august', 'August');
    case 'september':
      return t('admin.hr.month.september', 'September');
    case 'october':
      return t('admin.hr.month.october', 'October');
    case 'november':
      return t('admin.hr.month.november', 'November');
    case 'december':
      return t('admin.hr.month.december', 'December');
    default:
      return month;
  }
}

/** Label for a backend status word (attendance, advance, payroll, installation). */
export function hrStatusLabel(t: Translate, status: string): string {
  const slug = status.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  switch (slug) {
    case 'successful':
      return t('admin.hr.status.successful', 'Successful');
    case 'deducted':
      return t('admin.hr.status.deducted', 'Deducted');
    case 'assigned':
      return t('admin.hr.status.assigned', 'Assigned');
    case 'leave':
      return t('admin.hr.status.leave', 'Leave');
    default:
      return t(`status.${slug}`, titleCase(status));
  }
}
