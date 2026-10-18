import type { useTranslations } from '@/i18n/locale-context';
import { METHOD_LABEL } from './mappers';
import type { LedgerStatus, MethodKey } from '../types';

type Translate = ReturnType<typeof useTranslations>;

/** Ledger status in the active language (the StatusBadge `status` stays the English word for its tone). */
export function ledgerStatusLabel(t: Translate, status: LedgerStatus): string {
  switch (status) {
    case 'completed':
      return t('admin.customerPayments.status.paid', 'Paid');
    case 'pending':
      return t('admin.customerPayments.status.pending', 'Pending');
    default:
      return t('admin.customerPayments.status.failed', 'Failed');
  }
}

/** Payment method chip text in the active language; gateway names (bKash, Nagad, ...) stay as they are. */
export function paymentMethodLabel(t: Translate, row: { methodRaw: string; method: MethodKey }): string {
  if (!row.methodRaw) return '—';
  switch (row.method) {
    case 'cash':
      return t('admin.customerPayments.method.cash', 'Cash');
    case 'bank':
      return t('admin.customerPayments.method.bank', 'Bank');
    case 'card':
      return t('admin.customerPayments.method.card', 'Card / gateway');
    case 'other':
      return row.methodRaw;
    default:
      return METHOD_LABEL[row.method];
  }
}
