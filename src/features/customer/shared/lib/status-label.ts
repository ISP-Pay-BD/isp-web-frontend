import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

const titleCase = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—');

/** A status word as the zapi adapters spell it, in the active language; unknown words are shown title-cased. */
export function statusLabel(t: Translate, status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return t('customer.common.status.active', 'Active');
    case 'inactive':
      return t('customer.common.status.inactive', 'Inactive');
    case 'expired':
      return t('customer.common.status.expired', 'Expired');
    case 'pending':
      return t('customer.common.status.pending', 'Pending');
    case 'suspended':
      return t('customer.common.status.suspended', 'Suspended');
    case 'paid':
      return t('customer.common.status.paid', 'Paid');
    case 'online':
      return t('customer.common.status.online', 'Online');
    case 'offline':
      return t('customer.common.status.offline', 'Offline');
    case 'open':
      return t('customer.common.status.open', 'Open');
    case 'closed':
      return t('customer.common.status.closed', 'Closed');
    case 'conn':
    case 'connected':
      return t('customer.common.status.connected', 'Connected');
    case 'disconn':
    case 'disconnected':
      return t('customer.common.status.disconnected', 'Disconnected');
    default:
      return titleCase(status);
  }
}
