import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;

const titleCase = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—');

/** Status word (as the customer adapters spell it) in the active language; unknown words are shown title-cased. */
export function customerStatusLabel(t: Translate, status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return t('admin.customers.status.active', 'Active');
    case 'inactive':
      return t('admin.customers.status.inactive', 'Inactive');
    case 'expired':
      return t('admin.customers.status.expired', 'Expired');
    case 'suspended':
    case 'disconn':
      return t('admin.customers.status.disconnected', 'Disconnected');
    case 'conn':
      return t('admin.customers.status.connected', 'Connected');
    case 'online':
      return t('admin.customers.status.online', 'Online');
    case 'offline':
      return t('admin.customers.status.offline', 'Offline');
    case 'pending':
      return t('admin.customers.status.pending', 'Pending');
    case 'approved':
      return t('admin.customers.status.approved', 'Approved');
    case 'rejected':
      return t('admin.customers.status.rejected', 'Rejected');
    case 'verified':
      return t('admin.customers.status.verified', 'Verified');
    case 'paid':
    case 'successful':
    case 'completed':
      return t('admin.customers.status.paid', 'Paid');
    case 'failed':
      return t('admin.customers.status.failed', 'Failed');
    case 'new':
      return t('admin.customers.status.new', 'New');
    default:
      return titleCase(status);
  }
}
